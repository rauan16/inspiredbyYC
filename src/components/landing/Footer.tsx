import Link from "next/link";

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer__grid">
        <div className="landing-footer__brand">
          <Link href="/" className="landing-wordmark" aria-label="ULYS — на главную">
            <span className="landing-wordmark__icon" aria-hidden="true">U</span>
            <span>ULYS</span>
          </Link>
          <p>AI-навигация по твоему пути к университету.</p>
        </div>

        <div className="landing-footer__column">
          <h2>Продукт</h2>
          <Link href="#benefits">Возможности</Link>
          <Link href="#how-it-works">Как это работает</Link>
          <Link href="/app/mentor">ULIE</Link>
        </div>

        <div className="landing-footer__column">
          <h2>Ресурсы</h2>
          <Link href="/app/universities">Университеты</Link>
          <Link href="#faq">FAQ</Link>
        </div>

        <div className="landing-footer__column">
          <h2>Аккаунт</h2>
          <Link href="/login">Войти</Link>
          <Link href="/signup">Начать бесплатно</Link>
        </div>
      </div>

      <div className="landing-container landing-footer__bottom">
        <span>© 2026 ULYS</span>
        <span>Персональный маршрут поступления</span>
      </div>
    </footer>
  );
}
