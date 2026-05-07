import { roundMoney, safeRatio, toNumber } from "@/lib/number";
import {
  tables,
  throwSupabaseError,
  toIsoTimestamp,
  type PortfolioSnapshotRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { listRawAssets } from "@/services/asset-service";
import { listInvestments, listRawInvestments } from "@/services/investment-service";
import {
  calculateAssetValueMap,
  calculateCashTotals,
  summarizeStrategy
} from "@/services/portfolio-calculations";
import type { DashboardSummary } from "@/types/domain";

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const supabase = await createClient();
  const [investments, assets, latestSnapshotResponse, recentTransactions] = await Promise.all([
    listRawInvestments(userId),
    listRawAssets(userId).then((items) => items.filter((asset) => !asset.isArchived)),
    supabase
      .from(tables.portfolioSnapshots)
      .select("*")
      .eq("userId", userId)
      .order("snapshotDate", { ascending: false })
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle(),
    listInvestments(userId, { limit: 5 })
  ]);

  throwSupabaseError(latestSnapshotResponse.error);

  const latestSnapshot = latestSnapshotResponse.data as PortfolioSnapshotRecord | null;
  const cashTotals = calculateCashTotals(investments);
  const assetValue = calculateAssetValueMap(assets, investments);
  const estimatedAssetTotal = Array.from(assetValue.values.values()).reduce((sum, value) => sum + value, 0);
  const totalValue = latestSnapshot
    ? toNumber(latestSnapshot.totalValue)
    : roundMoney(estimatedAssetTotal || Math.max(cashTotals.principal, 0));
  const profit = roundMoney(totalValue + cashTotals.dividend - cashTotals.principal);
  const roi = safeRatio(profit, cashTotals.principal);

  return {
    totalValue,
    principal: cashTotals.principal,
    dividendIncome: cashTotals.dividend,
    profit,
    roi,
    latestSnapshotDate: latestSnapshot ? toIsoTimestamp(latestSnapshot.snapshotDate) : null,
    allocationBasis: latestSnapshot ? "SNAPSHOT" : assetValue.basis,
    strategy: summarizeStrategy(assets, assetValue.values),
    recentTransactions
  };
}
