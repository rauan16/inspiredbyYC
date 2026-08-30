"use client";

import { Bell, Search, Wifi, WifiOff } from "lucide-react";
import { student } from "@/data/student";
import { getAccount } from "@/lib/account";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useApi";

export function TopBar({ title }: { title?: string }) {
  const [account, setAccount] = useState(student);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const update = () => setAccount(getAccount());
    update();
    window.addEventListener("ulys-account-updated", update);
    return () => window.removeEventListener("ulys-account-updated", update);
  }, []);

  return (
    <div className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 px-5 py-3.5 backdrop-blur-xl lg:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
        <div>
          {title ? (
            <h1 className="font-display text-[16px] font-semibold tracking-[-0.04em]">{title}</h1>
          ) : (
            <p className="font-display text-[16px] font-semibold tracking-[-0.04em]">
              Привет, {account.name.split(" ")[0]}!
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 sm:flex">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-yellow" />
            )}
            <span className="text-[11px] text-ink-soft">{isOnline ? "Онлайн" : "Оффлайн"}</span>
          </div>
          <form
            action="/app/search"
            className="hidden items-center gap-2 rounded-2xl border border-line/80 bg-white/80 px-3.5 py-2.5 text-ink-soft shadow-[0_10px_25px_rgba(41,37,34,0.04)] sm:flex"
          >
            <Search className="h-4 w-4" />
            <input
              name="q"
              type="text"
              placeholder="Поиск возможностей, университетов..."
              className="w-64 bg-transparent text-[13px] outline-none placeholder:text-ink-soft/70"
            />
          </form>
          <button
            aria-label="Уведомления"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-ink-soft shadow-[0_10px_22px_rgba(41,37,34,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-ink"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
