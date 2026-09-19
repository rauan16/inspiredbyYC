import { GitCompare, Route, Search, Sparkles, Target, Zap } from "lucide-react";
import { LandingReveal } from "./LandingReveal";
import { LandingSectionHeading } from "./LandingSectionHeading";

const benefits = [
  {
    number: "01",
    title: "Персональные рекомендации",
    description: "Подбор вариантов на основе твоего профиля, академических данных, интересов и целей.",
    icon: Target,
    visual: "matches",
  },
  {
    number: "02",
    title: "Понятные объяснения",
    description: "Ты всегда видишь не только рекомендацию, но и причины, которые повлияли на неё.",
    icon: Search,
    visual: "reasons",
  },
  {
    number: "03",
    title: "Сравнение университетов",
    description: "Сравнивай программы по стоимости, требованиям и параметрам, которые важны именно тебе.",
    icon: GitCompare,
    visual: "compare",
  },
  {
    number: "04",
    title: "Динамический roadmap",
    description: "План адаптируется, когда меняются твои цели, ограничения или результаты.",
    icon: Route,
    visual: "roadmap",
  },
  {
    number: "05",
    title: "Следующий лучший шаг",
    description: "Вместо десятков задач ULYS выделяет действие, которое сейчас имеет наибольший приоритет.",
    icon: Zap,
    visual: "next",
  },
  {
    number: "06",
    title: "ULIE AI Copilot",
    description: "Получай помощь в контексте собственного профиля, рекомендаций и текущего roadmap.",
    icon: Sparkles,
    visual: "chat",
  },
];

function BenefitVisual({ type }: { type: string }) {
  if (type === "matches") {
    return (
      <div className="landing-benefit-visual landing-benefit-visual--matches" aria-hidden="true">
        <span><i>S</i><b>Stanford</b><em>91</em></span>
        <span><i>N</i><b>NUS</b><em>86</em></span>
        <span><i>U</i><b>UCL</b><em>78</em></span>
      </div>
    );
  }

  if (type === "reasons") {
    return (
      <div className="landing-benefit-visual landing-benefit-visual--reasons" aria-hidden="true">
        <strong>Почему подходит</strong>
        <span><i>✓</i>Направление</span>
        <span><i>✓</i>Бюджет</span>
        <span><i>✓</i>IELTS</span>
        <span className="is-warning"><i>⚠</i>Требование SAT</span>
      </div>
    );
  }

  if (type === "compare") {
    return (
      <div className="landing-benefit-visual landing-benefit-visual--compare" aria-hidden="true">
        <div><span>A</span><strong>University Alpha</strong><em>86</em></div>
        <div><span>B</span><strong>University Nova</strong><em>78</em></div>
        <small>Бюджет · требования · программа</small>
      </div>
    );
  }

  if (type === "roadmap") {
    return (
      <div className="landing-benefit-visual landing-benefit-visual--roadmap" aria-hidden="true">
        <span><i>✓</i>Профиль</span>
        <span><i>✓</i>Рекомендации</span>
        <span className="is-new"><i>+</i>Финансовые требования</span>
      </div>
    );
  }

  if (type === "next") {
    return (
      <div className="landing-benefit-visual landing-benefit-visual--next" aria-hidden="true">
        <small>NEXT</small>
        <strong>Подготовка к SAT</strong>
        <span>Высокий приоритет <i>→</i></span>
      </div>
    );
  }

  return (
    <div className="landing-benefit-visual landing-benefit-visual--chat" aria-hidden="true">
      <span>Почему этот вариант подходит?</span>
      <span>Программа и бюджет совпадают с профилем.</span>
      <i><Sparkles /></i>
    </div>
  );
}

export function Benefits() {
  return (
    <section id="benefits" className="landing-benefits" aria-labelledby="landing-benefits-title">
      <div className="landing-container">
        <LandingReveal className="landing-benefits__heading">
          <LandingSectionHeading
            align="center"
            title={<span id="landing-benefits-title">Всё необходимое для поступления<br />в одном маршруте</span>}
            description="От первого профиля до отправленной заявки — без разрозненных таблиц и потерянных дедлайнов."
          />
        </LandingReveal>

        <div className="landing-benefits__grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <LandingReveal as="article" key={benefit.number} delay={index * 70} className="landing-benefit-card">
                <div className="landing-benefit-card__top">
                  <span className="landing-benefit-card__number">{benefit.number}</span>
                  <span className="landing-benefit-card__icon"><Icon aria-hidden="true" /></span>
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
                <BenefitVisual type={benefit.visual} />
              </LandingReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
