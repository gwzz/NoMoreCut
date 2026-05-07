import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, Landmark, Percent, PiggyBank, Wallet } from "lucide-react";
import { formatCurrency, formatPercent, getProfitTone } from "@/lib/format";
import type { DashboardSummary } from "@/types/domain";

const metrics = [
  {
    key: "totalValue",
    label: "当前总资产",
    icon: Wallet,
    format: (summary: DashboardSummary) => formatCurrency(summary.totalValue)
  },
  {
    key: "principal",
    label: "累计净投入",
    icon: PiggyBank,
    format: (summary: DashboardSummary) => formatCurrency(summary.principal)
  },
  {
    key: "profit",
    label: "绝对收益",
    icon: Landmark,
    format: (summary: DashboardSummary) => formatCurrency(summary.profit),
    tone: (summary: DashboardSummary) => getProfitTone(summary.profit)
  },
  {
    key: "roi",
    label: "收益率 ROI",
    icon: Percent,
    format: (summary: DashboardSummary) => formatPercent(summary.roi),
    tone: (summary: DashboardSummary) => getProfitTone(summary.roi)
  }
];

export function MetricGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const positive = metric.key === "profit" ? summary.profit >= 0 : summary.roi >= 0;
        const DirectionIcon = positive ? ArrowUpRight : ArrowDownRight;
        const toneClass = metric.tone?.(summary);

        return (
          <section key={metric.key} className="panel rounded-lg p-5 transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{metric.label}</p>
                <p className={clsx("mt-3 text-2xl font-semibold tracking-normal", toneClass ?? "gradient-text")}>
                  {metric.format(summary)}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/20">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            {metric.key === "profit" || metric.key === "roi" ? (
              <div className="mt-4 flex items-center gap-1 text-xs text-muted">
                <DirectionIcon className="h-3.5 w-3.5" aria-hidden />
                含现金分红 {formatCurrency(summary.dividendIncome)}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
