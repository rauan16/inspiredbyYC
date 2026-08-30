"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  Sparkles,
  FileText,
  GraduationCap,
  Bookmark,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { student } from "@/data/student";
import { getAccount } from "@/lib/account";
import { useEffect, useState } from "react";
import { logout } from "@/lib/auth";
import { useOnlineStatus } from "@/hooks/useApi";

const navItems = [
  { href: "/app", label: "Дашборд", icon: LayoutGrid },
  { href: "/app/opportunities", label: "Возможности", icon: Compass },
  { href: "/app/mentor", label: "AI Mentor", icon: Sparkles },
  { href: "/app/portfolio", label: "Портфолио", icon: FileText },
  { href: "/app/universities", label: "Университеты", icon: GraduationCap },
  { href: "/app/saved", label: "Сохранённое", icon: Bookmark },
  { href: "/app/profile", label: "Профиль", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [account, setAccount] = useState(student);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const update = () => setAccount(getAccount());
    update();
    window.addEventListener("ulys-account-updated", update);
    return () => window.removeEventListener("ulys-account-updated", update);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-line/70 bg-white/75 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="mb-6 flex items-center justify-between px-2">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-[20px] font-bold tracking-[-0.06em]">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red text-sm text-white shadow-[0_12px_25px_rgba(226,56,43,0.35)]">
            U
          </span>
          ULYS
        </Link>
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isOnline ? "bg-green-500" : "bg-yellow"
          )}
          title={isOnline ? "Онлайн" : "Оффлайн"}
        />
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                active
                  ? "bg-ink text-paper shadow-[0_12px_25px_rgba(41,37,34,0.18)]"
                  : "text-ink-soft hover:-translate-x-0.5 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex flex-col gap-1.5">
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
            pathname.startsWith("/app/settings")
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-ink/5 hover:text-ink"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Настройки
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium text-ink-soft transition-all duration-200 hover:bg-red/5 hover:text-red"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Выйти
        </button>

        <Link
          href="/app/profile"
          className="mt-3 flex items-center gap-2.5 rounded-2xl border border-line/80 bg-paper-dim/80 px-2.5 py-2.5 shadow-[0_10px_20px_rgba(41,37,34,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f59d90,_#e2382b)] font-display text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(226,56,43,0.28)]">
            {account.avatarInitials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{account.name}</p>
            <p className="truncate text-[11.5px] text-ink-soft">{account.grade}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
