import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LandingSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "landing-section-heading",
        align === "center" && "landing-section-heading--center",
        className,
      )}
    >
      {eyebrow && (
        <p className="landing-eyebrow">
          <span className="landing-eyebrow__spark" aria-hidden="true">✦</span>
          {eyebrow}
        </p>
      )}
      <h2>{title}</h2>
      {description && <p className="landing-section-heading__description">{description}</p>}
    </div>
  );
}
