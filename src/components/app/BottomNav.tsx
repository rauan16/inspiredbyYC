"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Compass, Sparkles, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Дашборд", icon: LayoutGrid },
  { href: "/app/opportunities", label: "Возможности", icon: Compass },
  { href: "/app/mentor", label: "Mentor", icon: Sparkles },
  { href: "/app/portfolio", label: "Портфолио", icon: FileText },
  { href: "/app/profile", label: "Профиль", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-2" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
        {navItems.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-soft"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className={cn("text-[10px] font-medium", active ? "text-ink" : "text-ink-soft")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
