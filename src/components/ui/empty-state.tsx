import type { ReactNode } from "react";

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="panel flex min-h-40 flex-col items-center justify-center rounded-lg border-dashed px-4 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
