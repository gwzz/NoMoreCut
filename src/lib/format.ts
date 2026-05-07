import { transactionTypeLabels, type TransactionType } from "@/lib/constants";

export function formatCurrency(value: number, options?: { compact?: boolean }) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: options?.compact ? 0 : 2,
    notation: options?.compact ? "compact" : "standard"
  }).format(value);
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits
  }).format(value);
}

export function formatPercent(value: number, digits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export function getTransactionTypeLabel(type: string) {
  return transactionTypeLabels[type as TransactionType] ?? type;
}

export function getProfitTone(value: number) {
  if (value > 0) return "text-gain";
  if (value < 0) return "text-loss";
  return "text-muted";
}
