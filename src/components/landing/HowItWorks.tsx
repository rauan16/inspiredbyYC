import { FolderOpen, Search, Sparkles, UserRound } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    n: "01", icon: UserRound, tone: "bg-red-dim text-red", accent: "bg-red",
    title: "Собери профиль",
    text: "Расскажи ULYS о своих интересах, достижениях и целях.",
  },
  {
    n: "02", icon: Search, tone: "bg-yellow-dim text-ink", accent: "bg-yellow",
    title: "Находи возможности",
    text: "Смотри олимпиады, стажировки и конкурсы, подобранные под тебя.",
  },
  {
    n: "03", icon: FolderOpen, tone: "bg-blue-dim text-blue", accent: "bg-blue",
    title: "Собирай портфолио",
    text: "Превращай участие в структурированные записи портфолио.",
  },
  {
    n: "04", icon: Sparkles, tone: "bg-violet-dim text-violet", accent: "bg-violet",
    title: "Узнавай, что дальше",
    text: "Получай рекомендации AI Mentor и видь, где профиль можно усилить.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line/70 bg-paper-dim/60 py-20 md:py-28">
      <div className="container-ulys">
        <SectionHeading eyebrow="Простой путь" title="Как это работает" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <article
              key={s.n}
              className="group relative min-h-[230px] overflow-hidden rounded-[24px] border border-line bg-paper p-6 shadow-[0_16px_35px_-25px_rgba(23,21,31,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-24px_rgba(23,21,31,0.35)]"
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${s.accent}`} />
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="font-mono text-[12px] text-ink-soft/60">{s.n}</span>
              </div>
              <h3 className="mt-7 font-display text-[16px] font-semibold leading-snug">{s.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
