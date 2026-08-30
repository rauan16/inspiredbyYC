import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-red">
          {eyebrow}
        </p>
      )}
      <h2 className={cn("font-display text-[28px] font-bold tracking-tight md:text-[34px]", eyebrow && "mt-2")}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{description}</p>
      )}
    </div>
  );
}
