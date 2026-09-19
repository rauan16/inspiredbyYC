"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { EmptyState } from "@/components/common/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  FileText,
  Globe,
  Info,
  Search,
  Users,
} from "lucide-react";

const mentorTabs = ["Все", "Студенты", "Выпускники", "Индустрия", "Консультанты"];

const filterOptions = {
  country: ["Все страны", "Казахстан", "Россия", "Великобритания", "США", "Китай", "Сингапур", "Швейцария", "Германия", "Южная Корея"],
  university: ["Все университеты", "Nazarbayev University", "KBTU", "HSE University", "KAIST", "Tsinghua", "NUS", "NTU", "Imperial", "UCL"],
  field: ["Все направления", "Computer Science", "Engineering", "Business", "Medicine", "Sciences"],
};

function MentorProfileSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-5 opacity-50">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-paper-dim" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-paper-dim" />
          <div className="h-3 w-36 rounded bg-paper-dim" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="h-5 w-16 rounded bg-paper-dim" />
        <div className="h-5 w-20 rounded bg-paper-dim" />
        <div className="h-5 w-14 rounded bg-paper-dim" />
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-ink-soft" />
        <div className="h-3 w-24 rounded bg-paper-dim" />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <FileText className="h-3 w-3 text-ink-soft" />
        <div className="h-3 w-20 rounded bg-paper-dim" />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-ink-soft" />
        <div className="h-3 w-24 rounded bg-paper-dim" />
      </div>
    </div>
  );
}

export default function MentorPage() {
  const [activeTab, setActiveTab] = useState("Все");
  const [query, setQuery] = useState("");

  return (
    <>
      <TopBar title="Менторы" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">MENTOR</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">Менторы</h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">Получай поддержку от студентов и выпускников университетов.</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red"><Users className="h-5 w-5" /></span>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {mentorTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                activeTab === tab
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 sm:max-w-sm opacity-50">
              <Search className="h-4 w-4 text-ink-soft" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Поиск ментора..."
                disabled
                className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70 disabled:cursor-not-allowed"
              />
            </div>
            <select
              className="h-11 rounded-full border border-line bg-white px-4 text-[13px] text-ink-soft outline-none opacity-50 disabled:cursor-not-allowed"
              disabled
              aria-label="Страна"
              defaultValue="Все страны"
            >
              {filterOptions.country.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              className="h-11 rounded-full border border-line bg-white px-4 text-[13px] text-ink-soft outline-none opacity-50 disabled:cursor-not-allowed"
              disabled
              aria-label="Университет"
              defaultValue="Все университеты"
            >
              {filterOptions.university.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              className="h-11 rounded-full border border-line bg-white px-4 text-[13px] text-ink-soft outline-none opacity-50 disabled:cursor-not-allowed"
              disabled
              aria-label="Направление"
              defaultValue="Все направления"
            >
              {filterOptions.field.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-6">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="Менторы появятся здесь"
            description="Мы готовим пространство, где ты сможешь находить студентов и выпускников университетов и задавать им вопросы о поступлении и учёбе."
          />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">Так будут выглядеть профили менторов</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red"><Users className="h-4 w-4" /></span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MentorProfileSkeleton />
          </div>
        </div>

        <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow"><Info className="h-4 w-4" /></span>
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ULIE</p>
                <h2 className="mt-1 font-display text-[16px] font-semibold">Нужен быстрый ответ?</h2>
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-soft">ULIE — AI-помощник, который использует контекст твоего профиля и roadmap.</p>
              </div>
            </div>
            <ButtonLink href="/app/ulie" size="md" variant="secondary">
              Спросить ULIE <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>
    </>
  );
}
