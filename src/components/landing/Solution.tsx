import { Compass, Globe2, Route, Sparkles } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const solutions = [
  {
    icon: Sparkles, label: "Личный ориентир", title: "Персональный AI-наставник ULIE",
    text: "ULIE анализирует цели и достижения ученика и составляет персональный план развития.\n\nОна подсказывает, какие навыки улучшить и какие шаги сделать дальше.", color: "bg-red-dim text-red", accent: "bg-red",
  },
  {
    icon: Compass, label: "Твоя подборка", title: "Возможности, которые подходят именно тебе",
    text: "ULYS собирает олимпиады, гранты, конкурсы и стажировки в одном месте.\n\nСистема подбирает их под профиль и напоминает о дедлайнах.", color: "bg-yellow-dim text-ink", accent: "bg-yellow",
  },
  {
    icon: Route, label: "Пошаговый план", title: "Понятный путь к университету",
    text: "Ученик получает конкретный маршрут вместо бесконечного поиска информации:", route: "Цель → Профиль → Возможности → Действия → Поступление", extra: "ULYS показывает, что делать сейчас и как двигаться к цели.", color: "bg-blue-dim text-blue", accent: "bg-blue",
  },
  {
    icon: Globe2, label: "Для каждого", title: "Равный доступ к возможностям",
    text: "ULYS даёт каждому доступ к информации, наставничеству и возможностям — независимо от города и окружения.", extra: "Твой потенциал становится реальным путём к будущему.", color: "bg-violet-dim text-violet", accent: "bg-violet",
  },
];

export function Solution() {
  return (
    <section id="product" className="border-y border-line/70 bg-paper-dim/45 py-20 md:py-28">
      <div className="container-ulys">
        <div className="border-b border-line pb-10">
          <SectionHeading eyebrow="Решение Ulys" title="Всё, что нужно для пути к поступлению" className="max-w-none" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {solutions.map((solution, index) => (
            <article key={solution.title} className="group relative overflow-hidden rounded-[24px] border border-line bg-paper p-6 shadow-[0_18px_40px_-28px_rgba(23,21,31,0.5)] transition-all duration-300 hover:-translate-y-1 md:p-8">
              <span className={`absolute inset-x-0 top-0 h-1 ${solution.accent}`} />
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${solution.color}`}>
                  <solution.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft/60">{solution.label}</span>
                  <span className="font-mono text-[11px] text-ink-soft/60">0{index + 1}</span>
                </div>
              </div>
              <h3 className="mt-7 max-w-md font-display text-[18px] font-semibold leading-snug md:text-[20px]">{solution.title}</h3>
              <div className="mt-4 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-soft">
                <p>{solution.text}</p>
                {solution.route && <p className="my-5 rounded-2xl border border-blue/15 bg-blue-dim/55 px-4 py-3.5 font-display text-[11px] font-semibold leading-relaxed text-ink md:text-[12px]">{solution.route}</p>}
                {solution.extra && <p className={index === 3 ? "mt-5 border-l-2 border-violet pl-3 font-medium text-ink" : ""}>{solution.extra}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
