"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { useUniversities } from "@/hooks/useUniversities";
import { getAccount, StoredAccount } from "@/lib/account";
import { computeUniversityAnalysis } from "@/lib/universityMatching";
import Link from "next/link";
import { Search } from "lucide-react";

const FIT_COLORS: Record<string, string> = {
  "Strong Fit": "text-blue",
  "Moderate Fit": "text-yellow",
  "Weak Fit": "text-red",
  "Not reliably estimable": "text-ink-soft",
};

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");
  const { universities } = useUniversities();
  const [account, setAccount] = useState<StoredAccount>(getAccount());

  useEffect(() => {
    const update = () => setAccount(getAccount());
    update();
    window.addEventListener("ulys-account-updated", update);
    return () => window.removeEventListener("ulys-account-updated", update);
  }, []);

  const filtered = useMemo(
    () =>
      universities.filter((u) =>
        `${u.name} ${u.country} ${u.city} ${u.majors.join(" ")}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const analyses = useMemo(() => {
    return filtered.map((u) => computeUniversityAnalysis(u, account));
  }, [filtered, account]);

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
          {filtered.map((u, i) => {
            const analysis = analyses[i];
            return (
              <Link
                key={u.id}
                href={`/app/universities/${u.id}`}
                className="rounded-[var(--radius-card)] border border-line bg-white p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-[16px] font-semibold leading-tight">{u.name}</p>
                    <p className="mt-1 text-[12.5px] text-ink-soft">
                      {u.city}, {u.country}
                    </p>
                  </div>
                  <span className={`font-display text-[12.5px] font-bold ${FIT_COLORS[analysis.profileMatch] || "text-ink-soft"}`}>
                    {analysis.profileMatch}
                  </span>
                </div>
                <p className="mt-3 text-[11.5px] text-ink-soft">Дедлайн заявки · {u.deadline}</p>
                <p className="mt-1 text-[11px] text-ink-soft">Уверенность: {analysis.confidence === "High" ? "Высокая" : analysis.confidence === "Medium" ? "Средняя" : "Низкая"}</p>
                {u.majors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {u.majors.slice(0, 3).map((m) => (
                      <span key={m} className="rounded-full bg-paper-dim px-2 py-0.5 text-[10px] font-medium text-ink">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
