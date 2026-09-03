"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { OpportunityCard } from "@/components/app/OpportunityCard";
import { opportunities as staticOpportunities } from "@/data/opportunities";
import { Search, Bookmark } from "lucide-react";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";

export default function SavedPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"deadline" | "title">("deadline");
  const { saved, loading } = useSavedOpportunities();

  const displaySaved = saved.length > 0 ? saved : staticOpportunities.filter((o) => o.saved);

  const filtered = useMemo(() => {
    const list = displaySaved.filter(
      (o) => `${o.title} ${o.organization}`.toLowerCase().includes(query.toLowerCase())
    );
    return [...list].sort((a, b) =>
      sort === "deadline"
        ? (a.deadlineType === "rolling"
            ? Infinity
            : a.deadline
              ? new Date(a.deadline).getTime()
              : Infinity) -
          (b.deadlineType === "rolling"
            ? Infinity
            : b.deadline
              ? new Date(b.deadline).getTime()
              : Infinity)
        : a.title.localeCompare(b.title)
    );
  }, [query, sort, displaySaved]);

  return (
    <>
      <TopBar title="Сохранённое" />
      <div className="flex-1 space-y-6 px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Поиск в сохранённом..."
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "deadline" | "title")}
            className="h-11 rounded-full border border-line bg-white px-4 text-[13px] outline-none"
          >
            <option value="deadline">По дедлайну</option>
            <option value="title">По названию</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white py-16 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-ink-soft" />
            <p className="mt-3 font-display text-[15px] font-semibold">Пока пусто</p>
            <p className="mx-auto mt-1.5 max-w-xs text-[13px] text-ink-soft">
              Сохраняй интересные возможности звёздочкой — они появятся здесь.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
