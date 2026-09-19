import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Target } from "lucide-react";
import { LandingReveal } from "./LandingReveal";
import { LandingSectionHeading } from "./LandingSectionHeading";

const timeline = [
  { number: "01", month: "Сентябрь", title: "Определи целевые университеты", description: "Собери shortlist вариантов, которые соответствуют твоему профилю.", icon: Target },
  { number: "02", month: "Октябрь", title: "Начни подготовку к SAT", description: "Если экзамен нужен выбранным программам, добавь его в план подготовки.", icon: CalendarDays },
  { number: "03", month: "Декабрь", title: "Сдай пробный экзамен", description: "Проверь текущий уровень и скорректируй подготовку.", icon: CheckCircle2 },
  { number: "04", month: "Январь", title: "Усиль портфолио", description: "Добавь проект или активность, связанную с выбранным направлением.", icon: Target },
  { number: "05", month: "Март", title: "Изучи стипендии", description: "Проверь доступные возможности финансирования.", icon: CalendarDays },
  { number: "06", month: "Сентябрь", title: "Подготовь документы", description: "Собери транскрипт, рекомендации и другие необходимые материалы.", icon: CheckCircle2 },
  { number: "07", month: "Декабрь", title: "Отправь заявки", description: "Проверь требования выбранных программ перед отправкой.", icon: ArrowRight },
];

export function RoadmapPreview() {
  return (
    <section className="landing-roadmap" aria-labelledby="landing-roadmap-title">
      <div className="landing-container landing-roadmap__grid">
        <div>
          <LandingSectionHeading
            title={<span id="landing-roadmap-title">От мечты до заявки —<br /><span className="landing-text-accent">один понятный маршрут</span></span>}
            description="ULYS собирает задачи, дедлайны и приоритеты в последовательность, которую можно проходить по одному шагу."
          />
          <p className="landing-roadmap__demo-label">
            <CalendarDays aria-hidden="true" />
            <span><strong>Пример маршрута</strong>Реальный roadmap зависит от профиля и выбранных программ.</span>
          </p>
          <LandingReveal className="landing-roadmap__timeline-wrap">
            <ol className="landing-roadmap__timeline">
              {timeline.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={`${item.number}-${item.month}`} className="landing-roadmap__item">
                    <span className="landing-roadmap__dot" aria-hidden="true">
                      <span className="landing-roadmap__number">{item.number}</span>
                    </span>
                    <div className="landing-roadmap__item-content">
                      <span className="landing-roadmap__month">{item.month}</span>
                      <div className="landing-roadmap__item-copy">
                        <div className="landing-roadmap__item-title">
                          <h3>{item.title}</h3>
                          <span className="landing-roadmap__item-icon"><Icon aria-hidden="true" /></span>
                        </div>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </LandingReveal>
        </div>

        <LandingReveal className="landing-next-step" aria-labelledby="landing-next-step-title">
          <span className="landing-next-step__eyebrow"><span aria-hidden="true">✦</span>Твой следующий шаг</span>
          <h3 id="landing-next-step-title">Начать подготовку к SAT</h3>
          <p className="landing-next-step__question">Почему сейчас?</p>
          <div className="landing-next-step__reason">
            <Target aria-hidden="true" />
            <span>Некоторые выбранные программы учитывают SAT, а результата в профиле пока нет.</span>
          </div>
          <div className="landing-next-step__meta">
            <span><strong>Priority</strong>Высокий</span>
            <span><strong>Estimated</strong>Следующие 30 дней</span>
          </div>
          <span className="landing-next-step__demo">Пример рекомендации</span>
          <Link href="/signup" className="landing-button landing-button--primary landing-next-step__button">
            Добавить в план
            <ArrowRight className="landing-button__icon" aria-hidden="true" />
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
