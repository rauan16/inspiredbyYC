"use client";

import { useMemo } from "react";
import { TopBar } from "@/components/app/TopBar";
import { ProgressRing } from "@/components/common/ProgressRing";
import { ButtonLink } from "@/components/ui/Button";
import { getAccount, StoredAccount } from "@/lib/account";
import { getMissingProfileFields, getProfileCompleteness } from "@/lib/profile";
import { useProfile } from "@/hooks/useProfile";
import { useUniversityRecommendations } from "@/hooks/useUniversityRecommendations";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";
import { UniversityRecommendation } from "@/types";

function ValueRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-[12px] font-medium text-ink-soft">{label}</dt>
      <dd className="text-[13.5px] font-medium text-ink">{children}</dd>
    </div>
  );
}

function formatExam(test: string | undefined, status: string | undefined, score: number | null | undefined) {
  if (!status || status === "not_taken") return "Не сдавал(а)";
  if (status === "planning") return "Планирую";
  if (status === "completed") {
    const scoreText = typeof score === "number" && ["IELTS", "TOEFL", "Duolingo English Test"].includes(test || "") ? score.toFixed(1) : String(score ?? "");
    return `${test || "Тест"}${score == null ? " · результат не указан" : ` · ${scoreText}`}`;
  }
  return "Не указано";
}

function formatList(values: string[] | undefined) {
  return values?.length ? values.join(" · ") : "Не указано";
}

