"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { universities } from "@/data/universities";
import Link from "next/link";
import { Search } from "lucide-react";

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      universities.filter((u) =>
        `${u.name} ${u.country} ${u.location}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <>
      <TopBar title="Университеты" />
      <div className="flex-1 space-y-6 px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Поиск университета..."
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Link
              key={u.id}
              href={`/app/universities/${u.id}`}
              className="rounded-[var(--radius-card)] border border-line bg-white p-5 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-[16px] font-semibold leading-tight">{u.name}</p>
                  <p className="mt-1 text-[12.5px] text-ink-soft">
                    {u.location}, {u.country}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-blue font-display text-[12.5px] font-bold text-blue">
                  {u.analysis.profileMatch}%
                </span>
              </div>
              <p className="mt-4 text-[11.5px] text-ink-soft">Дедлайн заявки · {u.deadline}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
