"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { MonthlyCashflowDatum } from "@/types/domain";

export function MonthlyCashflowChart({ data }: { data: MonthlyCashflowDatum[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#dedbd4" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#737373", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value), { compact: true })}
            width={56}
          />
          <Tooltip
            formatter={(value: number, name) => {
              const labels: Record<string, string> = {
                buy: "买入",
                sell: "卖出",
                dividend: "分红"
              };
              return [formatCurrency(value), labels[String(name)] ?? name];
            }}
            labelStyle={{ color: "#171717" }}
          />
          <Bar dataKey="buy" fill="#171717" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sell" fill="#c94747" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dividend" fill="#0f8f5f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
