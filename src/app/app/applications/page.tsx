"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { EmptyState } from "@/components/common/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Plus, FilePlus, Clock, CheckCircle2, AlertCircle, FileCheck, FileText } from "lucide-react";

const tabs = [
  { label: "Все", count: 0 },
  { label: "Черновики", count: 0 },
  { label: "Отправлены", count: 0 },
  { label: "В процессе", count: 0 },
  { label: "Приняты", count: 0 },
  { label: "Отклонены", count: 0 },
];

function ApplicationStructureCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-5 opacity-50">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <FilePlus className="h-3.5 w-3.5 text-ink-soft" />
            <div className="h-3 w-20 rounded bg-paper-dim" />
          </div>
          <div className="h-3 w-28 rounded bg-paper-dim" />
        </div>
        <div className="h-5 w-16 rounded bg-paper-dim" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="h-5 w-14 rounded bg-paper-dim" />
        <div className="h-5 w-20 rounded bg-paper-dim" />
        <div className="h-5 w-20 rounded bg-paper-dim" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-ink-soft" />
            <div className="h-3 w-24 rounded bg-paper-dim" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <FileCheck className="h-3 w-3 text-ink-soft" />
        <div className="h-3 w-16 rounded bg-paper-dim" />
      </div>
      <div className="mt-4 h-8 w-28 rounded bg-paper-dim" />
    </div>
  );
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("Все");

  return (
    <>
      <TopBar title="Мои заявки" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">APPLICATIONS</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">Мои заявки</h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">Отслеживай университетские заявки и их статусы в одном месте.</p>
          </div>
          <ButtonLink href="/app/universities" size="md" className="shrink-0">
            <Plus className="h-4 w-4" /> Добавить университет
          </ButtonLink>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                activeTab === tab.label
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-medium",
                  activeTab === tab.label
                    ? "bg-paper/20 text-paper"
                    : "bg-paper-dim text-ink-soft"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-[13px] font-medium text-ink-soft">0 активных заявок</p>

        <div className="mt-4">
          <EmptyState
            icon={<FilePlus className="h-5 w-5" />}
            title="Заявок пока нет"
            description="Когда ты выберешь университеты, здесь можно будет отслеживать заявки, документы и статусы."
            primaryAction={{ label: "Найти университеты →", href: "/app/universities" }}
          />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">Структура карточки заявки</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red">
              <FilePlus className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ApplicationStructureCard />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">University</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">Program</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">Status</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">Deadline</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">Documents</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 opacity-50">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-ink-soft" />
                <p className="font-display text-[13px] font-semibold">Next action</p>
              </div>
              <div className="mt-3 h-3 w-full rounded bg-paper-dim" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
