"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { ButtonLink } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import { useUniversityRecommendations } from "@/hooks/useUniversityRecommendations";
import { useSelectedUniversities } from "@/hooks/useSelectedUniversities";
import { getAccount } from "@/lib/account";
import { cn } from "@/lib/utils";
import { UniversityRecommendation } from "@/types";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Loader2,
  Search,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

const categoryConfig: Record<string, { label: string; color: string }> = {
  target: { label: "Целевой", color: "bg-yellow/10 text-yellow" },
  ambitious: { label: "Амбициозный", color: "bg-red/10 text-red" },
  safer: { label: "Более безопасный", color: "bg-green/10 text-green" },
};

function CategoryBadge({ category }: { category: string }) {
  const config = categoryConfig[category] || { label: category, color: "bg-ink/10 text-ink" };
  const Icon = category === "target" ? TrendingUp : category === "ambitious" ? Target : CheckCircle2;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function UniversityMatchCard({ rec, isSelected, onToggle }: {
  rec: UniversityRecommendation;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-[15px] font-semibold truncate">{rec.name}</h3>
            <CategoryBadge category={rec.category} />
          </div>
          <p className="mt-1 text-[12.5px] text-ink-soft flex items-center gap-2">
            <span>{rec.city}, {rec.country}</span>
            <span>•</span>
            <span>{rec.program || "Программа"}</span>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-medium text-ink-soft">Совпадение</span>
                <span className="font-display text-[15px] font-bold text-red">{rec.match_score}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-paper-dim">
                <div className="h-full rounded-full bg-red" style={{ width: `${rec.match_score}%` }} />
              </div>
            </div>
          </div>

          {rec.reasons.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-soft">Почему подходит</p>
              <ul className="mt-1 space-y-0.5">
                {rec.reasons.slice(0, 2).map((reason, i) => (
                  <li key={i} className="text-[12px] text-ink-soft flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-green mt-0.5" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rec.gaps.length > 0 && (
            <div className="mt-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-soft">Пробелы</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">
                {rec.gaps.slice(0, 2).join(" · ")}
              </p>
            </div>
          )}

          {rec.next_actions.length > 0 && (
            <div className="mt-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-soft">След. действия</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">
                {rec.next_actions.slice(0, 1).join(" · ")}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all",
            isSelected
              ? "border-red bg-red text-white"
              : "border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
          )}
          aria-label={isSelected ? "Убрать из сравнения" : "Добавить в сравнение"}
        >
          {isSelected ? <X className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function MatchScoreExplanation() {
  return (
    <aside className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><Info className="h-4 w-4" /></span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">ULYS MATCH</p>
          <h2 className="mt-1 font-display text-[15px] font-semibold">Что означает ULYS Match?</h2>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
        ULYS Match показывает совместимость твоего профиля с программой по доступным данным и предпочтениям на основе реального анализа требований.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Это не показатель вероятности зачисления. ULYS связывает твой профиль, портфолио и требования вуза, чтобы показать, насколько они совпадают.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1.5 text-[11px] font-medium text-ink-soft">
        <CheckCircle2 className="h-3 w-3" /> Совместимость, а не результат
      </div>
    </aside>
  );
}

export default function UniversitiesPage() {
  const { profile } = useProfile();
  const account = getAccount();
  const { recommendations, error, loading } = useUniversityRecommendations();
  const { isSelected, toggle, selectedIds } = useSelectedUniversities();

  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOption, setSortOption] = useState("relevance");

  const hasProfileData = useMemo(() => {
    return Boolean(
      profile.name?.trim() ||
      account.name?.trim() ||
      profile.grade?.trim() ||
      account.grade?.trim() ||
      profile.academicInfo?.primaryField ||
      account.academicInfo?.primaryField
    );
  }, [profile, account]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    for (const rec of recommendations) {
      if (rec.country) countries.add(rec.country);
    }
    return ["Все страны", ...Array.from(countries).sort()];
  }, [recommendations]);

  const filteredAndSorted = useMemo(() => {
    let result = recommendations || [];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (rec) =>
          rec.name.toLowerCase().includes(q) ||
          rec.program?.toLowerCase().includes(q) ||
          rec.country.toLowerCase().includes(q)
      );
    }

    if (countryFilter && countryFilter !== "Все страны") {
      result = result.filter((rec) => rec.country === countryFilter);
    }

    if (categoryFilter) {
      result = result.filter((rec) => rec.category === categoryFilter);
    }

    if (sortOption === "score_desc") {
      result = [...result].sort((a, b) => b.match_score - a.match_score);
    } else if (sortOption === "score_asc") {
      result = [...result].sort((a, b) => a.match_score - b.match_score);
    } else {
      result = [...result].sort((a, b) => b.match_score - a.match_score);
    }

    return result;
  }, [recommendations, query, countryFilter, categoryFilter, sortOption]);

  const selectedCount = selectedIds.length;

  return (
    <>
      <TopBar title="Университеты" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ULYS MATCH</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">Подходящие университеты</h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              Персональная подборка на основе твоего профиля, целей и предпочтений.
              ULYS сопоставит профиль с университетами и программами и объяснит, почему каждый вариант может тебе подходить.
            </p>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-paper-dim px-3 py-1.5 text-[12px]">
              <span className="font-medium text-ink">{selectedCount} выбрано</span>
              <ArrowRight className="h-3 w-3 text-ink-soft" />
              <ButtonLink href="/app/compare" size="sm" variant="secondary">
                Сравнить
              </ButtonLink>
            </div>
          )}
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {!loading && !error && recommendations && recommendations.length > 0 ? (
            <MatchScoreExplanation />
          ) : (
            <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><Info className="h-4 w-4" /></span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">WHAT THIS MEANS</p>
                  <h2 className="mt-1 font-display text-[15px] font-semibold">Что означает ULYS Match?</h2>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">ULYS Match показывает совместимость твоего профиля с программой по доступным данным и предпочтениям.</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">Это не показатель зачисления.</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1.5 text-[11px] font-medium text-ink-soft">
                <CheckCircle2 className="h-3 w-3" /> Совместимость, а не результат
              </div>
            </section>
          )}

          {!loading && !error && recommendations && recommendations.length > 0 && (
            <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12 lg:col-span-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><Target className="h-7 w-7" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Твои рекомендации появятся здесь</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
                ULYS сопоставит твой профиль с университетами и программами и объяснит, почему каждый вариант может тебе подходить.
              </p>
              <div className="mt-6">
                <ButtonLink href="/app/profile" size="md">Подготовить профиль <ArrowRight className="h-4 w-4" /></ButtonLink>
              </div>
            </section>
          )}

          {loading && (
            <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12 lg:col-span-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><Loader2 className="h-7 w-7 animate-spin" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Загрузка рекомендаций…</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
                ULYS анализирует твой профиль и подбирает подходящие программы.
              </p>
            </section>
          )}

          {error === "unauthorized" && (
            <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12 lg:col-span-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><Info className="h-7 w-7" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Требуется вход</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
                Войди, чтобы увидеть персональные рекомендации.
              </p>
            </section>
          )}

          {error === "server_error" && (
            <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12 lg:col-span-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><Info className="h-7 w-7" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Ошибка сервера</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
                Не удалось загрузить рекомендации. Попробуйте позже.
              </p>
            </section>
          )}

          {error && error !== "unauthorized" && error !== "server_error" && (
            <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12 lg:col-span-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><Info className="h-7 w-7" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Ошибка загрузки</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
                Что-то пошло не так. Проверьте подключение к интернету.
              </p>
            </section>
          )}
        </div>

        {recommendations && recommendations.length > 0 && (
          <>
            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5 sm:max-w-sm">
                  <Search className="h-4 w-4 text-ink-soft" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder="Поиск университета..."
                    className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70"
                  />
                </div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="h-11 rounded-full border bg-white px-4 text-[13px] text-ink outline-none"
                  aria-label="Фильтр по стране"
                >
                  {availableCountries.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 rounded-full border bg-white px-4 text-[13px] text-ink outline-none"
                  aria-label="Фильтр по категории"
                >
                  <option value="">Все категории</option>
                  <option value="target">Целевой</option>
                  <option value="ambitious">Амбициозный</option>
                  <option value="safer">Более безопасный</option>
                </select>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-11 rounded-full border bg-white px-4 text-[13px] text-ink outline-none"
                  aria-label="Сортировка"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="score_desc">По оценке (высокая)</option>
                  <option value="score_asc">По оценке (низкая)</option>
                </select>
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
                  {filteredAndSorted.length} рекомендаций
                </p>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red"><Sparkles className="h-4 w-4" /></span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSorted.map((rec) => (
                  <UniversityMatchCard
                    key={rec.university_id}
                    rec={rec}
                    isSelected={isSelected(rec.university_id)}
                    onToggle={() => toggle(rec.university_id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><Scale className="h-4 w-4" /></span>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">COMPARE</p>
              <h2 className="mt-1 font-display text-[16px] font-semibold">Сравнивай варианты</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">Добавь минимум два университета, чтобы увидеть различия по требованиям, стоимости и соответствию профилю.</p>
            </div>
          </div>
          <div className="mt-4">
            <ButtonLink href="/app/compare" variant="secondary" className="text-[13px]">
              Открыть сравнение <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow"><DollarSign className="h-4 w-4" /></span>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ESTIMATED COST</p>
              <h2 className="mt-1 font-display text-[16px] font-semibold">Стоимость и стипендии</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">После подключения данных ULYS покажет оценочную стоимость обучения, доступные стипендии и финансовые требования для каждого варианта.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
