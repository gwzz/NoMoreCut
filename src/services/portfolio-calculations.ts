import {
  chartPalette,
  strategyRoleDescriptions,
  strategyRoleLabels,
  STRATEGY_ROLES,
  type StrategyRole
} from "@/lib/constants";
import { roundMoney, safeRatio, toNumber } from "@/lib/number";
import type { AllocationDatum } from "@/types/domain";

type NumericLike = number | string | null | undefined | { toNumber: () => number };

export type InvestmentRecord = {
  assetId: string;
  type: string;
  amount: NumericLike;
  fee?: NumericLike;
};

export type AssetRecord = {
  id: string;
  strategyRole: string;
  estimatedValue?: NumericLike;
  category?: {
    id: string;
    name: string;
    color: string | null;
  };
};

export function calculateCashTotals(investments: InvestmentRecord[]) {
  let buy = 0;
  let sell = 0;
  let dividend = 0;

  for (const investment of investments) {
    const amount = toNumber(investment.amount);
    const fee = toNumber(investment.fee);

    if (investment.type === "BUY") {
      buy += amount + fee;
    }

    if (investment.type === "SELL") {
      sell += Math.max(amount - fee, 0);
    }

    if (investment.type === "DIVIDEND") {
      dividend += amount;
    }
  }

  const principal = buy - sell;

  return {
    buy: roundMoney(buy),
    sell: roundMoney(sell),
    dividend: roundMoney(dividend),
    principal: roundMoney(principal)
  };
}

export function calculateAssetValueMap(assets: AssetRecord[], investments: InvestmentRecord[]) {
  const netCostByAsset = new Map<string, number>();

  for (const investment of investments) {
    const current = netCostByAsset.get(investment.assetId) ?? 0;
    const amount = toNumber(investment.amount);
    const fee = toNumber(investment.fee);

    if (investment.type === "BUY") {
      netCostByAsset.set(investment.assetId, current + amount + fee);
    }

    if (investment.type === "SELL") {
      netCostByAsset.set(investment.assetId, current - Math.max(amount - fee, 0));
    }
  }

  const hasManualEstimate = assets.some((asset) => toNumber(asset.estimatedValue) > 0);
  const values = new Map<string, number>();

  for (const asset of assets) {
    const estimatedValue = toNumber(asset.estimatedValue);
    const costValue = Math.max(netCostByAsset.get(asset.id) ?? 0, 0);
    values.set(asset.id, roundMoney(estimatedValue > 0 ? estimatedValue : costValue));
  }

  return {
    values,
    basis: hasManualEstimate ? ("ASSET_ESTIMATE" as const) : ("COST" as const)
  };
}

export function summarizeStrategy(assets: AssetRecord[], valueByAsset: Map<string, number>) {
  const grouped = new Map<string, number>();

  for (const asset of assets) {
    grouped.set(asset.strategyRole, (grouped.get(asset.strategyRole) ?? 0) + (valueByAsset.get(asset.id) ?? 0));
  }

  const total = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0);
  const knownRoles = new Set<string>(STRATEGY_ROLES);
  const orderedRoles = [
    ...STRATEGY_ROLES,
    ...Array.from(grouped.keys()).filter((role) => !knownRoles.has(role))
  ];

  return orderedRoles
    .map((role) => {
      const value = roundMoney(grouped.get(role) ?? 0);
      const typedRole = role as StrategyRole;

      return {
        role,
        label: strategyRoleLabels[typedRole] ?? role,
        description: strategyRoleDescriptions[typedRole] ?? "自定义策略分组",
        value,
        ratio: safeRatio(value, total)
      };
    })
    .filter((item) => item.value > 0);
}

export function summarizeAllocation(assets: AssetRecord[], valueByAsset: Map<string, number>): AllocationDatum[] {
  const grouped = new Map<string, AllocationDatum>();

  for (const asset of assets) {
    if (!asset.category) continue;

    const value = valueByAsset.get(asset.id) ?? 0;
    const existing = grouped.get(asset.category.id);

    if (existing) {
      existing.value = roundMoney(existing.value + value);
    } else {
      grouped.set(asset.category.id, {
        id: asset.category.id,
        name: asset.category.name,
        color: asset.category.color ?? chartPalette[grouped.size % chartPalette.length],
        value: roundMoney(value),
        ratio: 0
      });
    }
  }

  const total = Array.from(grouped.values()).reduce((sum, item) => sum + item.value, 0);

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      ratio: safeRatio(item.value, total)
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}
