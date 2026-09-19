import { ArrowDown, ArrowRight, Check, GitCompare, Route, Search } from "lucide-react";
import { LandingReveal } from "./LandingReveal";
import { LandingSectionHeading } from "./LandingSectionHeading";

const scenarios = [
  {
    number: "01",
    icon: Search,
    question: "Не знаю, с чего начать",
    problem: "Есть цель поступать за границу, но непонятно, какие университеты подходят и что вообще нужно подготовить.",
    action: "Анализирует профиль",
    bullets: ["оценки", "интересы", "бюджет", "страны", "экзамены"],
    result: "Получаешь первый персональный shortlist и понятную стартовую точку.",
    highlight: "Первый шаг найден",
  },
  {
    number: "02",
    icon: GitCompare,
    question: "Слишком много университетов",
    problem: "Десятки программ выглядят похожими, а сравнивать требования вручную сложно.",
    action: "Сравнивает варианты",
    bullets: ["Budget", "Requirements", "Program", "Preferences"],
    result: "Понимаешь ключевые различия и почему один вариант подходит профилю лучше другого.",
    highlight: "Решение становится понятнее",
  },
  {
    number: "03",
    icon: Route,
    question: "Не понимаю, что делать дальше",
    problem: "Университеты уже выбраны, но впереди экзамены, документы, активности и дедлайны.",
    action: "Создаёт roadmap",
    bullets: ["Now · Подготовка к SAT", "Next · Усилить портфолио", "Later · Подготовить документы"],
    result: "Вместо длинного списка задач ты видишь один актуальный следующий шаг.",
    highlight: "Следующий шаг определён",
  },
];

export function UserScenarios() {
  return (
    <section id="reviews" className="landing-scenarios" aria-labelledby="landing-scenarios-title">
      <div className="landing-container">
        <LandingReveal className="landing-scenarios__heading">
          <LandingSectionHeading
            align="center"
            title={<span id="landing-scenarios-title">Как ULYS помогает абитуриенту</span>}
            description="Три ситуации, в которых персональный маршрут помогает перейти от неопределённости к конкретному действию."
          />
        </LandingReveal>

        <div className="landing-scenarios__grid">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <LandingReveal as="article" key={scenario.number} delay={index * 90} className="landing-scenario-card">
                <div className="landing-scenario-card__header">
                  <span className="landing-scenario-card__label">Ситуация {scenario.number}</span>
                  <span className="landing-scenario-card__icon"><Icon aria-hidden="true" /></span>
                </div>
                <h3>«{scenario.question}»</h3>
                <p className="landing-scenario-card__problem">{scenario.problem}</p>
                <div className="landing-scenario-card__transition"><ArrowDown aria-hidden="true" /></div>
                <div className="landing-scenario-card__action">
                  <span>ULYS делает</span>
                  <strong>{scenario.action}</strong>
                  <div>
                    {scenario.bullets.map((bullet) => <span key={bullet}><Check aria-hidden="true" />{bullet}</span>)}
                  </div>
                </div>
                <div className="landing-scenario-card__result">
                  <p>{scenario.result}</p>
                  <span>{scenario.highlight} <ArrowRight aria-hidden="true" /></span>
                </div>
              </LandingReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
