import Link from "next/link";
import { CalendarClock, ListPlus } from "lucide-react";
import { AllocationPieChart } from "@/components/charts/allocation-pie-chart";
import { ProfitTrendChart } from "@/components/charts/profit-trend-chart";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StrategyBreakdown } from "@/components/dashboard/strategy-breakdown";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import {
  getAllocationData,
  getGoalProgress,
  getProfitTrend
} from "@/services/analytics-service";
import { getDashboardSummary } from "@/services/portfolio-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [summary, allocation, profitTrend] = await Promise.all([
    getDashboardSummary(user.id),
    getAllocationData(user.id),
    getProfitTrend(user.id)
  ]);
  const goals = await getGoalProgress(user.id, summary);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel rounded-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label">投资组合看板</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">个人投资账本</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                以交易记录为基础，用手动估值快照校准当前市值，持续追踪资产结构、收益和长期目标。
              </p>
            </div>
            <Link href="/transactions" className="primary-button">
              <ListPlus className="h-4 w-4" aria-hidden />
              记一笔
            </Link>
          </div>

          <div className="mt-8">
            <MetricGrid summary={summary} />
          </div>
        </div>

        <aside className="panel rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
              <CalendarClock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">估值口径</p>
              <p className="text-xs text-muted">
                {summary.latestSnapshotDate ? formatDate(summary.latestSnapshotDate) : "使用资产成本估算"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {goals.slice(0, 1).map((goal) => (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{goal.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      目标 {formatCurrency(goal.targetAmount, { compact: true })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{formatPercent(goal.amountProgress)}</span>
                </div>
                <ProgressBar value={goal.amountProgress} tone="gain" />
                <p className="text-xs text-muted">
                  还差 {formatCurrency(goal.remainingAmount)}，时间进度 {formatPercent(goal.timeProgress)}
                </p>
              </div>
            ))}

            {goals.length === 0 ? <p className="text-sm text-muted">还没有设置投资周期目标</p> : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="panel rounded-lg p-6">
          <SectionHeading eyebrow="趋势" title="收益与本金变化" />
          <div className="mt-5">
            <ProfitTrendChart data={profitTrend} />
          </div>
        </div>

        <div className="panel rounded-lg p-6">
          <SectionHeading eyebrow="策略" title="核心-卫星拆解" />
          <div className="mt-6">
            <StrategyBreakdown strategy={summary.strategy} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel rounded-lg p-6">
          <SectionHeading eyebrow="配置" title="资产分类占比" />
          <div className="mt-5">
            <AllocationPieChart data={allocation} />
          </div>
        </div>

        <div className="panel rounded-lg p-6">
          <SectionHeading eyebrow="流水" title="最近交易" />
          <div className="mt-5">
            <RecentTransactions transactions={summary.recentTransactions} />
          </div>
        </div>
      </section>
    </div>
  );
}
