import { portfolioEntries, student } from "@/data/student";
import { FileText } from "lucide-react";

const sectionLabels: Record<string, string> = {
  education: "Образование",
  achievements: "Достижения",
  projects: "Проекты",
  competitions: "Конкурсы",
  volunteering: "Волонтёрство",
  leadership: "Лидерство",
  certificates: "Сертификаты",
  skills: "Навыки",
  interests: "Интересы",
};

export function PortfolioPreview() {
  const shown = portfolioEntries.slice(0, 4);

  return (
    <section id="portfolio" className="py-14 md:py-16">
      <div className="container-ulys grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="font-mono text-[11px] font-medium text-red">SMART PORTFOLIO</span>
          <h3 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight md:text-[30px]">
            Опыт, который превращается в портфолио.
          </h3>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            Образование, достижения, проекты, конкурсы, волонтёрство и лидерство
            — в одной структуре, готовой к экспорту для университетов.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["Проекты", "Достижения", "Волонтёрство", "Лидерство", "Сертификаты"].map((f) => (
              <li
                key={f}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-soft"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red font-display text-[13px] font-semibold text-white">
                {student.avatarInitials}
              </span>
              <div>
                <p className="font-display text-[14px] font-semibold">{student.name}</p>
                <p className="text-[11.5px] text-ink-soft">{student.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-[20px] font-bold text-red">
                {student.portfolioStrength}%
              </p>
              <p className="text-[10.5px] text-ink-soft">полнота</p>
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-dim">
            <div
              className="h-full rounded-full bg-red"
              style={{ width: `${student.portfolioStrength}%` }}
            />
          </div>

          <ul className="mt-5 space-y-2.5">
            {shown.map((e) => (
              <li key={e.id} className="flex items-start gap-2.5 rounded-xl bg-paper-dim px-3 py-2.5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="text-[12.5px] font-medium leading-snug">{e.title}</p>
                  <p className="text-[11px] text-ink-soft">{sectionLabels[e.section]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
