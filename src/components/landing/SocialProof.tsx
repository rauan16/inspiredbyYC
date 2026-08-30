import { testimonials } from "@/data/student";
import { Quote } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export function SocialProof() {
  return (
    <section className="py-20 md:py-24">
      <div className="container-ulys">
        <SectionHeading title="Что говорят первые пользователи" />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-white p-6"
            >
              <Quote className="h-5 w-5 text-red" />
              <blockquote className="mt-4 text-[14px] leading-relaxed text-ink">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 text-[12.5px] text-ink-soft">
                {t.name} · {t.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
