import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { LandingReveal } from "./LandingReveal";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-container landing-hero__grid">
        <div className="landing-hero__copy">
          <LandingReveal className="landing-hero__badge-wrap">
            <div className="landing-badge">
              <Sparkles className="landing-badge__icon" aria-hidden="true" />
              <span>AI-помощник для поступления</span>
            </div>
          </LandingReveal>

          <LandingReveal as="h1" id="landing-hero-title" className="landing-hero__title" delay={80}>
            Твой путь
            <br />
            в лучшие университеты
            <br />
            <span className="landing-hero__accent">начинается здесь</span>
          </LandingReveal>

          <LandingReveal as="p" className="landing-hero__description" delay={160}>
            ULYS превращает твои цели, оценки и интересы в персональный маршрут
            поступления. Мы подбираем университеты, объясняем, почему они подходят
            именно тебе, и показываем, что делать дальше — шаг за шагом.
          </LandingReveal>

          <LandingReveal className="landing-hero__actions" delay={240}>
            <Link href="/signup" className="landing-button landing-button--primary landing-button--large">
              Создать свой маршрут
              <ArrowRight className="landing-button__icon" aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="landing-button landing-button--secondary landing-button--large">
              <Play className="landing-button__icon landing-button__icon--filled" aria-hidden="true" />
              Смотреть демо
            </a>
          </LandingReveal>

          <LandingReveal as="dl" className="landing-metrics" delay={320} aria-label="Что даёт ULYS">
            <div className="landing-metric">
              <dt>3+</dt>
              <dd>персональных варианта</dd>
            </div>
            <div className="landing-metric">
              <dt>1</dt>
              <dd>единый маршрут поступления</dd>
            </div>
            <div className="landing-metric">
              <dt>24/7</dt>
              <dd>AI-помощник ULIE</dd>
            </div>
          </LandingReveal>
        </div>

        <LandingReveal className="landing-hero-visual" delay={180}>
          <HeroVisual />
        </LandingReveal>
      </div>
    </section>
  );
}
