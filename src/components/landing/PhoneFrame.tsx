import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  frame = "ink",
}: {
  children: React.ReactNode;
  className?: string;
  frame?: "ink" | "red";
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-[230px] flex-col overflow-hidden rounded-[38px] border-[6px] bg-paper shadow-[0_20px_60px_-15px_rgba(23,21,31,0.35)] sm:h-[550px] sm:w-[250px] lg:h-[600px] lg:w-[280px]",
        frame === "ink" ? "border-ink" : "border-red",
        className
      )}
    >
      <div className="flex h-8 items-center justify-between px-4 pt-1 text-[10px] font-medium text-ink">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-3 rounded-sm bg-ink/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
          <span className="h-1.5 w-3.5 rounded-sm bg-ink/70" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-3 pb-3">{children}</div>
    </div>
  );
}
