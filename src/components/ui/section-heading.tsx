import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="label mb-1">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold tracking-normal text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
