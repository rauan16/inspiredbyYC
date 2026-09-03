"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { OpportunityCard } from "@/components/app/OpportunityCard";
import { student } from "@/data/student";
import { getAccount, StoredAccount } from "@/lib/account";
import { getDeadlineLabel, isDeadlinePassed } from "@/lib/utils";
import { Opportunity } from "@/types";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useOnlineStatus } from "@/hooks/useApi";

export default function DashboardPage() {
  const [account, setAccount] = useState<StoredAccount>(student);
  const { profile } = useProfile();
  const { opportunities } = useOpportunities();
  const { savedIds } = useSavedOpportunities();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setAccount(getAccount());
  }, []);

  const recommended = opportunities
    .filter((o) => o.recommended && o.status === "active")
    .slice(0, 3);
  const deadlines = useMemo(
    () =>
      [...opportunities]
        .filter((o) => o.status === "active" && !isDeadlinePassed(o.deadline, o.deadlineType))
        .sort((a, b) => {
          const aTime = a.deadlineType === "rolling" ? Infinity : new Date(a.deadline).getTime();
          const bTime = b.deadlineType === "rolling" ? Infinity : new Date(b.deadline).getTime();
          return aTime - bTime;
        })
        .slice(0, 4),
    [opportunities]
  );
  const saved = opportunities.filter((o) => savedIds.includes(o.id)).slice(0, 2);

  return (
    <>
      <TopBar />
      <div className="mx-auto flex max-w-[1400px] flex-1 flex-col space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        {!isOnline && (
          <div className="rounded-2xl border border-yellow bg-yellow-dim px-4 py-2.5 text-[12.5px] text-ink">
            Оффлайн-режим. Данные могут быть неактуальными. Изменения синхронизируются при подключении.
          </div>
        )}

        <section className="relative overflow-hidden rounded-[28px] border border-line/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(244,232,216,0.9))] p-5 shadow-[0_24px_45px_rgba(41,37,34,0.06)] lg:p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red/10 blur-2xl" />
          <div className="absolute -bottom-12 left-20 h-28 w-28 rounded-full bg-yellow/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Твой поток</p>
              <h2 className="mt-2 font-display text-[28px] font-semibold leading-none tracking-[-0.07em] text-ink">
                Двигайся к целям быстрее.
              </h2>
              <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-ink-soft">
                Подборки возможностей, дедлайны и рекомендации собраны в одном месте — чтобы ты мог действовать без лишних шагов.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:min-w-[320px]">
              <div className="rounded-2xl border border-line/80 bg-white/70 p-3 text-left shadow-[0_10px_22px_rgba(41,37,34,0.04)]">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Возможности</p>
                <p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.06em]">{opportunities.filter((o) => o.status === "active").length}</p>
              </div>
              <div className="rounded-2xl border border-line/80 bg-white/70 p-3 text-left shadow-[0_10px_22px_rgba(41,37,34,0.04)]">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Сохранено</p>
                <p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.06em]">{saved.length}</p>
              </div>
              <div className="rounded-2xl border border-line/80 bg-white/70 p-3 text-left shadow-[0_10px_22px_rgba(41,37,34,0.04)]">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Дедлайн</p>
                <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.06em]">
                  {deadlines[0] ? getDeadlineLabel(deadlines[0].deadline, deadlines[0].deadlineType) : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.04em]">Рекомендовано для тебя</h2>
            <Link
              href="/app/opportunities"
              className="flex items-center gap-1 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Все возможности <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-[var(--radius-card)] border border-line/80 bg-white/75 p-5 shadow-[0_14px_30px_rgba(41,37,34,0.04)] lg:col-span-2">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.04em]">Ближайшие дедлайны</h2>
            <ul className="mt-4 divide-y divide-line">
              {deadlines.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/app/opportunities/${o.id}`}
                      className="truncate text-[13.5px] font-medium hover:underline"
                    >
                      {o.title}
                    </Link>
                    <p className="text-[11.5px] text-ink-soft">{o.organization}</p>
                  </div>
                   <Badge className="shrink-0">
                    <Clock className="h-3 w-3" />
                    {getDeadlineLabel(o.deadline, o.deadlineType)}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line/80 bg-white/75 p-5 shadow-[0_14px_30px_rgba(41,37,34,0.04)]">
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.04em]">Портфолио</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[5px] border-red shadow-[0_12px_24px_rgba(226,56,43,0.18)]">
                <span className="font-display text-[15px] font-bold">
                  {profile.portfolioStrength ?? account.portfolioStrength ?? 0}%
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                Добавь один проект и раздел «О себе», чтобы усилить профиль.
              </p>
            </div>
            <ButtonLink href="/app/portfolio" variant="secondary" size="md" className="mt-4 w-full">
              Открыть портфолио <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <MentorTip opportunities={opportunities} messages={[]} />
        </div>

        {saved.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.04em]">Сохранённое</h2>
              <Link
                href="/app/saved"
                className="flex items-center gap-1 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Все сохранённые <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {saved.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function MentorTip({ opportunities }: { opportunities: Opportunity[]; messages: unknown[] }) {
  const lastMentorTip = opportunities.find((o) => o.recommended && o.saved);

  if (!lastMentorTip) return null;

  return (
    <section className="rounded-[var(--radius-card)] border border-line/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(241,221,216,0.75))] p-5 shadow-[0_16px_34px_rgba(41,37,34,0.05)] lg:col-span-2">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white shadow-[0_12px_22px_rgba(226,56,43,0.25)]">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.04em]">Рекомендация</h2>
      </div>
      <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
        Посмотри рекомендованные возможности и сохрани те, что тебе подходят.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href="/app/opportunities" variant="primary" size="sm">
          Смотреть возможности
        </ButtonLink>
        <ButtonLink href="/app/mentor" variant="secondary" size="sm">
          Спросить ULIE
        </ButtonLink>
      </div>
    </section>
  );
}
