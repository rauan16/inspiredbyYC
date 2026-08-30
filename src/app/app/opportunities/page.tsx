"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { OpportunityCard } from "@/components/app/OpportunityCard";
import { opportunities as staticOpportunities } from "@/data/opportunities";
import { OpportunityCategory } from "@/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";

const categories: { value: OpportunityCategory | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "olympiad", label: "Олимпиады" },
  { value: "hackathon", label: "Хакатоны" },
  { value: "volunteering", label: "Волонтёрство" },
  { value: "internship", label: "Стажировки" },
  { value: "scholarship", label: "Стипендии" },
  { value: "forum", label: "Форумы" },
  { value: "research", label: "Исследования" },
];

const formats = [
  { value: "all", label: "Любой формат" },
  { value: "online", label: "Онлайн" },
  { value: "offline", label: "Офлайн" },
  { value: "hybrid", label: "Гибрид" },
];

export default function OpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [onlyRecommended, setOnlyRecommended] = useState(false);

  const { opportunities: apiOpportunities, loading } = useOpportunities();

  const opportunities = apiOpportunities.length > 0 ? apiOpportunities : staticOpportunities;

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (query && !`${o.title} ${o.organization}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (category !== "all" && o.category !== category) return false;
      if (format !== "all" && o.format !== format) return false;
      if (onlyRecommended && !o.recommended) return false;
      return true;
    });
  }, [query, category, format, onlyRecommended, opportunities]);

  return (
    <>
      <TopBar title="Возможности" />
      <div className="flex-1 space-y-6 px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Поиск по названию или организации..."
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70"
              aria-label="Поиск возможностей"
            />
          </div>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-11 rounded-full border border-line bg-white px-4 text-[13px] text-ink outline-none"
            aria-label="Фильтр по формату"
          >
            {formats.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                category === c.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink"
              )}
            >
              {c.label}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
          <button
            onClick={() => setOnlyRecommended((v) => !v)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              onlyRecommended
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink"
            )}
          >
            Рекомендовано
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        ) : (
          <>
            <p className="text-[12.5px] text-ink-soft">Найдено: {filtered.length}</p>

            {filtered.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white py-16 text-center">
                <p className="font-display text-[15px] font-semibold">Ничего не найдено</p>
                <p className="mt-1.5 text-[13px] text-ink-soft">
                  Попробуй изменить запрос или сбросить фильтры.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
