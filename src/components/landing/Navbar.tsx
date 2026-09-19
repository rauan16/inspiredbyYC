"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Возможности", href: "#benefits" },
  { label: "Как это работает", href: "#how-it-works" },
  { label: "Преимущества", href: "#benefits" },
  { label: "Отзывы", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className={cn("landing-navbar", scrolled && "landing-navbar--scrolled")}>
      <div className="landing-container landing-navbar__inner">
        <Link href="/" className="landing-wordmark" aria-label="ULYS — на главную">
          <span className="landing-wordmark__icon" aria-hidden="true">U</span>
          <span>ULYS</span>
        </Link>

        <nav className="landing-desktop-nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="landing-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="landing-navbar__actions">
          <Link href="/signup" className="landing-button landing-button--primary landing-button--navbar">
            Начать бесплатно
          </Link>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="landing-mobile-menu"
        className={cn("landing-mobile-menu", menuOpen && "landing-mobile-menu--open")}
        hidden={!menuOpen}
      >
        <nav className="landing-container" aria-label="Мобильная навигация">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="landing-mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="landing-mobile-menu__actions">
            <Link href="/login" className="landing-button landing-button--secondary" onClick={() => setMenuOpen(false)}>
              Войти
            </Link>
            <Link href="/signup" className="landing-button landing-button--primary" onClick={() => setMenuOpen(false)}>
              Начать бесплатно
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
