import { BarChart3, GraduationCap, Globe2 } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="landing-hero-visual" role="img" aria-label="Персональный маршрут от профиля к университетам и пошаговому плану">
      <div className="landing-hero-orbit landing-hero-orbit--one" aria-hidden="true" />
      <div className="landing-hero-orbit landing-hero-orbit--two" aria-hidden="true" />

      <div className="landing-globe" aria-hidden="true">
        <svg viewBox="0 0 420 420" className="landing-globe__svg">
          <defs>
            <radialGradient id="ulys-globe-light" cx="35%" cy="28%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#ffe8e8" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#f6c9c9" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <circle cx="210" cy="210" r="168" fill="url(#ulys-globe-light)" />
          <circle cx="210" cy="210" r="168" fill="none" stroke="#B5121B" strokeOpacity="0.18" strokeWidth="1.5" />
          <ellipse cx="210" cy="210" rx="72" ry="168" fill="none" stroke="#B5121B" strokeOpacity="0.22" strokeWidth="1.2" />
          <ellipse cx="210" cy="210" rx="126" ry="168" fill="none" stroke="#B5121B" strokeOpacity="0.16" strokeWidth="1.2" />
          <path d="M52 170 C120 138 154 150 210 150 S304 132 372 168" fill="none" stroke="#B5121B" strokeOpacity="0.2" strokeWidth="1.2" />
          <path d="M48 248 C118 280 160 268 210 268 S306 286 374 250" fill="none" stroke="#B5121B" strokeOpacity="0.2" strokeWidth="1.2" />
          <path d="M74 210 H346" stroke="#B5121B" strokeOpacity="0.14" strokeWidth="1.2" />
          <path d="M102 102 C158 150 174 210 142 318" fill="none" stroke="#D71920" strokeOpacity="0.45" strokeWidth="2" />
          <path d="M318 94 C274 150 250 230 294 330" fill="none" stroke="#D71920" strokeOpacity="0.42" strokeWidth="2" />
          <path d="M94 182 C162 154 260 206 332 166" fill="none" stroke="#B5121B" strokeOpacity="0.34" strokeWidth="2" strokeDasharray="5 8" />
          <path d="M112 284 C184 310 252 280 322 236" fill="none" stroke="#B5121B" strokeOpacity="0.34" strokeWidth="2" strokeDasharray="5 8" />
          <circle cx="102" cy="102" r="7" fill="#B5121B" />
          <circle cx="318" cy="94" r="7" fill="#D71920" />
          <circle cx="332" cy="166" r="7" fill="#B5121B" />
          <circle cx="142" cy="318" r="7" fill="#D71920" />
          <circle cx="294" cy="330" r="7" fill="#B5121B" />
          <circle cx="94" cy="182" r="5" fill="#D71920" />
          <circle cx="112" cy="284" r="5" fill="#B5121B" />
        </svg>
        <div className="landing-globe__center" aria-hidden="true">
          <GraduationCap className="landing-globe__icon" />
        </div>
      </div>

      <div className="landing-hero-card landing-hero-card--recommendations" aria-hidden="true">
        <span className="landing-hero-card__icon landing-hero-card__icon--red">
          <GraduationCap />
        </span>
        <div>
          <p className="landing-hero-card__title">Персональные рекомендации</p>
          <p className="landing-hero-card__text">Учитываем твои интересы,<br />баллы и цели</p>
        </div>
      </div>

      <div className="landing-hero-card landing-hero-card--universities" aria-hidden="true">
        <span className="landing-hero-card__icon landing-hero-card__icon--pink">
          <Globe2 />
        </span>
        <div>
          <p className="landing-hero-card__title">Университеты<br />по твоему профилю</p>
          <p className="landing-hero-card__text">Сравнивай, выбирай,<br />планируй</p>
        </div>
      </div>

      <div className="landing-hero-card landing-hero-card--plan" aria-hidden="true">
        <span className="landing-hero-card__icon landing-hero-card__icon--soft">
          <BarChart3 />
        </span>
        <div>
          <p className="landing-hero-card__title">Пошаговый план</p>
          <p className="landing-hero-card__text">Экзамены, документы,<br />дедлайны и активности</p>
        </div>
      </div>

      <div className="landing-hero-note landing-hero-note--top" aria-hidden="true">
        Больше возможностей
        <br />
        для твоего будущего
      </div>
      <div className="landing-hero-note landing-hero-note--bottom" aria-hidden="true">
        Твои мечты
        <br />
        ближе, чем кажется
      </div>
    </div>
  );
}
