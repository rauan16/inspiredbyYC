import { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-12 text-center sm:py-16", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red">{icon}</span>
      <h2 className="mt-5 font-display text-[16px] font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">{description}</p>
      {primaryAction && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={primaryAction.href} size="md">{primaryAction.label}</ButtonLink>
          {secondaryAction && <ButtonLink href={secondaryAction.href} variant="secondary" size="md">{secondaryAction.label}</ButtonLink>}
        </div>
      )}
    </div>
  );
}
