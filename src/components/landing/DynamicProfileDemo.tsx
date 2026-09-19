"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Check, Circle, Info, Plus, Route, Sparkles, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingReveal } from "./LandingReveal";
import { LandingSectionHeading } from "./LandingSectionHeading";

const budgetOptions = [
  { value: 50000, label: "$50,000", sublabel: "в год" },
  { value: 30000, label: "$30,000", sublabel: "в год" },
  { value: 15000, label: "$15,000", sublabel: "в год" },
] as const;

type BudgetValue = (typeof budgetOptions)[number]["value"];

const recommendations: Record<BudgetValue, Array<{
  name: string;
  program: string;
  score: string;
  reason: string;
  status: string;
  isNew?: boolean;
}>> = {
  50000: [
    { name: "University Alpha", program: "Computer Science", score: "91", reason: "Направление подходит · входит в текущий бюджет", status: "landing-dynamic-row__status--match" },
    { name: "University Nova", program: "Data Science", score: "82", reason: "Сильная программа · комфортный бюджет", status: "landing-dynamic-row__status--match" },
  ],
  30000: [
    { name: "University Alpha", program: "Computer Science", score: "78", reason: "Направление подходит · бюджет требует проверки", status: "landing-dynamic-row__status--warning" },
    { name: "University Nova", program: "Data Science", score: "88", reason: "Входит в бюджет · совпадает с направлением", status: "landing-dynamic-row__status--new", isNew: true },
  ],
  15000: [
    { name: "University Alpha", program: "Computer Science", score: "64", reason: "Стоимость выше нового бюджета", status: "landing-dynamic-row__status--warning" },
    { name: "University Nova", program: "Data Science", score: "88", reason: "Входит в новый бюджет · совпадает с направлением", status: "landing-dynamic-row__status--new", isNew: true },
  ],
};

const roadmapSteps: Record<BudgetValue, Array<{ text: string; tone: "done" | "new" | "next" }>> = {
  50000: [
    { text: "Сравнить университеты", tone: "done" },
    { text: "Подготовить экзамены", tone: "done" },
    { text: "Подготовить документы", tone: "next" },
  ],
  30000: [
    { text: "Сравнить университеты", tone: "done" },
    { text: "Проверить финансовые требования", tone: "new" },
    { text: "Подготовить документы", tone: "next" },
  ],
  15000: [
    { text: "Найти подходящие стипендии", tone: "new" },
    { text: "Проверить финансовые требования", tone: "new" },
    { text: "Пересмотреть shortlist", tone: "new" },
  ],
};

