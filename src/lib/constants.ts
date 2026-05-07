export const TRANSACTION_TYPES = ["BUY", "SELL", "DIVIDEND"] as const;
export const STRATEGY_ROLES = ["CORE", "SATELLITE", "CASH"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type StrategyRole = (typeof STRATEGY_ROLES)[number];

export const transactionTypeLabels: Record<TransactionType, string> = {
  BUY: "买入",
  SELL: "卖出",
  DIVIDEND: "现金分红"
};

export const strategyRoleLabels: Record<StrategyRole, string> = {
  CORE: "核心",
  SATELLITE: "卫星",
  CASH: "现金"
};

export const strategyRoleDescriptions: Record<StrategyRole, string> = {
  CORE: "承担长期底仓与稳定配置",
  SATELLITE: "承担成长、主题或防御增强",
  CASH: "待投资资金与流动性缓冲"
};

export const defaultCategoryColors = [
  "#171717",
  "#0f8f5f",
  "#a68145",
  "#c94747",
  "#4b5563",
  "#2563eb"
];

export const chartPalette = ["#171717", "#0f8f5f", "#a68145", "#c94747", "#4b5563", "#2563eb"];

export const baseAnalyticsYear = 2026;
