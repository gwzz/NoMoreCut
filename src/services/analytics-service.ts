import { baseAnalyticsYear } from "@/lib/constants";
import { roundMoney, safeRatio, toNumber } from "@/lib/number";
import {
  tables,
  throwSupabaseError,
  toIsoTimestamp,
  type InvestmentRecord,
  type PortfolioSnapshotRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/services/portfolio-service";
import {
  calculateAssetValueMap,
  summarizeAllocation
} from "@/services/portfolio-calculations";
import { listRawAssets } from "@/services/asset-service";
import { listGoals } from "@/services/goal-service";
import { listRawInvestments } from "@/services/investment-service";
import type { GoalProgress, MonthlyCashflowDatum, ProfitTrendDatum } from "@/types/domain";

export async function getAllocationData(userId: string) {
  const [assets, investments] = await Promise.all([
    listRawAssets(userId).then((items) => items.filter((asset) => !asset.isArchived)),
    listRawInvestments(userId)
  ]);

  const assetValue = calculateAssetValueMap(assets, investments);
  return summarizeAllocation(assets, assetValue.values);
}

export async function getMonthlyCashflow(userId: string, year = baseAnalyticsYear): Promise<MonthlyCashflowDatum[]> {
  const supabase = await createClient();
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const { data, error } = await supabase
    .from(tables.investments)
    .select("*")
    .eq("userId", userId)
    .gte("tradeDate", start.toISOString())
    .lt("tradeDate", end.toISOString())
    .order("tradeDate", { ascending: true });

  throwSupabaseError(error);

  const investments = (data ?? []) as InvestmentRecord[];
  const months: MonthlyCashflowDatum[] = Array.from({ length: 12 }, (_, index) => ({
    month: `${index + 1}月`,
    buy: 0,
    sell: 0,
    dividend: 0,
    net: 0
  }));

  for (const investment of investments) {
    const index = new Date(toIsoTimestamp(investment.tradeDate)).getUTCMonth();
    const amount = toNumber(investment.amount);
    const fee = toNumber(investment.fee);
    const month = months[index];

    if (investment.type === "BUY") {
      month.buy += amount + fee;
    }

    if (investment.type === "SELL") {
      month.sell += Math.max(amount - fee, 0);
    }

    if (investment.type === "DIVIDEND") {
      month.dividend += amount;
    }
  }

  return months.map((month) => ({
    ...month,
    buy: roundMoney(month.buy),
    sell: roundMoney(month.sell),
    dividend: roundMoney(month.dividend),
    net: roundMoney(month.buy - month.sell + month.dividend)
  }));
}

export async function getProfitTrend(userId: string): Promise<ProfitTrendDatum[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.portfolioSnapshots)
    .select("*")
    .eq("userId", userId)
    .order("snapshotDate", { ascending: true });

  throwSupabaseError(error);

  return ((data ?? []) as PortfolioSnapshotRecord[]).map((snapshot) => ({
    date: toIsoTimestamp(snapshot.snapshotDate),
    totalValue: toNumber(snapshot.totalValue),
    principal: toNumber(snapshot.principal),
    profit: toNumber(snapshot.profit),
    roi: toNumber(snapshot.roi)
  }));
}

export async function getGoalProgress(userId: string, summary?: { totalValue: number }): Promise<GoalProgress[]> {
  const [portfolioSummary, goals] = await Promise.all([
    summary ? Promise.resolve(summary) : getDashboardSummary(userId),
    listGoals(userId)
  ]);

  const today = Date.now();

  return goals.map((goal) => {
    const start = new Date(goal.startDate).getTime();
    const target = new Date(goal.targetDate).getTime();
    const currentValue = portfolioSummary.totalValue;
    const targetAmount = goal.targetAmount;

    return {
      id: goal.id,
      name: goal.name,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      targetAmount,
      currentValue,
      amountProgress: Math.min(safeRatio(currentValue, targetAmount), 1),
      timeProgress: Math.min(Math.max(safeRatio(today - start, target - start), 0), 1),
      remainingAmount: Math.max(roundMoney(targetAmount - currentValue), 0)
    };
  });
}
