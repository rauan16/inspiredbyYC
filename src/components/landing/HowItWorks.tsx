import { ClipboardCheck, Rocket, Search, UserRound } from "lucide-react";
import { LandingReveal } from "./LandingReveal";
import { LandingSectionHeading } from "./LandingSectionHeading";

const steps = [
  {
    number: "01",
    title: "Заполни профиль",
    description: "Расскажи о классе, оценках, экзаменах, интересах, бюджете и странах.",
    icon: UserRound,
  },
  {
    number: "02",
    title: "Получи рекомендации",
    description: "ULYS подберёт подходящие университеты и объяснит, почему каждый вариант подходит именно тебе.",
    icon: Search,
  },
  {
    number: "03",
    title: "Изучи свой план",
    description: "Получишь персональный roadmap: экзамены, документы, дедлайны и активности.",
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "Делай следующий шаг",
    description: "Отмечай прогресс и всегда знай, какое действие сейчас самое важное.",
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-how" aria-labelledby="landing-how-title">
      <div className="landing-container">
        <LandingReveal className="landing-how__shell">
          <LandingSectionHeading
            align="center"
            className="landing-how__heading"
            title={<span id="landing-how-title">Как это работает?</span>}
            description="От анкеты до персонального плана — всего несколько шагов"
          />

          <ol className="landing-how__grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <LandingReveal as="li" key={step.number} delay={index * 90} className="landing-how-step">
                  <div className="landing-how-step__top">
                    <span className="landing-how-step__number">{step.number}</span>
                    <span className="landing-how-step__icon">
                      <Icon aria-hidden="true" />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </LandingReveal>
              );
            })}
          </ol>
        </LandingReveal>
      </div>
    </section>
  );
}
