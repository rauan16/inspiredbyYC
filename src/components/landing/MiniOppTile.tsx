import { cn } from "@/lib/utils";
import { ArrowUpRight, Star } from "lucide-react";

const bg: Record<string, string> = {
  red: "bg-red text-white",
  yellow: "bg-yellow text-ink",
  blue: "bg-blue text-white",
  violet: "bg-violet text-white",
  ink: "bg-ink text-red ring-1 ring-inset ring-red/45",
  "red-ink": "bg-red text-ink",
};

const subColor: Record<string, string> = {
  red: "text-white/80",
  yellow: "text-ink/70",
  blue: "text-white/80",
  violet: "text-white/80",
  ink: "text-paper/70",
  "red-ink": "text-ink/70",
};

export function MiniOppTile({
  title,
  sub,
  color,
  saved = false,
}: {
  title: string;
  sub: string;
  color: "red" | "yellow" | "blue" | "violet" | "ink" | "red-ink";
  saved?: boolean;
}) {
  return (
    <div className={cn("group relative min-h-[94px] rounded-[18px] p-3.5 transition-transform duration-200 hover:-translate-y-0.5", bg[color])}>
      {saved && (
        <Star
          className="absolute right-3 top-3 h-3.5 w-3.5"
          fill="currentColor"
          strokeWidth={0}
        />
      )}
      <p className="pr-6 text-[11.5px] font-semibold leading-[1.25] font-display">{title}</p>
      <p className={cn("mt-2.5 max-w-[175px] text-[9px] font-medium leading-snug", subColor[color])}>{sub}</p>
      <ArrowUpRight className="absolute bottom-3 right-3 h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );
}
