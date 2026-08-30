import { pricingPlans } from "@/data/student";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-line/70 bg-paper-dim/60 py-20 md:py-24">
      <div className="container-ulys">
        <SectionHeading
          title="Тарифы"
          description="Начни бесплатно. Подключи AI Mentor и аналитику, когда будешь готов."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pricingPlans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "flex flex-col rounded-[var(--radius-card)] border p-6",
                p.highlighted ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink"
              )}
            >
              <p className="font-display text-[16px] font-semibold">{p.name}</p>
              <p
                className={cn(
                  "mt-4 text-[13px]",
                  p.highlighted ? "text-paper/70" : "text-ink-soft"
                )}
              >
                {p.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-[30px] font-bold">{p.price}</span>
                <span className={cn("text-[12.5px]", p.highlighted ? "text-paper/60" : "text-ink-soft")}>
                  / {p.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        p.highlighted ? "text-yellow" : "text-red"
                      )}
                    />
                    <span className={p.highlighted ? "text-paper/90" : "text-ink"}>{f}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href="/signup"
                variant={p.highlighted ? "accent" : "secondary"}
                size="md"
                className="mt-7 w-full"
              >
                {p.cta}
              </ButtonLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