export function DynamicProfileDemo() {
  const [budget, setBudget] = useState<BudgetValue>(50000);
  const [recalculating, setRecalculating] = useState(false);
  const [recalculated, setRecalculated] = useState(false);
  const rows = recommendations[budget];
  const steps = roadmapSteps[budget];

  useEffect(() => {
    if (!recalculating) return;
    const timeout = window.setTimeout(() => {
      setRecalculating(false);
      setRecalculated(true);
    }, 680);
    return () => window.clearTimeout(timeout);
  }, [recalculating]);

  const selectBudget = (value: BudgetValue) => {
    if (value === budget && recalculated) return;
    setBudget(value);
    setRecalculated(false);
    setRecalculating(true);
  };

  return (
    <section className="landing-dynamic" aria-labelledby="landing-dynamic-title">
      <div className="landing-container">
        <LandingReveal className="landing-dynamic__heading">
          <LandingSectionHeading
            eyebrow="Динамическая персонализация"
            title={<span id="landing-dynamic-title">Меняются цели —<br /><span className="landing-text-accent">меняется маршрут</span></span>}
            description="ULYS не создаёт один план навсегда. Измени бюджет, страну, направление или результаты экзаменов — рекомендации и следующие шаги адаптируются вместе с тобой."
          />
        </LandingReveal>

        <LandingReveal className="landing-dynamic__shell">
          <div className="landing-dynamic__profile-header">
            <div>
              <p className="landing-dynamic__kicker">Интерактивная демонстрация</p>
              <h3>Изменить профиль</h3>
              <p>Посмотри, как одно изменение влияет на весь маршрут.</p>
            </div>
            <span className="landing-demo-data-badge"><Sparkles aria-hidden="true" /> Демо-данные</span>
          </div>

          <div className="landing-dynamic__control-row">
            <div className="landing-dynamic__control-label">
              <WalletCards aria-hidden="true" />
              <span>Бюджет</span>
            </div>
            <div className="landing-dynamic__profile-tabs" role="tablist" aria-label="Параметры профиля">
              <button type="button" className="is-active" role="tab" aria-selected="true">Бюджет</button>
              <button type="button" role="tab" aria-selected="false" disabled>Страна</button>
              <button type="button" role="tab" aria-selected="false" disabled>Направление</button>
              <button type="button" role="tab" aria-selected="false" disabled>Экзамены</button>
            </div>
          </div>

          <div className="landing-dynamic__budget-panel">
            <div className="landing-dynamic__budget-option">
              <span>Текущий бюджет</span>
              <strong>$50,000 <small>/ год</small></strong>
            </div>
            <ArrowDown className="landing-dynamic__arrow" aria-hidden="true" />
            <div className="landing-dynamic__budget-options" role="group" aria-label="Выберите новый бюджет">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn("landing-dynamic__budget-button", budget === option.value && "is-active")}
                  aria-pressed={budget === option.value}
                  onClick={() => selectBudget(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={cn("landing-dynamic__recalculation", recalculating && "is-running", recalculated && "is-complete")} aria-live="polite">
            {recalculating ? (
              <><Sparkles className="landing-dynamic__spinner" aria-hidden="true" />Анализируем изменения...</>
            ) : recalculated ? (
              <><Check aria-hidden="true" />Маршрут обновлён</>
            ) : (
              <><Info aria-hidden="true" />Выберите новый бюджет, чтобы пересчитать демонстрацию</>
            )}
          </div>

          <div className="landing-dynamic__comparison">
            <div className="landing-dynamic__column">
              <div className="landing-dynamic__column-heading">
                <p className="landing-dynamic__column-label"><Route aria-hidden="true" />Рекомендации</p>
                <span className="landing-demo-data-badge landing-demo-data-badge--small">Демо-данные</span>
              </div>
              <div className="landing-dynamic__rows">
                {rows.map((row) => (
                  <article key={row.name} className={cn("landing-dynamic-row", row.isNew && "landing-dynamic-row--new")}>
                    <div>
                      <div className="landing-dynamic-row__title">
                        <strong>{row.name}</strong>
                        {row.isNew && <span className="landing-new-badge">NEW</span>}
                      </div>
                      <span>{row.program}</span>
                      <small>{row.reason}</small>
                    </div>
                    <span className={cn("landing-dynamic-row__score", row.status)}>
                      {row.score}
                      <small>Profile Match</small>
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="landing-dynamic__roadmap">
              <div className="landing-dynamic__column-heading">
                <p className="landing-dynamic__column-label"><Route aria-hidden="true" />Roadmap обновлён</p>
                <span className="landing-demo-data-badge landing-demo-data-badge--small">Следующие шаги</span>
              </div>
              <ol className="landing-dynamic__updates">
                {steps.map((step, index) => (
                  <li key={step.text} className={`is-${step.tone}`} style={{ transitionDelay: `${index * 90}ms` }}>
                    <span className="landing-dynamic-update-icon" aria-hidden="true">{step.tone === "done" ? <Check /> : step.tone === "new" ? <Plus /> : <Circle />}</span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
              <div className="landing-dynamic__why">
                <strong>Почему изменилось?</strong>
                <p>Снижение бюджета повлияло на доступность части вариантов, поэтому ULYS пересобрал shortlist и добавил финансовые шаги в roadmap.</p>
              </div>
            </div>
          </div>

          <div className="landing-dynamic__info-strip">
            <Info aria-hidden="true" />
            <div>
              <strong>Как работает эта демонстрация</strong>
              <p>Изменение бюджета пересчитывает показанные рекомендации и задачи roadmap. Значения в этом блоке иллюстративные и не являются реальными данными университетов.</p>
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
