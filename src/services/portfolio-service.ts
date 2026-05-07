import { prisma } from "@/lib/prisma";
import { roundMoney, safeRatio, toNumber } from "@/lib/number";
import { listInvestments } from "@/services/investment-service";
import {
  calculateAssetValueMap,
  calculateCashTotals,
  summarizeStrategy
} from "@/services/portfolio-calculations";
import type { DashboardSummary } from "@/types/domain";

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [investments, assets, latestSnapshot, recentTransactions] = await Promise.all([
    prisma.investment.findMany({
      where: { userId },
      orderBy: { tradeDate: "asc" }
    }),
    prisma.asset.findMany({
      include: { category: true },
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" }
    }),
    prisma.portfolioSnapshot.findFirst({
      where: { userId },
      orderBy: [{ snapshotDate: "desc" }, { createdAt: "desc" }]
    }),
    listInvestments(userId, { limit: 5 })
  ]);

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
    latestSnapshotDate: latestSnapshot?.snapshotDate.toISOString() ?? null,
    allocationBasis: latestSnapshot ? "SNAPSHOT" : assetValue.basis,
    strategy: summarizeStrategy(assets, assetValue.values),
    recentTransactions
  };
}
