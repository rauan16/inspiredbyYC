import Link from "next/link";
import { Send, Globe, MessageCircle } from "lucide-react";

const productLinks = [
  { href: "/#product", label: "Продукт" },
  { href: "/#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-paper">
      <div className="container-ulys flex flex-col gap-10 py-14 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <p className="font-display text-[20px] font-bold">ULYS</p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            Возможности, портфолио и путь к поступлению — в одном месте.
          </p>
          <div className="mt-5 flex gap-3">
            {[Send, MessageCircle, Globe].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
                aria-label="Социальная сеть"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              Продукт
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[13.5px] text-ink-soft hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              Правовая информация
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="/privacy" className="text-[13.5px] text-ink-soft hover:text-ink">
                  Конфиденциальность
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[13.5px] text-ink-soft hover:text-ink">
                  Условия использования
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line/70 py-5">
        <div className="container-ulys flex flex-col-reverse items-center gap-2 text-[12px] text-ink-soft md:flex-row md:justify-between">
          <span>© 2026 ULYS. Все права защищены.</span>
          <span>Алматы, Казахстан</span>
        </div>
      </div>
    </footer>
  );
}
