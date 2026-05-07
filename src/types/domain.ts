export type AssetOption = {
  id: string;
  name: string;
  symbol: string | null;
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  strategyRole: string;
  estimatedValue: number;
  targetWeight: number | null;
  note: string | null;
  isArchived: boolean;
};

export type CategoryOption = {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
};

export type InvestmentListItem = {
  id: string;
  assetId: string;
  assetName: string;
  categoryName: string;
  categoryColor: string | null;
  strategyRole: string;
  type: string;
  tradeDate: string;
  amount: number;
  quantity: number | null;
  price: number | null;
  fee: number | null;
  note: string | null;
};

export type DashboardSummary = {
  totalValue: number;
  principal: number;
  dividendIncome: number;
  profit: number;
  roi: number;
  latestSnapshotDate: string | null;
  allocationBasis: "SNAPSHOT" | "ASSET_ESTIMATE" | "COST";
  strategy: Array<{
    role: string;
    label: string;
    description: string;
    value: number;
    ratio: number;
  }>;
  recentTransactions: InvestmentListItem[];
};

export type AllocationDatum = {
  id: string;
  name: string;
  color: string;
  value: number;
  ratio: number;
};

export type MonthlyCashflowDatum = {
  month: string;
  buy: number;
  sell: number;
  dividend: number;
  net: number;
};

export type ProfitTrendDatum = {
  date: string;
  totalValue: number;
  principal: number;
  profit: number;
  roi: number;
};

export type GoalProgress = {
  id: string;
  name: string;
  startDate: string;
  targetDate: string;
  targetAmount: number;
  currentValue: number;
  amountProgress: number;
  timeProgress: number;
  remainingAmount: number;
};
