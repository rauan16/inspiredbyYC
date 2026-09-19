import Link from "next/link";
import { ArrowRight, Route, Sparkles } from "lucide-react";
import { LandingReveal } from "./LandingReveal";

export function FinalCTA() {
  return (
    <section className="landing-final-cta" aria-labelledby="landing-final-cta-title">
      <div className="landing-container">
        <LandingReveal className="landing-final-cta__card">
          <span className="landing-final-cta__icon" aria-hidden="true">
            <Route />
          </span>
          <p className="landing-final-cta__eyebrow"><Sparkles aria-hidden="true" /> Твой маршрут может начаться сегодня</p>
          <h2 id="landing-final-cta-title">
            Твоё поступление начинается
            <br />
            с понятного следующего шага
          </h2>
          <p>
            Создай профиль и получи персональные рекомендации, сравнение вариантов
            и свой маршрут поступления.
          </p>
          <div className="landing-final-cta__actions">
            <Link href="/signup" className="landing-button landing-button--primary landing-button--large">
              Создать свой маршрут
              <ArrowRight className="landing-button__icon" aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="landing-button landing-button--secondary landing-button--large">
              Узнать, как это работает
            </a>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
