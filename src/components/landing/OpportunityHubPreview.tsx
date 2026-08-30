import { opportunities } from "@/data/opportunities";
import { OpportunityCard } from "@/components/app/OpportunityCard";

export function OpportunityHubPreview() {
  const preview = opportunities.slice(0, 3);

  return (
    <section id="opportunities" className="py-14 md:py-16">
      <div className="container-ulys grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="font-mono text-[11px] font-medium text-red">OPPORTUNITY HUB</span>
          <h3 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight md:text-[30px]">
            Тысячи возможностей — отсортированы под тебя.
          </h3>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            Олимпиады, хакатоны, волонтёрство, стажировки, стипендии, форумы и
            исследовательские программы — в одной ленте, с дедлайнами и
            фильтрами по формату и локации.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["Дедлайн", "Локация", "Формат", "Категория", "Рекомендовано"].map((f) => (
              <li
                key={f}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-soft"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {preview.map((o, i) => (
            <div key={o.id} className={i === 0 ? "sm:col-span-2" : ""}>
              <OpportunityCard opportunity={o} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
