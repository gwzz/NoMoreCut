import { prisma } from "@/lib/prisma";
import { baseAnalyticsYear } from "@/lib/constants";
import { roundMoney, safeRatio, toNumber } from "@/lib/number";
import { getDashboardSummary } from "@/services/portfolio-service";
import {
  calculateAssetValueMap,
  summarizeAllocation
} from "@/services/portfolio-calculations";
import type { GoalProgress, MonthlyCashflowDatum, ProfitTrendDatum } from "@/types/domain";

export async function getAllocationData(userId: string) {
  const [assets, investments] = await Promise.all([
    prisma.asset.findMany({
      include: { category: true },
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" }
    }),
    prisma.investment.findMany({
      where: { userId },
      orderBy: { tradeDate: "asc" }
    })
  ]);

  const assetValue = calculateAssetValueMap(assets, investments);
  return summarizeAllocation(assets, assetValue.values);
}

export async function getMonthlyCashflow(userId: string, year = baseAnalyticsYear): Promise<MonthlyCashflowDatum[]> {
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const investments = await prisma.investment.findMany({
    where: {
      userId,
      tradeDate: {
        gte: start,
        lt: end
      }
    },
    orderBy: { tradeDate: "asc" }
  });

  const months: MonthlyCashflowDatum[] = Array.from({ length: 12 }, (_, index) => ({
    month: `${index + 1}月`,
    buy: 0,
    sell: 0,
    dividend: 0,
    net: 0
  }));

  for (const investment of investments) {
    const index = investment.tradeDate.getUTCMonth();
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
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: "asc" }
  });

  return snapshots.map((snapshot) => ({
    date: snapshot.snapshotDate.toISOString(),
    totalValue: toNumber(snapshot.totalValue),
    principal: toNumber(snapshot.principal),
    profit: toNumber(snapshot.profit),
    roi: toNumber(snapshot.roi)
  }));
}

export async function getGoalProgress(userId: string, summary?: { totalValue: number }): Promise<GoalProgress[]> {
  const [portfolioSummary, goals] = await Promise.all([
    summary ? Promise.resolve(summary) : getDashboardSummary(userId),
    prisma.investmentGoal.findMany({
      where: { userId },
      orderBy: { targetDate: "asc" }
    })
  ]);

  const today = Date.now();

  return goals.map((goal) => {
    const start = goal.startDate.getTime();
    const target = goal.targetDate.getTime();
    const currentValue = portfolioSummary.totalValue;
    const targetAmount = toNumber(goal.targetAmount);

    return {
      id: goal.id,
      name: goal.name,
      startDate: goal.startDate.toISOString(),
      targetDate: goal.targetDate.toISOString(),
      targetAmount,
      currentValue,
      amountProgress: Math.min(safeRatio(currentValue, targetAmount), 1),
      timeProgress: Math.min(Math.max(safeRatio(today - start, target - start), 0), 1),
      remainingAmount: Math.max(roundMoney(targetAmount - currentValue), 0)
    };
  });
}
