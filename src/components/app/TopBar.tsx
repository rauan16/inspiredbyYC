"use client";

import Link from "next/link";
import { Bell, Search, UserRound } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useApi";

export function TopBar({ title }: { title?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-paper/95 px-5 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">ULYS / APP</p>
        <h1 className="truncate font-display text-[15px] font-semibold text-ink">{title || "Главная"}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/app/search" className="hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[12px] text-ink-soft hover:border-ink/40 hover:text-ink sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Поиск</span>
        </Link>
        <Link href="/app/notifications" aria-label="Уведомления" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink">
          <Bell className="h-4 w-4" />
        </Link>
        <Link href="/app/profile" aria-label="Профиль" className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-white hover:bg-red/90">
          <UserRound className="h-4 w-4" />
        </Link>
        <span className={cn("hidden h-2 w-2 rounded-full sm:inline-block", isOnline ? "bg-green" : "bg-red")} title={isOnline ? "ULYS онлайн" : "ULYS офлайн"} />
      </div>
    </header>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
