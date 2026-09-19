"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { ButtonLink } from "@/components/ui/Button";
import { useUniversityRecommendations } from "@/hooks/useUniversityRecommendations";
import { useSelectedUniversities } from "@/hooks/useSelectedUniversities";
import { cn } from "@/lib/utils";
import { UniversityRecommendation } from "@/types";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Library,
  MapPin,
  Route,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  Trophy,
  University,
  X,
} from "lucide-react";

const categoryConfig: Record<string, { label: string; color: string }> = {
  target: { label: "Целевой", color: "bg-yellow/10 text-yellow" },
  ambitious: { label: "Амбициозный", color: "bg-red/10 text-red" },
  safer: { label: "Более безопасный", color: "bg-green/10 text-green" },
};

function getUniversityName(rec: UniversityRecommendation): string {
  return rec.name || rec.university_id || "Вариант";
}

function CompareRow({ label, icon: Icon, children }: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="flex items-center gap-2 text-[11.5px] font-medium text-ink-soft">
        <Icon className="h-4 w-4" />
        {label}
      </dt>
      <dd className="mt-1 sm:col-span-2 sm:mt-0 text-[12.5px] text-ink">
        {children}
      </dd>
    </div>
  );
}

function UniversityColumn({ rec }: { rec: UniversityRecommendation }) {
  const config = categoryConfig[rec.category] || { label: rec.category, color: "bg-ink/10 text-ink" };

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink">{rec.name}</h3>
          <p className="mt-1 text-[12px] text-ink-soft flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {rec.city}, {rec.country}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", config.color)}>
          <Star className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">ULYS MATCH</p>
        <div className="flex items-center gap-3">
          <span className="font-display text-[22px] font-bold text-red">{rec.match_score}%</span>
          <div className="h-2 flex-1 rounded-full bg-paper-dim">
            <div className="h-full rounded-full bg-red" style={{ width: `${rec.match_score}%` }} />
          </div>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-line">
        <CompareRow label="Программа" icon={University}>
          {rec.program || "Не указана"}
        </CompareRow>
        <CompareRow label="Причины совпадения" icon={ShieldCheck}>
          {rec.reasons.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5">
              {rec.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          ) : (
            <span className="text-ink-soft">Нет данных</span>
          )}
        </CompareRow>
        <CompareRow label="Пробелы" icon={Target}>
          {rec.gaps.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5">
              {rec.gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          ) : (
            <span className="text-green">Нет пробелов</span>
          )}
        </CompareRow>
        <CompareRow label="След. действия" icon={Route}>
          {rec.next_actions.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5">
              {rec.next_actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          ) : (
            <span className="text-ink-soft">Нет данных</span>
          )}
        </CompareRow>
        <CompareRow label="Сильные стороны" icon={Trophy}>
          {rec.strengths.length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5">
              {rec.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : (
            <span className="text-ink-soft">Нет данных</span>
          )}
        </CompareRow>
      </dl>
    </div>
  );
}

function EmptyCompareState() {
  return (
    <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto">
        <Trophy className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-display text-[20px] font-semibold">Сравнение пока пусто</h2>
      <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
        Добавь минимум два университета из рекомендаций ULYS, чтобы увидеть ключевые различия в одном месте.
      </p>
      <div className="mt-6">
        <ButtonLink href="/app/universities" size="md">
          Выбрать университеты <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </section>
  );
}

