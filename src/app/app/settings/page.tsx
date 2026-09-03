"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { getAccount, StoredAccount } from "@/lib/account";
import { useProfile } from "@/hooks/useProfile";

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
  const [notifs, setNotifs] = useState({
    deadlines: true,
    recommendations: true,
    mentorTips: false,
  });
  const [account, setAccount] = useState<StoredAccount>(getAccount());
  const { profile } = useProfile();

  useEffect(() => {
    setAccount(getAccount());
  }, []);

  const displayName = profile.name ?? account.name;
  const displayEmail = profile.email ?? account.email ?? "pasha.b@example.com";
  const displayLocation = profile.location ?? account.location;

  return (
    <>
      <TopBar title="Настройки" />
      <div className="flex-1 space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Аккаунт</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" type="email" defaultValue={displayEmail} />
            <Field id="password" label="Пароль" type="password" defaultValue="••••••••" />
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Профиль</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Имя" type="text" defaultValue={displayName} />
            <Field id="location" label="Город" type="text" defaultValue={displayLocation} />
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
              <Toggle
                checked={notifs.deadlines}
                onChange={() => setNotifs((n) => ({ ...n, deadlines: !n.deadlines }))}
                label="Уведомления о дедлайнах"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Рекомендации</p>
                <p className="text-[12px] text-ink-soft">Новые подходящие возможности</p>
              </div>
              <Toggle
                checked={notifs.recommendations}
                onChange={() => setNotifs((n) => ({ ...n, recommendations: !n.recommendations }))}
                label="Уведомления о рекомендациях"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Советы от AI Mentor</p>
                <p className="text-[12px] text-ink-soft">Периодические подсказки от Uli</p>
              </div>
              <Toggle
                checked={notifs.mentorTips}
                onChange={() => setNotifs((n) => ({ ...n, mentorTips: !n.mentorTips }))}
                label="Советы от AI Mentor"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <h2 className="font-display text-[15px] font-semibold">Предпочтения</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lang" className="text-[13px] font-medium">Язык</label>
              <select id="lang" defaultValue="ru" className="h-11 rounded-xl border border-line px-3.5 text-[14px] outline-none">
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-paper hover:bg-red">
            Сохранить изменения
          </button>
        </div>
      </div>
    </>
  );
}
