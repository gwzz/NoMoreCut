import clsx from "clsx";

export function ProgressBar({
  value,
  tone = "dark"
}: {
  value: number;
  tone?: "dark" | "gain" | "loss" | "brass";
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200" aria-hidden>
      <div
        className={clsx(
          "h-full rounded-full transition-all",
          tone === "dark" && "bg-ink",
          tone === "gain" && "bg-gain",
          tone === "loss" && "bg-loss",
          tone === "brass" && "bg-brass"
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }}
      />
    </div>
  );
}
