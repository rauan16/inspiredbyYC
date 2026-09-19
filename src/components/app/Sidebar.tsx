"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
  GitCompareArrows,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";

const primaryNav = [
  { label: "Главная", href: "/app", icon: LayoutDashboard },
  { label: "Мой профиль", href: "/app/profile", icon: UserRound },
  { label: "Университеты", href: "/app/universities", icon: GraduationCap },
  { label: "Roadmap", href: "/app/roadmap", icon: Map },
];

const featureNav = [
  { label: "ULYS What-If", href: "/app/what-if", icon: GitCompareArrows },
  { label: "ULIE", href: "/app/ulie", icon: Sparkles },
  { label: "Mentor", href: "/app/mentor?view=human", icon: Users },
];

const bottomNav = [
  { label: "Заявки", href: "/app/applications", icon: Briefcase },
];

function NavLink({
  label,
  href,
  icon: Icon,
  collapsed,
  pathname,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  collapsed: boolean;
  pathname: string;
}) {
  const active =
    pathname === href || (href.split("?")[0] !== "/app" && pathname.startsWith(`${href.split("?")[0]}/`));
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        active ? "bg-red/10 text-red" : "text-ink-soft hover:bg-red/[0.06] hover:text-ink"
      )}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={cn("h-4 w-4 shrink-0", active ? "text-red" : "text-ink-soft/70")}
      />
      <span
        className={cn(
          "whitespace-nowrap transition-all duration-200",
          collapsed ? "hidden w-0 overflow-hidden opacity-0" : "block w-auto opacity-100"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function NavGroup({
  items,
  collapsed,
  pathname,
}: {
  items: typeof primaryNav;
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.href} {...item} collapsed={collapsed} pathname={pathname} />
      ))}
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const account = getAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink shadow-sm lg:hidden"
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "flex flex-col border-r border-line bg-paper transition-[width] duration-200",
          collapsed ? "w-[72px] px-2" : "w-[220px] px-4 py-5",
          "lg:flex hidden"
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            className={cn("inline-flex items-center gap-2.5 font-display text-[17px] font-bold text-ink", collapsed && "px-1")}
            aria-label="ULYS"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red text-white">
              ✦
            </span>
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200",
                collapsed ? "hidden w-0 overflow-hidden opacity-0" : "block w-auto opacity-100"
              )}
            >
              ULYS
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-red/[0.06] hover:text-ink",
              collapsed ? "" : "ml-auto"
            )}
            aria-label={collapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
            title={collapsed ? "Развернуть" : "Свернуть"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="mt-9 flex flex-1 flex-col gap-6" aria-label="Основная навигация">
          <NavGroup items={primaryNav} collapsed={collapsed} pathname={pathname} />

          <div className={cn("mx-3 border-t border-line", collapsed && "mx-2")} />

          <NavGroup items={featureNav} collapsed={collapsed} pathname={pathname} />

          <div className={cn("mx-3 border-t border-line", collapsed && "mx-2")} />

          <div className="flex flex-col gap-1">
            {bottomNav.map((item) => (
              <NavLink key={item.href} {...item} collapsed={collapsed} pathname={pathname} />
            ))}
          </div>
        </nav>

        <div className={cn("mt-auto space-y-3", collapsed && "items-center")}>
          <Link
            href="/app/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
              pathname === "/app/settings" ? "bg-red/10 text-red" : "text-ink-soft hover:bg-red/[0.06] hover:text-ink",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Настройки" : undefined}
          >
            <Settings
              className={cn(
                "h-4 w-4 shrink-0",
                pathname === "/app/settings" ? "text-red" : "text-ink-soft/70"
              )}
            />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200",
                collapsed ? "hidden w-0 overflow-hidden opacity-0" : "block w-auto opacity-100"
              )}
            >
              Настройки
            </span>
          </Link>
          <div
            className={cn("rounded-2xl border border-line bg-white p-3", collapsed && "flex justify-center px-2")}
          >
            <div className={cn("flex items-center gap-2.5", collapsed && "flex-col gap-1")}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red text-[11px] font-bold text-white">
                {(account.name || "U").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
              </span>
              <div className={cn("min-w-0", collapsed ? "hidden" : "block")}>
                <p className="truncate text-[12.5px] font-medium text-ink">{account.name || "Профиль"}</p>
                <p className="truncate text-[10.5px] text-ink-soft">Профиль</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60 bg-paper px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between px-1">
              <Link
                href="/app"
                className="inline-flex items-center gap-2.5 font-display text-[17px] font-bold text-ink"
                aria-label="ULYS"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white">✦</span>
                ULYS
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-white"
                aria-label="Закрыть меню"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-9 flex flex-1 flex-col gap-6" aria-label="Основная навигация">
              <NavGroup items={primaryNav} collapsed={false} pathname={pathname} />
              <div className="mx-3 border-t border-line" />
              <NavGroup items={featureNav} collapsed={false} pathname={pathname} />
              <div className="mx-3 border-t border-line" />
              <div className="flex flex-col gap-1">
                {bottomNav.map((item) => (
                  <NavLink key={item.href} {...item} collapsed={false} pathname={pathname} />
                ))}
              </div>
            </nav>

            <div className="mt-auto space-y-3">
              <Link
                href="/app/settings"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                  pathname === "/app/settings" ? "bg-red/10 text-red" : "text-ink-soft hover:bg-red/[0.06] hover:text-ink"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Settings className={cn("h-4 w-4", pathname === "/app/settings" ? "text-red" : "text-ink-soft/70")} />
                Настройки
              </Link>
              <div className="rounded-2xl border border-line bg-white p-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red text-[11px] font-bold text-white">
                    {(account.name || "U").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-ink">{account.name || "Профиль"}</p>
                    <p className="truncate text-[10.5px] text-ink-soft">Профиль</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