function formatBudget(value: number | null | undefined, currency: string | undefined, undecided: boolean | undefined) {
  if (decidedFalse(value, undecided)) return "Пока не определён";
  if (value == null) return "Не указано";
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ${currency || "USD"}`;
}

function decidedFalse(value: number | null | undefined, undecided: boolean | undefined) {
  return Boolean(undecided || value == null);
}

function formatScholarship(value: string | undefined) {
  const labels: Record<string, string> = {
    required: "Обязательна",
    preferred: "Предпочтительна",
    not_necessary: "Не нужна",
    not_sure: "Не уверена(эн)",
  };
  return value ? labels[value] || value : "Не указано";
}

function formatIntake(value: string | undefined) {
  const labels: Record<string, string> = {
    fall: "Fall / осень",
    spring: "Spring / весна",
    not_sure: "Не уверена(эн)",
  };
  return value ? labels[value] || value : "Не указано";
}

function formatLanguage(value: string | undefined) {
  const labels: Record<string, string> = {
    english: "Английский",
    russian: "Русский",
    kazakh: "Казахский",
    no_preference: "Без предпочтений",
  };
  return value ? labels[value] || value : "Не указано";
}

function isProfileEmpty(merged: Partial<StoredAccount>): boolean {
  const hasName = Boolean(merged.name?.trim());
  const hasGrade = Boolean(merged.grade?.trim());
  const hasLocation = Boolean(merged.location?.trim());
  const hasAcademic = merged.academicInfo && Object.keys(merged.academicInfo).length > 0;
  const hasInterests = merged.interests?.length;
  const hasGoals = merged.goals?.length;
  return !hasName && !hasGrade && !hasLocation && !hasAcademic && !hasInterests && !hasGoals;
}

function DiagnosisContent({ recommendations, completeness }: {
  recommendations: UniversityRecommendation[];
  completeness: number;
}) {
  const allGaps = useMemo(() => {
    const gapFreq: Record<string, number> = {};
    const allGaps: string[] = [];
    for (const rec of recommendations) {
      for (const gap of rec.gaps) {
        if (!gapFreq[gap]) {
          allGaps.push(gap);
        }
        gapFreq[gap] = (gapFreq[gap] || 0) + 1;
      }
    }
    return allGaps.sort((a, b) => (gapFreq[b] || 0) - (gapFreq[a] || 0));
  }, [recommendations]);

  const allStrengths = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const rec of recommendations) {
      for (const s of rec.strengths) {
        if (!seen.has(s)) {
          seen.add(s);
          result.push(s);
        }
      }
    }
    return result.slice(0, 5);
  }, [recommendations]);

  const allNextActions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const rec of recommendations) {
      for (const a of rec.next_actions) {
        if (!seen.has(a)) {
          seen.add(a);
          result.push(a);
        }
      }
    }
    return result.slice(0, 5);
  }, [recommendations]);

  const topMatch = useMemo(() => {
    return recommendations.length > 0 ? recommendations[0] : null;
  }, [recommendations]);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Сильные стороны</p>
          {allStrengths.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[12.5px]">
              {allStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
                  <span className="text-ink">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-ink-soft">Недостаточно данных для оценки</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Пробелы</p>
          {allGaps.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[12.5px]">
              {allGaps.slice(0, 5).map((g, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Info className="h-4 w-4 shrink-0 text-yellow" />
                  <span className="text-ink">{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-green">Пробелов не выявлено</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">След. действия</p>
          {allNextActions.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[12.5px]">
              {allNextActions.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Target className="h-4 w-4 shrink-0 text-red" />
                  <span className="text-ink">{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-ink-soft">Нет рекомендаций</p>
          )}
        </div>
      </div>

      {topMatch && (
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Топ рекомендация</p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-display text-[14px] font-semibold text-ink">{topMatch.name}</p>
              <p className="text-[11.5px] text-ink-soft">{topMatch.city}, {topMatch.country} • {topMatch.program}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-paper-dim px-2.5 py-1 font-display text-[14px] font-bold text-red">
              {topMatch.match_score}%
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-line bg-white p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-ink-soft" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Полнота профиля</span>
        </div>
        <ProgressRing value={completeness} label="полнота" size={84} />
      </div>

      <div className="flex gap-3">
        <ButtonLink href="/app/universities" size="sm">
          Все рекомендации <ArrowRight className="h-3.5 w-3.5" />
        </ButtonLink>
        <ButtonLink href="/app/roadmap" variant="secondary" size="sm">
          Roadmap <ArrowRight className="h-3.5 w-3.5" />
        </ButtonLink>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, loading } = useProfile();
  const { recommendations, loading: recsLoading } = useUniversityRecommendations();
  const account = getAccount();

  const merged = useMemo<StoredAccount>(() => ({
    ...account,
    ...(profile.name ? { name: profile.name } : {}),
    ...(profile.grade ? { grade: profile.grade } : {}),
    ...(profile.location ? { location: profile.location } : {}),
    ...(profile.bio ? { bio: profile.bio } : {}),
    interests: profile.interests?.length ? profile.interests : account.interests,
    goals: profile.goals?.length ? profile.goals : account.goals,
    avatarInitials: profile.avatarInitials || account.avatarInitials,
    academicInfo: profile.academicInfo || account.academicInfo,
    onboardingCompleted: profile.onboardingCompleted ?? account.onboardingCompleted,
  }), [account, profile]);

  const empty = isProfileEmpty(merged);

  if (empty && !loading) {
    return (
      <>
        <TopBar title="Мой профиль" />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">ULYS / PROFILE</p>
              <h1 className="mt-2 font-display text-[25px] font-semibold">Мой профиль</h1>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">Данные, которые ULYS использует, чтобы понимать твои цели и строить персональный маршрут.</p>
            </div>
            <ButtonLink href="/onboarding?edit=1"><Pencil className="h-4 w-4" /> Редактировать профиль</ButtonLink>
          </header>
          <section className="mt-8">
            <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-14">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto"><GraduationCap className="h-7 w-7" /></span>
              <h2 className="mt-5 font-display text-[20px] font-semibold">Расскажи ULYS немного о себе</h2>
              <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">Заполни данные об учёбе, целях и предпочтениях — они станут основой рекомендаций и roadmap.</p>
              <div className="mt-6">
                <ButtonLink href="/onboarding?edit=1" size="md">Заполнить профиль <ArrowRight className="h-4 w-4" /></ButtonLink>
              </div>
            </div>
          </section>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: GraduationCap, label: "Учёба и экзамены", desc: "Уровень, GPA, IELTS, SAT" },
              { icon: Target, label: "Интересы и цели", desc: "Направление, приоритеты" },
              { icon: WalletCards, label: "Предпочтения", desc: "Страны, бюджет, язык" },
              { icon: Sparkles, label: "Диагностика", desc: "Анализ профиля ULYS" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><Icon className="h-4 w-4" /></span>
                <p className="mt-3 font-display text-[13px] font-semibold">{label}</p>
                <p className="mt-1 text-[11.5px] text-ink-soft">{desc}</p>
              </div>
            ))}
          </section>
        </main>
      </>
    );
  }

  const academic = merged.academicInfo || {};
  const completeness = getProfileCompleteness(merged);
  const missing = getMissingProfileFields(merged, 8);
  const missingActions = [
    !merged.grade && "Добавить этап обучения",
    !(academic.country || merged.location) && "Указать страну проживания",
    !academic.graduationYear && "Указать год окончания",
    !(academic.gpaValue != null || academic.gpaUnknown) && "Добавить средний балл",
    !academic.englishStatus && "Добавить IELTS / TOEFL",
    !academic.satStatus && "Добавить SAT",
    !academic.primaryField && "Выбрать направление",
    !academic.priorities?.length && "Указать приоритеты",
    !(academic.preferredCountries?.length || academic.countriesUndecided) && "Выбрать страны",
    !(academic.budgetMax != null || academic.budgetUndecided) && "Указать бюджет",
    !academic.scholarshipPreference && "Уточнить стипендию",
    !academic.studyLanguage && "Выбрать язык обучения",
    !academic.targetYear && "Указать год поступления",
    !academic.targetIntake && "Выбрать intake",
  ].filter(Boolean) as string[];
  const displayName = merged.name || "Профиль";
  const displayInitials = merged.avatarInitials || displayName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  const displayLocation = academic.country || merged.location || "Не указано";
  const displayGrade = academic.educationLevel || merged.grade || "Не указано";

  return (
    <>
      <TopBar title="Мой профиль" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">ULYS / PROFILE</p>
            <h1 className="mt-2 font-display text-[25px] font-semibold">Мой профиль</h1>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">Данные, которые ULYS используют, чтобы понимать твои цели и строить персональный маршрут.</p>
          </div>
          <ButtonLink href="/onboarding?edit=1"><Pencil className="h-4 w-4" /> Редактировать профиль</ButtonLink>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red font-display text-[17px] font-semibold text-white">{displayInitials}</span>
              <div>
                <h2 className="font-display text-[19px] font-semibold">{displayName}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-soft"><MapPin className="h-3.5 w-3.5" /> {displayLocation} · {displayGrade}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">PROFILE STATUS</p>
                <p className="mt-2 font-display text-[28px] font-bold">{completeness}%</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">Полнота данных профиля, не вероятность поступления.</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper-dim/40 p-4">
                <p className="text-[12.5px] font-medium">Чтобы сделать профиль точнее</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingActions.length ? missingActions.slice(0, 5).map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11.5px] text-ink-soft transition-colors hover:border-ink/30 border border-transparent">+ {item}</span>
                  )) : <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-green"><CheckCircle2 className="h-3.5 w-3.5" /> Основные поля заполнены</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">COMPLETENESS</p>
                <h2 className="mt-2 font-display text-[16px] font-semibold">Профиль</h2>
              </div>
              <ProgressRing value={completeness} label="полнота" size={120} />
            </div>
            <div className="mt-5 space-y-2.5">
              {missing.length ? missing.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[12px] text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-red shrink-0" /> {item}</div>
              )) : <p className="text-[12.5px] text-green">Основные данные заполнены</p>}
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><GraduationCap className="h-4 w-4" /></span>
              <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">ACADEMICS</p><h2 className="mt-1 font-display text-[16px] font-semibold">Учёба и экзамены</h2></div>
            </div>
            <dl className="mt-4 divide-y divide-line">
              <ValueRow label="Уровень образования">{displayGrade}</ValueRow>
              <ValueRow label="Год окончания">{academic.graduationYear || "Не указано"}</ValueRow>
              <ValueRow label="Средний балл">{academic.gpaUnknown ? "Не знаю" : academic.gpaValue == null ? "Не указано" : `${academic.gpaValue}${academic.gpaScale ? ` / ${academic.gpaScale}` : ""}`}</ValueRow>
              <ValueRow label="Английский тест">{formatExam(academic.englishTest, academic.englishStatus, academic.englishScore)}</ValueRow>
              <ValueRow label="SAT">{formatExam("SAT", academic.satStatus, academic.satScore)}</ValueRow>
              <ValueRow label="ACT">{formatExam("ACT", academic.actStatus, academic.actScore)}</ValueRow>
            </dl>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow"><Target className="h-4 w-4" /></span>
              <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">GOALS</p><h2 className="mt-1 font-display text-[16px] font-semibold">Интересы и цели</h2></div>
            </div>
            <dl className="mt-4 divide-y divide-line">
              <ValueRow label="Основное направление">{academic.primaryField || "Не указано"}</ValueRow>
              <ValueRow label="Дополнительные интересы">{formatList(academic.secondaryInterests)}</ValueRow>
              <ValueRow label="Приоритеты">{formatList(academic.priorities)}</ValueRow>
            </dl>
          </section>
        </div>

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red"><WalletCards className="h-4 w-4" /></span>
            <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">PREFERENCES</p><h2 className="mt-1 font-display text-[16px] font-semibold">Предпочтения</h2></div>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <ValueRow label="Страны">{academic.countriesUndecided ? "Пока не определился(ась)" : formatList(academic.preferredCountries)}</ValueRow>
            <ValueRow label="Бюджет">{formatBudget(academic.budgetMax, academic.budgetCurrency, academic.budgetUndecided)}</ValueRow>
            <ValueRow label="Стипендия">{formatScholarship(academic.scholarshipPreference)}</ValueRow>
            <ValueRow label="Язык обучения">{formatLanguage(academic.studyLanguage)}</ValueRow>
            <ValueRow label="Год поступления">{academic.targetYear || "Не указано"}</ValueRow>
            <ValueRow label="Intake">{formatIntake(academic.targetIntake)}</ValueRow>
            <div className="sm:col-span-2">
              <ValueRow label="Ограничения">{formatList(academic.constraints)}</ValueRow>
            </div>
          </dl>
        </section>

         <section className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line bg-paper-dim/40 p-5 sm:p-6">
           <div className="flex items-start gap-3">
             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red/10 text-red"><Sparkles className="h-5 w-5" /></span>
             <div className="flex-1">
               <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-red">✦ ULYS DIAGNOSIS</p>
               <h2 className="mt-2 font-display text-[16px] font-semibold">Диагностика ULYS</h2>
               <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                 ULYS анализирует твой профиль, портфолио и рекомендации, чтобы выделить сильные стороны, пробелы и следующие шаги.
               </p>

               {recsLoading ? (
                 <div className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-soft">
                   <Loader2 className="h-4 w-4 animate-spin text-red" />
                   <span>Анализ профиля…</span>
                 </div>
               ) : recommendations && recommendations.length > 0 ? (
                 <DiagnosisContent recommendations={recommendations} completeness={completeness} />
               ) : (
                 <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white border border-line px-4 py-3 text-[12px] text-ink-soft">
                   <Info className="h-3.5 w-3.5 shrink-0" />
                   <span>Заполните профиль и портфолио, чтобы получить диагностику</span>
                 </div>
               )}
             </div>
           </div>
         </section>
      </main>
    </>
  );
}
