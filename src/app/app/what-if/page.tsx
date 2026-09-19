"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { getAccount } from "@/lib/account";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  ArrowRight,
  FileText,
  Globe,
  GraduationCap,
  Info,
  Map,
  Route,
  Sparkles,
  Target,
  WalletCards,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import type { WhatIfResponse, WhatIfField, UniversityMatchDiff, RoadmapTaskDiff } from "@/types";

const scenarioOptions = [
  { id: "ielts", label: "IELTS", icon: Target },
  { id: "sat", label: "SAT", icon: FileText },
  { id: "budget", label: "Бюджет", icon: WalletCards },
  { id: "country", label: "Страна", icon: Globe },
  { id: "field", label: "Направление", icon: GraduationCap },
];

const scenarioLabelMap: Record<string, string> = {
  ielts: "IELTS",
  sat: "SAT",
  budget: "Бюджет",
  preferred_country: "Страна",
  intended_major: "Направление",
};

const causalSteps = [
  { label: "ИЗМЕНЕНИЕ ПРОФИЛЯ", desc: "Выбранный параметр и новое значение", icon: Route },
  { label: "ULYS MATCH", desc: "Пересчёт shortlist и совпадений", icon: Target },
  { label: "ROADMAP", desc: "Маршрут адаптируется к новым целям", icon: Map },
  { label: "NEXT BEST ACTION", desc: "Приоритетное действие обновится", icon: Sparkles },
];

type ViewMode = "idle" | "loading" | "success" | "error" | "no-change";

