"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#demo", label: "Демо" },
  { href: "/#problem", label: "Почему это важно" },
  { href: "/#product", label: "Решение" },
  { href: "/#how-it-works", label: "Схема" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="container-ulys flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-[20px] font-bold tracking-tight">
          ULYS
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/login" variant="tertiary" size="md">
            Войти
          </ButtonLink>
          <ButtonLink href="/signup" variant="primary" size="md">
            Начать
          </ButtonLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-line/70 bg-paper transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[420px]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container-ulys flex flex-col gap-1 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-[14.5px] font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 px-2">
            <ButtonLink href="/login" variant="secondary" size="md" className="w-full">
              Войти
            </ButtonLink>
            <ButtonLink href="/signup" variant="primary" size="md" className="w-full">
              Начать
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
