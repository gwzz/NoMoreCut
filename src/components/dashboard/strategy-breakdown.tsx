import { formatCurrency, formatPercent } from "@/lib/format";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DashboardSummary } from "@/types/domain";

const toneByRole: Record<string, "dark" | "gain" | "brass"> = {
  CORE: "dark",
  SATELLITE: "gain",
  CASH: "brass"
};

export function StrategyBreakdown({ strategy }: { strategy: DashboardSummary["strategy"] }) {
  if (strategy.length === 0) {
    return <p className="text-sm text-muted">暂无策略拆解数据</p>;
  }

  return (
    <div className="space-y-5">
      {strategy.map((item) => (
        <div key={item.role} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-xs text-muted">{item.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{formatPercent(item.ratio)}</p>
              <p className="text-xs text-muted">{formatCurrency(item.value, { compact: true })}</p>
            </div>
          </div>
          <ProgressBar value={item.ratio} tone={toneByRole[item.role] ?? "dark"} />
        </div>
      ))}
    </div>
  );
}
