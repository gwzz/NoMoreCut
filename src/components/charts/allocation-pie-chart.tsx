"use client";

import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { AllocationDatum } from "@/types/domain";

export function AllocationPieChart({ data }: { data: AllocationDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-sm text-muted">暂无资产分布数据</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={108}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, item) => [
                `${formatCurrency(value)} / ${formatPercent(item.payload.ratio)}`,
                item.payload.name
              ]}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
              <span className="truncate text-sm font-medium text-ink">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{formatPercent(item.ratio)}</p>
              <p className="text-xs text-muted">{formatCurrency(item.value, { compact: true })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
