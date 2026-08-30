import { mentorConversation } from "@/data/student";
import { Sparkles } from "lucide-react";

export function MentorPreview() {
  return (
    <section id="mentor" className="py-14 md:py-16">
      <div className="container-ulys grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 rounded-[var(--radius-card)] border border-line bg-white p-5 lg:order-1">
          <div className="flex items-center gap-2 border-b border-line pb-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-[13.5px] font-semibold">Uli · AI Mentor</p>
              <p className="text-[11px] text-ink-soft">Знает твоё портфолио и цели</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {mentorConversation.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "student"
                    ? "ml-10 rounded-2xl rounded-tr-sm bg-ink px-3.5 py-2.5 text-[13px] text-paper"
                    : "mr-10 rounded-2xl rounded-tl-sm bg-paper-dim px-3.5 py-2.5 text-[13px] text-ink"
                }
              >
                {m.content}
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="font-mono text-[11px] font-medium text-red">AI MENTOR</span>
          <h3 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight md:text-[30px]">
            Наставник, который знает твой профиль.
          </h3>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            AI Mentor разбирает портфолио, находит слабые места и предлагает
            конкретный план — а не общие советы вроде «поступай усердно».
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-ink-soft">
            <li>— Разбор портфолио и рекомендации по улучшению</li>
            <li>— Подбор подходящих возможностей</li>
            <li>— План действий на месяц</li>
            <li>— Подготовка к выбранным университетам</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