function KeyDifferences({ recs }: { recs: UniversityRecommendation[] }) {
  const differences = useMemo(() => {
    if (recs.length < 2) return [];

    const diffs = [
      {
        label: "ULYS Match",
        icon: Trophy,
        values: recs.map((r) => `${r.match_score}%`),
      },
      {
        label: "Категория",
        icon: Target,
        values: recs.map((r) => categoryConfig[r.category]?.label || r.category),
      },
      {
        label: "Программа",
        icon: University,
        values: recs.map((r) => r.program || "—"),
      },
      {
        label: "Страна",
        icon: MapPin,
        values: recs.map((r) => r.country || "—"),
      },
      {
        label: "Пробелы",
        icon: ShieldCheck,
        values: recs.map((r) => r.gaps.length > 0 ? `${r.gaps.length} пробелов` : "Нет"),
      },
    ];

    return diffs.filter((d) => {
      const uniqueValues = new Set(d.values);
      return uniqueValues.size > 1;
    });
  }, [recs]);

  if (differences.length === 0) return null;

  return (
    <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red">
          <Trophy className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">KEY DIFFERENCES</p>
          <h2 className="mt-1 font-display text-[16px] font-semibold">Ключевые различия</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {differences.map(({ label, icon: Icon, values }) => (
          <div key={label} className="rounded-[var(--radius-card)] border border-line bg-paper-dim/30 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red">
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 font-display text-[13px] font-semibold">{label}</p>
            <div className="mt-2 space-y-1">
              {values.map((v, i) => (
                <p key={i} className="text-[11.5px] text-ink-soft">{v}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] text-ink-soft">
        ULYS не определяет лучший вариант — ты решаешь, что важнее для тебя.
      </p>
    </section>
  );
}

export default function ComparePage() {
  const { recommendations, loading: recsLoading } = useUniversityRecommendations();
  const { selectedIds, isSelected, toggle, clear, selectedFromRecommendations } = useSelectedUniversities();
  const [recsLoaded, setRecsLoaded] = useState(false);

  const allRecommendations = recommendations || [];

  const selectedRecs = useMemo(() => {
    return selectedFromRecommendations(allRecommendations);
  }, [selectedIds, allRecommendations, selectedFromRecommendations]);

  if (recsLoading && !recsLoaded) {
    setRecsLoaded(true);
  }

  const hasEnough = selectedRecs.length >= 2;

  return (
    <>
      <TopBar title="Сравнение" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">СРАВНЕНИЕ ВАРИАНТОВ</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
              Сравнение университетов
            </h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              Сравнивай варианты по требованиям, стоимости и соответствию твоему профилю.
            </p>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-medium text-ink-soft">Выбрано для сравнения</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-[12px] font-medium text-ink">
              {selectedRecs.length} / 2 минимум
            </span>
          </div>
          {selectedRecs.length > 0 && (
            <button
              onClick={clear}
              className="text-[11.5px] font-medium text-ink-soft hover:text-red underline"
            >
              Очистить выбор
            </button>
          )}
          <p className="text-[11.5px] text-ink-soft">Для сравнения нужно минимум два варианта.</p>
        </div>

        {!hasEnough && selectedRecs.length > 0 && selectedRecs.length < 2 && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-yellow bg-yellow-dim px-4 py-2.5 text-[12.5px] text-ink">
            Выбери ещё один университет, чтобы увидеть сравнение.
          </div>
        )}

        {hasEnough && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {selectedRecs.map((rec) => (
              <div
                key={rec.university_id}
                className="relative min-w-[300px] flex-1"
              >
                <button
                  onClick={() => toggle(rec.university_id)}
                  className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-soft hover:text-red"
                  aria-label="Убрать"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <UniversityColumn rec={rec} />
              </div>
            ))}
          </div>
        )}

        {!hasEnough && selectedRecs.length === 0 && <EmptyCompareState />}

        {hasEnough && <KeyDifferences recs={selectedRecs} />}

        {allRecommendations.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
              {hasEnough ? "Добавить ещё" : "ВЫБЕРИ ВАРИАНТЫ"}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allRecommendations
                .filter((rec) => !selectedIds.includes(rec.university_id) || hasEnough)
                .filter((rec) => !selectedIds.includes(rec.university_id))
                .map((rec) => (
                  <div
                    key={rec.university_id}
                    className={cn(
                      "relative rounded-[var(--radius-card)] border p-4 shadow-sm transition-all",
                      isSelected(rec.university_id)
                        ? "border-red bg-red/5"
                        : "border-line bg-white hover:border-ink/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-[14px] font-semibold text-ink">{rec.name}</h3>
                        <p className="mt-1 text-[11.5px] text-ink-soft">
                          {rec.city}, {rec.country} • {rec.match_score}%
                        </p>
                      </div>
                      <button
                        onClick={() => toggle(rec.university_id)}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                          isSelected(rec.university_id)
                            ? "border-red bg-red text-white"
                            : "border-line bg-white text-ink-soft hover:border-ink"
                        )}
                        aria-label={isSelected(rec.university_id) ? "Убрать" : "Добавить"}
                        disabled={selectedIds.length >= 3 && !isSelected(rec.university_id)}
                      >
                        {isSelected(rec.university_id) ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <PlusIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">ULYS MATCH</p>
              <h2 className="mt-1 font-display text-[15px] font-semibold">Что означает ULYS Match?</h2>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            ULYS Match показывает соответствие профиля программе по доступным данным и предпочтениям.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Это не вероятность зачисления.
          </p>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">SOURCE TRANSPARENCY</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] text-ink-soft">
                <FileText className="h-3 w-3" /> Источник
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] text-ink-soft">
                <CheckCircle2 className="h-3 w-3" /> Демонстрационные данные
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] text-ink-soft">
                <ShieldCheck className="h-3 w-3" /> Проверено
              </span>
            </div>
            <p className="mt-3 text-[11.5px] text-ink-soft">
              Статусы источников появятся при подключении реальных данных. Ничего не помечено как проверенное до получения фактической информации.
            </p>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">NEXT STEP</p>
                <h2 className="mt-1 font-display text-[15px] font-semibold">После сравнения</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                  Выбранные варианты смогут стать основой персонального roadmap.
                </p>
                <ButtonLink href="/app/roadmap" variant="secondary" className="mt-4 text-[12.5px]">
                  Открыть Roadmap <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
