import clsx from "clsx";

export function ProgressBar({
  value,
  tone = "dark"
}: {
  value: number;
  tone?: "dark" | "gain" | "loss" | "brass";
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div
        className={clsx(
          "h-full rounded-full shadow-[0_0_24px_currentColor] transition-all",
          tone === "dark" && "bg-cyan-300 text-cyan-300",
          tone === "gain" && "bg-gain text-gain",
          tone === "loss" && "bg-loss text-loss",
          tone === "brass" && "bg-brass text-brass"
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }}
      />
    </div>
  );
}
