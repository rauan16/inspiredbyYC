"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/app/TopBar";
import { Field } from "@/components/ui/Field";
import { getAccount } from "@/lib/account";
import { logout } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-ink" : "bg-line"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const account = getAccount();
  const { profile } = useProfile();
  const [notifs, setNotifs] = useState({ deadlines: true, recommendations: true });
  const displayName = profile.name ?? account.name;
  const displayEmail = profile.email ?? account.email;
  const displayLocation = profile.location ?? account.location;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      <TopBar title="Настройки" />
      <div className="flex-1 space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Аккаунт</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" type="email" value={displayEmail || "Не указано"} readOnly />
            <Field id="password" label="Пароль" type="password" value="••••••••" readOnly />
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Профиль</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Имя" type="text" value={displayName || "Не указано"} readOnly />
            <Field id="location" label="Город" type="text" value={displayLocation || "Не указано"} readOnly />
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Уведомления</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Дедлайны</p>
                <p className="text-[12px] text-ink-soft">Напоминания о приближающихся дедлайнах</p>
              </div>
              <Toggle checked={notifs.deadlines} onChange={() => setNotifs((current) => ({ ...current, deadlines: !current.deadlines }))} label="Уведомления о дедлайнах" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Рекомендации</p>
                <p className="text-[12px] text-ink-soft">Новые подходящие возможности</p>
              </div>
              <Toggle checked={notifs.recommendations} onChange={() => setNotifs((current) => ({ ...current, recommendations: !current.recommendations }))} label="Уведомления о рекомендациях" />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={handleLogout} className="rounded-full border border-line bg-white px-5 py-2.5 text-[13.5px] font-medium text-ink hover:border-red hover:text-red">
            Выйти
          </button>
        </div>
      </div>
    </>
  );
}