export default function WhatIfPage() {
  const { profile } = useProfile();
  const account = getAccount();

  const academic = profile.academicInfo || account.academicInfo || {};

  const [activeScenario, setActiveScenario] = useState<WhatIfField>("ielts");
  const [scenarioValues, setScenarioValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const ieltsVal = Number(academic.ielts ?? academic.englishScore ?? "");
    if (ieltsVal) initial.ielts = String(ieltsVal);
    const satVal = Number(academic.sat ?? academic.satScore ?? "");
    if (satVal) initial.sat = String(satVal);
    if (academic.budgetMax != null) initial.budget = String(academic.budgetMax);
    if (academic.preferredCountries && academic.preferredCountries.length > 0) {
      initial.country = academic.preferredCountries[0];
    } else if (academic.country) {
      initial.country = academic.country;
    }
    if (academic.intendedMajor || academic.primaryField) {
      initial.field = academic.intendedMajor || academic.primaryField || "";
    }
    return initial;
  });

  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const currentValue = useMemo(() => {
    switch (activeScenario) {
      case "ielts":
        return (academic.englishStatus === "completed" || academic.ielts) && academic.ielts
          ? String(academic.ielts)
          : "Не указано";
      case "sat":
        return academic.satStatus === "completed" && academic.sat
          ? String(academic.sat)
          : "Не указано";
      case "budget":
        return academic.budgetMax != null
          ? `${academic.budgetMax} ${academic.budgetCurrency || "USD"}`
          : "Не указано";
      case "preferred_country":
        return academic.preferredCountries && academic.preferredCountries.length > 0
          ? academic.preferredCountries.join(", ")
          : academic.country || "Не указано";
      case "intended_major":
        return academic.intendedMajor || academic.primaryField || "Не указано";
      default:
        return "Не указано";
    }
  }, [activeScenario, academic]);

  const scenarioValue = scenarioValues[activeScenario] || "";
  const activeOption = scenarioOptions.find((o) => o.id === activeScenario);

  function formatLabel(field: WhatIfField, value: string) {
    switch (field) {
      case "ielts":
        return value || "Не указано";
      case "sat":
        return value || "Не указано";
      case "budget":
        return value ? `${value} USD` : "Не указано";
      case "preferred_country":
      case "intended_major":
        return value || "Не указано";
      default:
        return value || "Не указано";
    }
  }

  function getScenarioValue(field: WhatIfField) {
    const v = scenarioValues[field];
    switch (field) {
      case "ielts":
        return v ? parseFloat(v) : undefined;
      case "sat":
        return v ? parseInt(v, 10) : undefined;
      case "budget":
        return v ? parseInt(v, 10) : undefined;
      case "preferred_country":
      case "intended_major":
        return v || undefined;
      default:
        return undefined;
    }
  }

  function isNoChangeResponse(resp: WhatIfResponse): boolean {
    const recs = resp.recommendations;
    const road = resp.roadmap;
    const next = resp.next_action;

    const hasMatchChanges =
      recs.added.length > 0 ||
      recs.removed.length > 0 ||
      recs.changed_scores.length > 0;

    const hasRoadmapChanges =
      road.added_tasks.length > 0 ||
      road.removed_tasks.length > 0;

    return !hasMatchChanges && !hasRoadmapChanges && !next.changed;
  }

  async function handleCalculateImpact() {
    const v = getScenarioValue(activeScenario);
    if (v === undefined || v === "" || v === null) {
      setError("Пожалуйста, заполните значение для сценария.");
      setViewMode("error");
      return;
    }

    setViewMode("loading");
    setError(null);
    setResult(null);

    try {
      const response = await api.post<WhatIfResponse>("/api/what-if", {
        field: activeScenario,
        value: v,
      });
      setResult(response);

      if (isNoChangeResponse(response)) {
        setViewMode("no-change");
      } else {
        setViewMode("success");
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Не удалось рассчитать сценарий. Попробуйте снова.";
      setError(msg);
      setViewMode("error");
    }
  }

  function handleReset() {
    setViewMode("idle");
    setResult(null);
    setError(null);
  }

  const hasScenarioInput =
    scenarioValues[activeScenario] !== undefined &&
    scenarioValues[activeScenario] !== "";

  /* ==============================
     RENDER HELPERS
  ============================== */

  function renderMatchScoreChanges(changed: UniversityMatchDiff[]) {
    if (changed.length === 0) return null;
    return (
      <div className="mt-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
          ИЗМЕНИЛИСЬ MATCH-ОЦЕНКИ
        </p>
        <div className="mt-3 space-y-3">
          {changed.map((m) => (
            <div key={m.university_id} className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm">
              <p className="font-display text-[14px] font-semibold">{m.name}</p>
              <p className="mt-1 text-[12px] text-ink-soft">{m.country}</p>
              <div className="mt-2 flex items-center gap-3 font-mono text-[15px]">
                <span className="text-ink-soft">{m.before_score ?? "—"}</span>
                <ArrowRight className="h-4 w-4 text-red" />
                <span className="font-semibold text-ink">{m.after_score ?? "—"}</span>
                <span className={cn(
                  "text-[13px] font-medium",
                  m.score_change > 0 ? "text-green-600" : m.score_change < 0 ? "text-red-500" : "text-ink-soft"
                )}>
                  {m.score_change > 0 ? `+${m.score_change}` : m.score_change < 0 ? `${m.score_change}` : "0"}
                </span>
              </div>
              {m.category_changed && m.before_category && m.after_category && (
                <p className="mt-1 text-[11.5px] text-ink-soft">
                  Категория: {m.before_category} → {m.after_category}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAddedUniversities(added: UniversityMatchDiff[]) {
    if (added.length === 0) return null;
    return (
      <div className="mt-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-green-600">
          ДОБАВЛЕНЫ В RECOMMENDATIONS
        </p>
        <div className="mt-3 space-y-2.5">
          {added.map((m) => (
            <div key={m.university_id} className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <p className="font-display text-[13px] font-semibold">{m.name}</p>
                <p className="text-[11.5px] text-ink-soft">{m.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderRemovedUniversities(removed: UniversityMatchDiff[]) {
    if (removed.length === 0) return null;
    return (
      <div className="mt-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red-500">
          УДАЛЕНЫ ИЗ RECOMMENDATIONS
        </p>
        <div className="mt-3 space-y-2.5">
          {removed.map((m) => (
            <div key={m.university_id} className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-3">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <p className="font-display text-[13px] font-semibold">{m.name}</p>
                <p className="text-[11.5px] text-ink-soft">{m.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderRoadmapTask(task: RoadmapTaskDiff, isAdded: boolean) {
    return (
      <div key={task.id} className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-line bg-white p-3">
        <span className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          isAdded ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
        )}>
          {isAdded ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        </span>
        <div className="flex-1">
          <p className="font-display text-[13px] font-semibold">{task.title}</p>
          <p className="text-[11px] text-ink-soft">
            Категория: {task.category} · Приоритет: {task.priority}
          </p>
        </div>
      </div>
    );
  }

  function renderNextActionDiff(resp: WhatIfResponse) {
    const { before, after, changed } = resp.next_action;
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
            СЛЕДУЮЩИЙ ШАГ
          </p>
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            changed ? "bg-red/10 text-red" : "bg-ink/10 text-ink-soft"
          )}>
            {changed ? "Следующий шаг изменился" : "Следующий шаг не изменился"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {before && (
            <div className="rounded-[var(--radius-card)] border border-line bg-paper-dim p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">ДО</p>
              <p className="mt-2 font-display text-[15px] font-semibold">{before.title}</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">
                Категория: {before.category} · Приоритет: {before.priority}
              </p>
              {before.status === "completed" && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <CheckCircle className="h-3 w-3" /> Выполнено
                </span>
              )}
            </div>
          )}
          {after && (
            <div className="rounded-[var(--radius-card)] border border-line bg-paper-dim p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">ПОСЛЕ</p>
              <p className="mt-2 font-display text-[15px] font-semibold">{after.title}</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">
                Категория: {after.category} · Приоритет: {after.priority}
              </p>
              {after.status === "completed" && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <CheckCircle className="h-3 w-3" /> Выполнено
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==============================
     MAIN RENDER
  ============================== */

  return (
    <>
      <TopBar title="ULYS WHAT-IF" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">✦ ULYS WHAT-IF</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">Что изменится, если…</h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              Проверь сценарий до того, как менять настоящий профиль.
            </p>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-soft">
              ULYS What-If показывает, как изменение одного параметра может повлиять на рекомендации, roadmap и следующий шаг.
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
            <Sparkles className="h-5 w-5" />
          </span>
        </header>

        <section className="mt-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">SCENARIO BUILDER</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenarioOptions.map(({ id, label, icon: Icon }) => {
              const selected = activeScenario === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (viewMode !== "idle") handleReset();
                    setActiveScenario(id as WhatIfField);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-all duration-200",
                    selected
                      ? "border-red/30 bg-red/10 text-red"
                      : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
                  )}
                >
                  <Icon className={cn("h-4 w-4", selected ? "text-red" : "text-ink-soft")} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">CURRENT → SCENARIO</p>
            <div className="mt-5 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <p className="text-[12px] font-medium text-ink-soft">Текущий профиль</p>
                <p className="mt-1 font-display text-[22px] font-semibold">{currentValue}</p>
                <p className="mt-1 text-[11.5px] text-ink-soft">{activeOption?.label}</p>
              </div>
              <div className="flex items-center pb-3">
                <ArrowRight className="h-6 w-6 text-red" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-[12px] font-medium text-ink-soft">Сценарий</p>
                {activeScenario === "preferred_country" || activeScenario === "intended_major" ? (
                  <select
                    value={scenarioValue}
                    onChange={(e) => setScenarioValues((v) => ({ ...v, [activeScenario]: e.target.value }))}
                    className="mt-1 w-full font-display text-[22px] font-semibold bg-transparent border-b border-dashed border-line focus:border-red outline-none pb-1 text-ink"
                  >
                    <option value="" className="text-ink-soft">Выберите значение</option>
                    {activeScenario === "preferred_country" && (
                      <>
                        <option value="Germany">Германия</option>
                        <option value="USA">США</option>
                        <option value="UK">Великобритания</option>
                        <option value="Canada">Канада</option>
                        <option value="Kazakhstan">Казахстан</option>
                      </>
                    )}
                    {activeScenario === "intended_major" && (
                      <>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Business">Business</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Economics">Economics</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type={activeScenario === "budget" ? "number" : "text"}
                    value={scenarioValue}
                    onChange={(e) => setScenarioValues((v) => ({ ...v, [activeScenario]: e.target.value }))}
                    placeholder="Новое значение"
                    className="mt-1 w-full font-display text-[22px] font-semibold bg-transparent border-b border-dashed border-line focus:border-red outline-none pb-1 text-ink placeholder:text-ink-soft/50"
                  />
                )}
                <p className="mt-1 text-[11.5px] text-ink-soft">Редактируемый сценарий</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper-dim p-5">
              <p className="font-display text-[14px] font-semibold">
                {activeOption?.label}: {formatLabel(activeScenario, scenarioValue) || formatLabel(activeScenario, currentValue)}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Измени значение справа, чтобы увидеть потенциальное влияние на рекомендации и маршрут.
              </p>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-dashed border-line bg-paper-dim p-5 sm:p-6 lg:col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red">IMPACT PREVIEW</p>
            <h2 className="mt-2 font-display text-[16px] font-semibold">Влияние сценария</h2>
            {result && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {result.summary}
              </p>
            )}
            {!result && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                Здесь появится разница между текущим маршрутом и выбранным сценарием.
              </p>
            )}
            <div className="mt-4 space-y-3">
              {[
                { icon: Target, text: "какие рекомендации изменились" },
                { icon: Map, text: "как изменился roadmap" },
                { icon: Sparkles, text: "изменился ли главный следующий шаг" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-[12px] text-ink-soft">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red/10 text-red"><Icon className="h-3 w-3" /></span>
                  {text}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><Route className="h-4 w-4" /></span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">CAUSAL CHAIN</p>
              <h2 className="mt-1 font-display text-[16px] font-semibold">Как решение распространяется по всему пути</h2>
            </div>
          </div>
          <div className="mt-6 hidden lg:flex items-center gap-2">
            {causalSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 flex-1">
                <div className="flex-1 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red"><step.icon className="h-4 w-4" /></span>
                  <p className="mt-3 font-display text-[12px] font-semibold">{step.label}</p>
                  <p className="mt-1 text-[11px] text-ink-soft">{step.desc}</p>
                </div>
                {i < causalSteps.length - 1 && (
                  <ArrowRight className="h-5 w-5 shrink-0 text-red" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 lg:hidden space-y-3">
            {causalSteps.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red"><step.icon className="h-4 w-4" /></span>
                  {i < causalSteps.length - 1 && <div className="mt-1 h-6 w-px bg-line" />}
                </div>
                <div className="flex-1 rounded-[var(--radius-card)] border border-line bg-white p-4">
                  <p className="font-display text-[13px] font-semibold">{step.label}</p>
                  <p className="mt-1 text-[11.5px] text-ink-soft">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {viewMode === "success" && result && (
          <>
            <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="flex flex-wrap gap-2">
                <Route className="h-5 w-5 text-red" />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ИЗМЕНЕНИЕ ПРОФИЛЯ</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[12px] font-medium text-ink-soft">{scenarioLabelMap[activeScenario] || activeScenario}</p>
                  <p className="mt-1 font-display text-[20px] font-semibold text-ink">
                    {formatLabel(activeScenario, String(result.scenario.before ?? ""))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">BEFORE</p>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="h-6 w-6 text-red" />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[12px] font-medium text-ink-soft">{scenarioLabelMap[activeScenario] || activeScenario}</p>
                  <p className="mt-1 font-display text-[20px] font-semibold text-red">
                    {formatLabel(activeScenario, String(result.scenario.after ?? ""))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">AFTER</p>
                </div>
              </div>
              <p className="mt-4 text-[13px] text-ink-soft">
                {result.summary}
              </p>
            </section>

            <section className="mt-6">
              <div className="flex flex-wrap gap-2">
                <Target className="h-5 w-5 text-red" />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ULYS MATCH</p>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">
                Совместимость профиля с рекомендуемыми программами (не вероятность поступления)
              </p>

              {renderAddedUniversities(result.recommendations.added)}
              {renderRemovedUniversities(result.recommendations.removed)}
              {renderMatchScoreChanges(result.recommendations.changed_scores)}

              {result.recommendations.added.length === 0 &&
               result.recommendations.removed.length === 0 &&
               result.recommendations.changed_scores.length === 0 && (
                <p className="mt-3 text-[13px] text-ink-soft">
                  Список рекомендуемых университетов не изменился.
                </p>
              )}
            </section>

            <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="flex flex-wrap gap-2">
                <Map className="h-5 w-5 text-red" />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ROADMAP</p>
              </div>

              {result.roadmap.removed_tasks.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red-600">
                    ЗАДАЧИ УДАЛЕНЫ
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {result.roadmap.removed_tasks.map((t) => renderRoadmapTask(t, false))}
                  </div>
                </div>
              )}

              {result.roadmap.added_tasks.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-green-600">
                    ЗАДАЧИ ДОБАВЛЕНЫ
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {result.roadmap.added_tasks.map((t) => renderRoadmapTask(t, true))}
                  </div>
                </div>
              )}

              {result.roadmap.removed_tasks.length === 0 &&
               result.roadmap.added_tasks.length === 0 && (
                <p className="mt-3 text-[13px] text-ink-soft">
                  Roadmap не изменился. {result.roadmap.unchanged_count} задач(и) остались без изменений.
                </p>
              )}
            </section>

            <section className="mt-6">
              <div className="flex flex-wrap gap-2">
                <Sparkles className="h-5 w-5 text-red" />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">NEXT BEST ACTION</p>
              </div>
              {renderNextActionDiff(result)}
            </section>
          </>
        )}

        {viewMode === "no-change" && result && (
          <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-sm sm:p-8 text-center">
            <div className="flex justify-center">
              <Info className="h-10 w-10 text-ink-soft/40" />
            </div>
            <p className="mt-4 font-display text-[18px] font-semibold text-ink">
              Этот сценарий не изменил текущий маршрут.
            </p>
            <p className="mt-2 text-[13px] text-ink-soft max-w-md mx-auto">
              {result.summary}
            </p>
            <p className="mt-4 text-[11.5px] text-ink-soft">
              Попробуй изменить другой параметр, чтобы увидеть влияние.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-full border border-red/30 bg-red/10 px-5 py-2.5 text-[13px] font-medium text-red hover:bg-red/20 transition"
            >
              Изменить сценарий
            </button>
          </section>
        )}

        {viewMode === "error" && (
          <section className="mt-6 rounded-[var(--radius-card)] border border-red/30 bg-red-50 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-display text-[14px] font-semibold text-red">Ошибка расчёта</p>
                <p className="mt-1 text-[13px] text-ink-soft">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleCalculateImpact()}
                className="rounded-full bg-red px-5 py-2.5 text-[13px] font-medium text-white hover:bg-red/80 transition"
              >
                Попробовать снова
              </button>
              <button
                onClick={handleReset}
                className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-medium text-ink hover:bg-paper-dim transition"
              >
                Очистить
              </button>
            </div>
          </section>
        )}

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ACTION</p>
              <h2 className="mt-2 font-display text-[16px] font-semibold">Рассчитать влияние</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Это симуляция. Твой профиль не изменится.
              </p>
            </div>
            <button
              onClick={handleCalculateImpact}
              disabled={viewMode === "loading" || !hasScenarioInput}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-red px-6 py-3 text-[13px] font-medium text-white transition",
                viewMode === "loading"
                  ? "cursor-not-allowed opacity-70"
                  : hasScenarioInput
                    ? "hover:bg-red/80"
                    : "opacity-60 cursor-not-allowed"
              )}
            >
              {viewMode === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Расчёт...
                </>
              ) : (
                <>
                  Рассчитать влияние
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </section>

        <p className="mt-4 flex items-center gap-2 text-[11.5px] text-ink-soft">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Изменения в сценарии не меняют твой настоящий профиль. Сценарий временный и используется только для сравнения.
        </p>
      </main>
    </>
  );
}
