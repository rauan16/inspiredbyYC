"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderInput, GraduationCap, LayoutDashboard, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Главная", href: "/app", icon: LayoutDashboard },
  { label: "Профиль", href: "/app/profile", icon: UserRound },
  { label: "Вузы", href: "/app/universities", icon: GraduationCap },
  { label: "ULIE", href: "/app/ulie", icon: Sparkles },
  { label: "Заявки", href: "/app/applications", icon: FolderInput },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-stretch border-t border-line bg-paper/95 backdrop-blur-sm lg:hidden" aria-label="Мобильная навигация">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium",
              active ? "text-red" : "text-ink-soft"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
