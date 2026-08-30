import { cn } from "@/lib/utils";

type Tone = "neutral" | "red" | "yellow" | "blue" | "violet" | "ink";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-paper-dim text-ink-soft",
  red: "bg-red-dim text-red",
  yellow: "bg-yellow-dim text-ink",
  blue: "bg-blue-dim text-blue",
  violet: "bg-violet-dim text-violet",
  ink: "bg-ink text-paper",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
