import { formatCurrency, formatDate, getTransactionTypeLabel } from "@/lib/format";
import type { InvestmentListItem } from "@/types/domain";

export function RecentTransactions({ transactions }: { transactions: InvestmentListItem[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted">还没有交易记录</p>;
  }

  return (
    <div className="divide-y divide-line">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{transaction.assetName}</p>
            <p className="mt-1 text-xs text-muted">
              {formatDate(transaction.tradeDate)} · {getTransactionTypeLabel(transaction.type)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(transaction.amount)}</p>
        </div>
      ))}
    </div>
  );
}
