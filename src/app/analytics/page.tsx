import Link from "next/link";
import clsx from "clsx";
import { AllocationPieChart } from "@/components/charts/allocation-pie-chart";
import { MonthlyCashflowChart } from "@/components/charts/monthly-cashflow-chart";
import { ProfitTrendChart } from "@/components/charts/profit-trend-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth";
import { baseAnalyticsYear } from "@/lib/constants";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import {
  getAllocationData,
  getGoalProgress,
  getMonthlyCashflow,
  getProfitTrend
} from "@/services/analytics-service";

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  searchParams?: Promise<{
    year?: string;
  }>;
};

const yearOptions = [2026, 2027, 2028, 2029, 2030];

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const year = Number(params?.year ?? baseAnalyticsYear);
  const selectedYear = Number.isFinite(year) ? year : baseAnalyticsYear;
  const [allocation, cashflow, profitTrend] = await Promise.all([
    getAllocationData(user.id),
    getMonthlyCashflow(user.id, selectedYear),
    getProfitTrend(user.id)
  ]);
  const goals = await getGoalProgress(user.id);

  return (
    <div className="space-y-4">
      <section className="panel rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Analytics</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">统计与周期分析</h1>
            <p className="mt-2 text-sm text-muted">默认从 2026 年开始观察资金节奏、资产配置和收益趋势。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {yearOptions.map((option) => (
              <Link
                key={option}
                href={`/analytics?year=${option}`}
                className={clsx(
                  "inline-flex h-10 items-center rounded-md border px-3 text-sm font-medium transition",
                  selectedYear === option
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-muted hover:border-ink hover:text-ink"
                )}
              >
                {option}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel rounded-lg p-5">
          <SectionHeading eyebrow="Cash Flow" title={`${selectedYear} 月度资金流`} />
          <div className="mt-5">
            <MonthlyCashflowChart data={cashflow} />
          </div>
        </div>

        <div className="panel rounded-lg p-5">
          <SectionHeading eyebrow="Allocation" title="资产分布" />
          <div className="mt-5">
            <AllocationPieChart data={allocation} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="panel rounded-lg p-5">
          <SectionHeading eyebrow="Net Value" title="收益趋势" />
          <div className="mt-5">
            <ProfitTrendChart data={profitTrend} />
          </div>
        </div>

        <div className="panel rounded-lg p-5">
          <SectionHeading eyebrow="Cycle" title="投资周期目标" />
          <div className="mt-5 space-y-5">
            {goals.map((goal) => (
              <article key={goal.id} className="space-y-3 border-b border-line pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{goal.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(goal.startDate)} 至 {formatDate(goal.targetDate)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink">{formatPercent(goal.amountProgress)}</p>
                </div>
                <ProgressBar value={goal.amountProgress} tone="gain" />
                <p className="text-xs text-muted">
                  当前 {formatCurrency(goal.currentValue)}，距离目标还差 {formatCurrency(goal.remainingAmount)}
                </p>
              </article>
            ))}
            {goals.length === 0 ? <p className="text-sm text-muted">还没有投资周期目标。</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
