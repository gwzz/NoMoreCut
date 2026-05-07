"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { ProfitTrendDatum } from "@/types/domain";

export function ProfitTrendChart({ data }: { data: ProfitTrendDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-80 items-center justify-center text-sm text-muted">暂无估值快照</div>;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#dedbd4" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#737373", fontSize: 12 }}
            tickFormatter={(value) => formatDate(value).slice(5)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#737373", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value), { compact: true })}
            width={56}
          />
          <Tooltip
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value: number, name) => {
              const labels: Record<string, string> = {
                totalValue: "总资产",
                principal: "本金",
                profit: "收益",
                roi: "ROI"
              };
              const formatted = name === "roi" ? formatPercent(value) : formatCurrency(value);
              return [formatted, labels[String(name)] ?? name];
            }}
          />
          <Line type="monotone" dataKey="totalValue" stroke="#171717" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="principal" stroke="#737373" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit" stroke="#0f8f5f" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
