"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Circle, Sparkles } from "lucide-react";
import { LandingReveal } from "./LandingReveal";

const milestones = [
  { label: "Профиль заполнен", description: "Все основные данные добавлены", done: true },
  { label: "Рекомендации получены", description: "Подобраны варианты по твоему профилю", done: true },
  { label: "План создан", description: "Сформирован персональный roadmap", done: true },
  { label: "Подготовить документы", description: "Следующий этап", done: false },
  { label: "Подать заявку", description: "Финальный этап", done: false },
];

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Personalization() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setProgress(72));
      return () => cancelAnimationFrame(frame);
    }

    const start = performance.now();
    const duration = 1600;
    let frame = 0;

    const update = (now: number) => {
      const elapsed = now - start;
      const nextProgress = Math.min(72, Math.round((elapsed / duration) * 72));
      setProgress(nextProgress);
      if (elapsed < duration) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  const activeMilestones = progress >= 72 ? 3 : progress >= 55 ? 3 : progress >= 35 ? 2 : progress >= 10 ? 1 : 0;

  return (
    <section className="landing-personalization" aria-labelledby="landing-personalization-title">
      <div className="landing-container landing-split">
        <LandingReveal className="landing-personalization__copy">
          <div className="landing-badge landing-badge--soft">
            <Sparkles className="landing-badge__icon" aria-hidden="true" />
            <span>Больше, чем просто список</span>
          </div>
          <h2 id="landing-personalization-title" className="landing-section-title">
            Персональный подход
            <br />
            <span className="landing-text-accent">к твоему будущему</span>
          </h2>
          <p className="landing-body-copy">
            ULYS анализирует твой профиль, сравнивает варианты и создаёт маршрут,
            который действительно подходит тебе. Никаких случайных рекомендаций —
            только объяснимые варианты и понятный план действий.
          </p>
          <div className="landing-action-row">
            <Link href="/signup" className="landing-button landing-button--primary">
              Попробовать сейчас
              <ArrowRight className="landing-button__icon" aria-hidden="true" />
            </Link>
            <a href="#matches" className="landing-button landing-button--secondary">
              Узнать больше
            </a>
          </div>
        </LandingReveal>

        <LandingReveal className="landing-route-dashboard" ref={cardRef as never} aria-label="Пример карточки персонального маршрута ULYS">
          <div className="landing-route-dashboard__top">
            <div className="landing-route-dashboard__brand">
              <span className="landing-route-dashboard__mark" aria-hidden="true">U</span>
              <span>ULYS</span>
            </div>
            <span className="landing-demo-label">Пример интерфейса</span>
          </div>

          <div className="landing-route-dashboard__body">
            <div className="landing-route-dashboard__header">
              <div>
                <p className="landing-route-dashboard__eyebrow">Твой маршрут</p>
                <h3>Поступление в университет</h3>
                <span className="landing-route-dashboard__status"><i aria-hidden="true" />В процессе</span>
              </div>
              <div className="landing-route-progress-ring" aria-label={`Прогресс подготовки: ${progress} процентов`}>
                <svg viewBox="0 0 140 140" role="img" aria-hidden="true">
                  <circle className="landing-route-progress-ring__track" cx="70" cy="70" r={RADIUS} />
                  <circle
                    className="landing-route-progress-ring__value"
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    style={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress / 100) }}
                  />
                </svg>
                <div className="landing-route-progress-ring__center">
                  <strong>{progress}%</strong>
                  <span>профиль готов</span>
                </div>
              </div>
            </div>

            <ol className="landing-route-milestones">
              {milestones.map((milestone, index) => (
                <li
                  key={milestone.label}
                  className={[
                    "landing-route-milestone",
                    milestone.done && index < activeMilestones ? "is-complete" : "",
                    index === activeMilestones ? "is-current" : "",
                  ].join(" ")}
                  style={{ transitionDelay: `${index * 140}ms` }}
                >
                  <span className="landing-route-milestone__marker" aria-hidden="true">
                    {milestone.done && index < activeMilestones ? <Check /> : <Circle />}
                  </span>
                  <span className="landing-route-milestone__content">
                    <strong>{milestone.label}</strong>
                    <span>{milestone.description}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="landing-next-action">
              <div>
                <p>Следующий шаг</p>
                <strong>Подготовить документы</strong>
              </div>
              <ArrowRight aria-hidden="true" />
            </div>
            <p className="landing-next-action__reason">ULYS выбрал этот шаг на основе текущего состояния маршрута.</p>
          </div>
          <p className="landing-dashboard-note">72% — иллюстративное состояние маршрута. Оно показывает прогресс выполнения шагов, а не вероятность поступления.</p>
        </LandingReveal>
      </div>
    </section>
  );
}
