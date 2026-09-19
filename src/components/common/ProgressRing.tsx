import { cn } from "@/lib/utils";

const size = 84;
const stroke = 8;
const radius = (size - stroke) / 2;
const circumference = 2 * Math.PI * radius;

export function ProgressRing({ value, label, size: customSize = size, className }: { value: number; label?: string; size?: number; className?: string }) {
  const scale = customSize / size;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: customSize, height: customSize }} role="img" aria-label={`${label || "Профиль"}: ${value}%`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--paper-dim)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--red)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{ transform: "rotate(0deg)", transformOrigin: "center" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <span className="font-display text-[19px] font-bold leading-none">{value}%</span>
        {label && <span className="mt-1 text-[9.5px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>}
      </div>
    </div>
  );
}
