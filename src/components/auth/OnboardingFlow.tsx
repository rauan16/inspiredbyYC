"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  Globe2,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";
import { getToken } from "@/lib/api";
import { getAccount, StoredAccount } from "@/lib/account";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "ulys-onboarding-draft";

type Draft = {
  educationLevel: string;
  graduationYear: string;
  country: string;
  countryOther: string;
  city: string;
  gpaKnown: boolean;
  gpaValue: string;
  gpaScale: string;
  gpaScaleOther: string;
  englishTest: string;
  englishStatus: string;
  englishScore: string;
  satStatus: string;
  satScore: string;
  actStatus: string;
  actScore: string;
  primaryField: string;
  secondaryInterests: string[];
  priorities: string[];
  preferredCountries: string[];
  countriesUndecided: boolean;
  budgetKnown: boolean;
  budgetMax: string;
  budgetCurrency: string;
  scholarshipPreference: string;
  studyLanguage: string;
  studyLanguageOther: string;
  targetYear: string;
  targetIntake: string;
  constraints: string[];
  notes: string;
  onboardingCompleted?: boolean;
};

const emptyDraft: Draft = {
  educationLevel: "",
  graduationYear: "",
  country: "",
  countryOther: "",
  city: "",
  gpaKnown: false,
  gpaValue: "",
  gpaScale: "5.0",
  gpaScaleOther: "",
  englishTest: "not_taken",
  englishStatus: "not_taken",
  englishScore: "",
  satStatus: "not_taken",
  satScore: "",
  actStatus: "not_taken",
  actScore: "",
  primaryField: "",
  secondaryInterests: [],
  priorities: [],
  preferredCountries: [],
  countriesUndecided: false,
  budgetKnown: false,
  budgetMax: "",
  budgetCurrency: "USD",
  scholarshipPreference: "not_sure",
  studyLanguage: "no_preference",
  studyLanguageOther: "",
  targetYear: "",
  targetIntake: "not_sure",
  constraints: [],
  notes: "",
};

const stepMeta = [
  { label: "О тебе", icon: UserRound },
  { label: "Учёба", icon: GraduationCap },
  { label: "Интересы", icon: Target },
  { label: "Предпочтения", icon: Globe2 },
  { label: "Планы", icon: Flag },
];

const educationOptions = [
  "8 класс",
  "9 класс",
  "10 класс",
  "11 класс",
  "12 класс",
  "Колледж",
  "Другое",
];

const countryOptions = [
  "Казахстан",
  "Россия",
  "Великобритания",
  "Нидерланды",
  "Канада",
  "Сингапур",
  "США",
  "Другая страна",
];

const preferredCountryOptions = [
  "Казахстан",
  "Россия",
  "Великобритания",
  "Нидерланды",
  "Канада",
  "Сингапур",
  "США",
  "Германия",
  "Франция",
  "Другая страна",
];

const fieldOptions = [
  "Computer Science",
  "Engineering",
  "Business & Management",
  "Economics",
  "Finance",
  "Natural Sciences",
  "Medicine",
  "Social Sciences",
  "Law",
  "Arts & Design",
  "Другое",
];

const priorityOptions = [
  "Сильная программа",
  "Карьерные возможности",
  "Исследования",
  "Стажировки",
  "Стипендии",
  "Предпринимательство",
  "Международная среда",
  "Стоимость",
  "Кампус",
  "Рейтинг",
];

const constraintOptions = [
  "Нужна стипендия",
  "Ограниченный бюджет",
  "Только определённые страны",
  "Нужна программа на английском",
  "Важно быть ближе к дому",
];

const englishTestOptions = [
  { value: "not_taken", label: "Не сдавал(а)" },
  { value: "IELTS", label: "IELTS" },
  { value: "TOEFL", label: "TOEFL" },
  { value: "Duolingo English Test", label: "Duolingo English Test" },
];

const testStatusOptions = [
  { value: "not_taken", label: "Не сдавал(а)" },
  { value: "planning", label: "Планирую сдать" },
  { value: "completed", label: "Есть результат" },
];

function readDraft(): { draft: Draft; hasDraft: boolean } {
  if (typeof window === "undefined") return { draft: emptyDraft, hasDraft: false };
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return { draft: emptyDraft, hasDraft: false };
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      draft: parsed.onboardingCompleted ? emptyDraft : { ...emptyDraft, ...parsed },
      hasDraft: true,
    };
  } catch {
    return { draft: emptyDraft, hasDraft: false };
  }
}

function draftFromProfile(profile: Partial<StoredAccount>): Draft {
  const academic = profile.academicInfo ?? {};
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const primaryField = academic.primaryField || interests[0] || "";
  return {
    ...emptyDraft,
    educationLevel: academic.educationLevel || profile.grade || "",
    graduationYear: academic.graduationYear || "",
    country: academic.country || profile.location || "",
    city: academic.city || "",
    countryOther: academic.countryOther || "",
    gpaKnown: academic.gpaValue != null,
    gpaValue: academic.gpaValue == null ? "" : String(academic.gpaValue),
    gpaScale: academic.gpaScale || "5.0",
    gpaScaleOther: academic.gpaScaleOther || "",
    englishTest: academic.englishTest || "not_taken",
    englishStatus: academic.englishStatus || "not_taken",
    englishScore: academic.englishScore == null ? "" : String(academic.englishScore),
    satStatus: academic.satStatus || "not_taken",
    satScore: academic.satScore == null ? "" : String(academic.satScore),
    actStatus: academic.actStatus || "not_taken",
    actScore: academic.actScore == null ? "" : String(academic.actScore),
    primaryField,
    secondaryInterests: academic.secondaryInterests || interests.slice(1),
    priorities: academic.priorities || profile.goals || [],
    preferredCountries: academic.preferredCountries || [],
    countriesUndecided: Boolean(academic.countriesUndecided),
    budgetKnown: academic.budgetMax != null,
    budgetMax: academic.budgetMax == null ? "" : String(academic.budgetMax),
    budgetCurrency: academic.budgetCurrency || "USD",
    scholarshipPreference: academic.scholarshipPreference || "not_sure",
    studyLanguage: academic.studyLanguage || "no_preference",
    studyLanguageOther: academic.studyLanguageOther || "",
    targetYear: academic.targetYear || "",
    targetIntake: academic.targetIntake || "not_sure",
    constraints: academic.constraints || [],
    notes: academic.notes || profile.bio || "",
  };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-white text-ink-soft hover:border-ink/50 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] text-red" role="alert">{children}</p>;
}

export function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const { profile, loading, updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [draftState, setDraftState] = useState(() => readDraft());
  const draft = draftState.hasDraft ? draftState.draft : draftFromProfile(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const authReady = Boolean(getToken());
  const account = getAccount();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (authReady && !loading && profile.onboardingCompleted && !editMode) {
      router.replace("/app");
    }
  }, [authReady, loading, profile.onboardingCompleted, editMode, router]);

  useEffect(() => {
    if (authReady && draftState.hasDraft) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draftState.draft));
    }
  }, [authReady, draftState]);

  const progress = useMemo(() => ((step + 1) / stepMeta.length) * 100, [step]);

  function update(patch: Partial<Draft>) {
    setDraftState((current) => ({
      ...current,
      hasDraft: true,
      draft: { ...draft, ...current.draft, ...patch },
    }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  }

  function toggleArray(key: "secondaryInterests" | "priorities" | "preferredCountries" | "constraints", value: string) {
    const nextValues = draft[key].includes(value)
      ? draft[key].filter((item) => item !== value)
      : [...draft[key], value];
    setDraftState((current) => ({
      ...current,
      hasDraft: true,
      draft: { ...draft, ...current.draft, [key]: nextValues },
    }));
  }

  function validate(currentStep: number): boolean {
    const next: Record<string, string> = {};
    if (currentStep === 0) {
      if (!draft.educationLevel) next.educationLevel = "Выбери текущий этап обучения";
      if (!draft.graduationYear) next.graduationYear = "Укажи ожидаемый год окончания";
      if (!draft.country) next.country = "Укажи страну проживания";
      if (draft.country === "Другая страна" && !draft.countryOther.trim()) next.countryOther = "Укажи страну";
    }
    if (currentStep === 1) {
      if (draft.gpaKnown && !draft.gpaValue.trim()) next.gpaValue = "Укажи средний балл или выбери «Не знаю»";
      if (draft.englishTest !== "not_taken" && draft.englishStatus === "completed" && !draft.englishScore.trim()) next.englishScore = "Добавь результат теста";
      if (draft.satStatus === "completed" && !draft.satScore.trim()) next.satScore = "Добавь результат SAT";
      if (draft.actStatus === "completed" && !draft.actScore.trim()) next.actScore = "Добавь результат ACT";
    }
    if (currentStep === 2 && !draft.primaryField.trim()) next.primaryField = "Выбери основное направление";
    if (currentStep === 3) {
      if (!draft.countriesUndecided && draft.preferredCountries.length === 0) next.preferredCountries = "Выбери страны или отметь, что пока не определился(ась)";
      if (draft.budgetKnown && !draft.budgetMax.trim()) next.budgetMax = "Укажи бюджет или отметь, что он пока не определён";
    }
    if (currentStep === 4 && !draft.targetYear.trim()) next.targetYear = "Укажи целевой год поступления";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validate(step)) return;
    setStep((current) => Math.min(stepMeta.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finishOnboarding() {
    if (!validate(stepMeta.length - 1)) return;
    setSaving(true);
    const academicInfo = {
      ...(profile.academicInfo ?? account.academicInfo ?? {}),
      educationLevel: draft.educationLevel,
      graduationYear: draft.graduationYear,
      country: draft.country === "Другая страна" ? draft.countryOther : draft.country,
      countryOther: draft.country === "Другая страна" ? draft.countryOther : undefined,
      city: draft.city,
      gpaValue: draft.gpaKnown ? Number(draft.gpaValue) : null,
      gpaScale: draft.gpaKnown ? (draft.gpaScale === "other" ? draft.gpaScaleOther : draft.gpaScale) : null,
      gpaUnknown: !draft.gpaKnown,
      englishTest: draft.englishTest,
      englishStatus: draft.englishStatus,
      englishScore: draft.englishTest !== "not_taken" && draft.englishStatus === "completed" ? Number(draft.englishScore) : null,
      satStatus: draft.satStatus,
      satScore: draft.satStatus === "completed" ? Number(draft.satScore) : null,
      actStatus: draft.actStatus,
      actScore: draft.actStatus === "completed" ? Number(draft.actScore) : null,
      primaryField: draft.primaryField,
      secondaryInterests: draft.secondaryInterests,
      priorities: draft.priorities,
      preferredCountries: draft.countriesUndecided ? [] : draft.preferredCountries,
      countriesUndecided: draft.countriesUndecided,
      budgetMax: draft.budgetKnown ? Number(draft.budgetMax) : null,
      budgetCurrency: draft.budgetCurrency,
      budgetUndecided: !draft.budgetKnown,
      scholarshipPreference: draft.scholarshipPreference,
      studyLanguage: draft.studyLanguage === "other" ? draft.studyLanguageOther : draft.studyLanguage,
      studyLanguageOther: draft.studyLanguage === "other" ? draft.studyLanguageOther : undefined,
      targetYear: draft.targetYear,
      targetIntake: draft.targetIntake,
      constraints: draft.constraints,
      notes: draft.notes,
      onboardingCompleted: true,
    };
    const name = profile.name || account.name;
    await updateProfile({
      name,
      grade: draft.educationLevel,
      location: draft.country === "Другая страна" ? draft.countryOther : draft.country,
      bio: draft.notes,
      interests: [draft.primaryField, ...draft.secondaryInterests].filter(Boolean),
      goals: draft.priorities,
      academicInfo,
      onboardingCompleted: true,
      avatarInitials: name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U",
    });
    window.localStorage.removeItem(DRAFT_KEY);
    router.push(editMode ? "/app/profile" : "/app");
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red text-white"><Sparkles className="h-5 w-5" /></span>
          <p className="font-display text-[15px] font-semibold">ULYS</p>
          <p className="text-[13px] text-ink-soft">Проверяем аккаунт...</p>
        </div>
      </div>
    );
  }

  const currentMeta = stepMeta[step];
  const CurrentIcon = currentMeta.icon;
  const canContinue = step < stepMeta.length - 1;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[minmax(0,1fr)_440px]">
        <main className="mx-auto flex w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
          <Link href="/app" className="mb-8 inline-flex items-center gap-2 font-display text-[17px] font-bold text-ink" aria-label="ULYS">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white">✦</span>
            ULYS
          </Link>

          <div className="mb-8" aria-label="Этапы настройки профиля">
            <div className="flex items-center justify-between gap-2">
              {stepMeta.map((meta, index) => {
                const Icon = meta.icon;
                return (
                  <div key={meta.label} className="flex flex-1 flex-col items-center gap-2">
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border text-[12px] transition-colors",
                        index <= step ? "border-red bg-red text-white" : "border-line bg-white text-ink-soft"
                      )}
                      aria-current={index === step ? "step" : undefined}
                    >
                      {index < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className={cn("text-[10.5px] font-medium text-ink-soft", index === step && "text-ink")}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-dim">
              <div className="h-full rounded-full bg-red transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-right text-[11.5px] text-ink-soft">Шаг {step + 1} из {stepMeta.length}</p>
          </div>

          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-7 md:p-8">
            <div className="mb-7 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red/10 text-red"><CurrentIcon className="h-5 w-5" /></span>
              <div>
                <h1 className="font-display text-[21px] font-semibold leading-tight">
                  {step === 0 && "Расскажи о себе"}
                  {step === 1 && "Расскажи об учёбе"}
                  {step === 2 && "Что тебе интересно?"}
                  {step === 3 && "Где и как ты хочешь учиться?"}
                  {step === 4 && "Последние детали"}
                </h1>
                <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                  {step === 0 && "Начнём с базовой информации, чтобы учитывать твой текущий этап обучения."}
                  {step === 1 && "Добавь только те данные, которые уже знаешь. «Не сдано» — тоже полезная информация."}
                  {step === 2 && "Выбери направление и то, что для тебя особенно важно в университете."}
                  {step === 3 && "Укажи предпочтения, которые будут учитываться в персональной подборке."}
                  {step === 4 && "Уточни сроки и ограничения, чтобы ULYS мог выстроить правильный маршрут."}
                </p>
              </div>
            </div>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField id="education-level" label="Текущий этап обучения *" value={draft.educationLevel} onChange={(e) => update({ educationLevel: e.target.value })} className={errors.educationLevel ? "ring-1 ring-red/40" : ""}>
                  <option value="">Выбери вариант</option>
                  {educationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
                <Field id="graduation-year" label="Ожидаемый год окончания *" type="number" min="2024" max="2045" value={draft.graduationYear} onChange={(e) => update({ graduationYear: e.target.value })} placeholder="2027" className={errors.graduationYear ? "ring-1 ring-red/40 rounded-xl" : ""} />
                <SelectField id="country" label="Страна проживания *" value={draft.country} onChange={(e) => update({ country: e.target.value })} className={errors.country ? "ring-1 ring-red/40" : ""}>
                  <option value="">Выбери страну</option>
                  {countryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
                <Field id="city" label="Город" value={draft.city} onChange={(e) => update({ city: e.target.value })} placeholder="Алматы" />
                {draft.country === "Другая страна" && <Field id="country-other" label="Укажи страну *" value={draft.countryOther} onChange={(e) => update({ countryOther: e.target.value })} placeholder="Например, Грузия" className={errors.countryOther ? "ring-1 ring-red/40 rounded-xl" : ""} />}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-line bg-paper-dim/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label htmlFor="gpa-known" className="font-display text-[14px] font-semibold">Средний балл</label>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">Если не знаешь точное значение, выбери «Не знаю».</p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft" htmlFor="gpa-known">
                      <input id="gpa-known" type="checkbox" checked={draft.gpaKnown} onChange={(e) => update({ gpaKnown: e.target.checked, gpaValue: e.target.checked ? draft.gpaValue : "" })} className="h-4 w-4 rounded border-line text-red focus:ring-red" />
                      Знаю GPA
                    </label>
                  </div>
                  {draft.gpaKnown && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field id="gpa-value" label="Средний балл *" type="number" step="0.01" value={draft.gpaValue} onChange={(e) => update({ gpaValue: e.target.value })} placeholder="4.5" className={errors.gpaValue ? "ring-1 ring-red/40 rounded-xl" : ""} />
                      <SelectField id="gpa-scale" label="Шкала" value={draft.gpaScale} onChange={(e) => update({ gpaScale: e.target.value })}>
                        <option value="4.0">4.0</option>
                        <option value="5.0">5.0</option>
                        <option value="100">100</option>
                        <option value="other">Другая</option>
                      </SelectField>
                      {draft.gpaScale === "other" && <Field id="gpa-scale-other" label="Своя шкала" value={draft.gpaScaleOther} onChange={(e) => update({ gpaScaleOther: e.target.value })} placeholder="Например, 10" />}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="english-test" label="Английский тест" value={draft.englishTest} onChange={(e) => update({ englishTest: e.target.value, englishStatus: e.target.value === "not_taken" ? "not_taken" : draft.englishStatus })}>
                    {englishTestOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectField>
                  {draft.englishTest !== "not_taken" && (
                    <SelectField id="english-status" label="Статус английского" value={draft.englishStatus} onChange={(e) => update({ englishStatus: e.target.value })}>
                      {testStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </SelectField>
                  )}
                  {draft.englishTest !== "not_taken" && draft.englishStatus === "completed" && (
                    <Field id="english-score" label="Результат *" type="number" step="0.1" value={draft.englishScore} onChange={(e) => update({ englishScore: e.target.value })} placeholder="7.0" className={errors.englishScore ? "ring-1 ring-red/40 rounded-xl" : ""} />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="sat-status" label="SAT" value={draft.satStatus} onChange={(e) => update({ satStatus: e.target.value })}>
                    {testStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectField>
                  {draft.satStatus === "completed" && <Field id="sat-score" label="Результат SAT *" type="number" value={draft.satScore} onChange={(e) => update({ satScore: e.target.value })} placeholder="1400" className={errors.satScore ? "ring-1 ring-red/40 rounded-xl" : ""} />}
                  <SelectField id="act-status" label="ACT" value={draft.actStatus} onChange={(e) => update({ actStatus: e.target.value })}>
                    {testStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectField>
                  {draft.actStatus === "completed" && <Field id="act-score" label="Результат ACT *" type="number" value={draft.actScore} onChange={(e) => update({ actScore: e.target.value })} placeholder="30" className={errors.actScore ? "ring-1 ring-red/40 rounded-xl" : ""} />}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <div>
                  <p className="text-[13px] font-medium text-ink">Основное направление *</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fieldOptions.map((option) => <Chip key={option} active={draft.primaryField === option} onClick={() => update({ primaryField: option })}>{option}</Chip>)}
                  </div>
                  <FieldError>{errors.primaryField}</FieldError>
                </div>
                {draft.primaryField && (
                <div>
                  <p className="text-[13px] font-medium text-ink">Дополнительные интересы</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fieldOptions.filter((option) => option !== draft.primaryField).map((option) => <Chip key={option} active={draft.secondaryInterests.includes(option)} onClick={() => toggleArray("secondaryInterests", option)}>{option}</Chip>)}
                  </div>
                </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-ink">Что для тебя особенно важно?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {priorityOptions.map((option) => <Chip key={option} active={draft.priorities.includes(option)} onClick={() => toggleArray("priorities", option)}>{option}</Chip>)}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <p className="text-[13px] font-medium text-ink">Предпочтительные страны</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {preferredCountryOptions.map((option) => <Chip key={option} active={draft.preferredCountries.includes(option)} onClick={() => { update({ countriesUndecided: false }); toggleArray("preferredCountries", option); }}>{option}</Chip>)}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft">
                    <input type="checkbox" checked={draft.countriesUndecided} onChange={(e) => update({ countriesUndecided: e.target.checked, preferredCountries: e.target.checked ? [] : draft.preferredCountries })} className="h-4 w-4 rounded border-line text-red focus:ring-red" />
                    Пока не определился(ась)
                  </label>
                  <FieldError>{errors.preferredCountries}</FieldError>
                </div>

                <div className="rounded-2xl border border-line bg-paper-dim/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[14px] font-semibold">Максимальный бюджет в год</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">Укажи комфортную сумму обучения или оставь поле неопределённым.</p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft" htmlFor="budget-known">
                      <input id="budget-known" type="checkbox" checked={draft.budgetKnown} onChange={(e) => update({ budgetKnown: e.target.checked, budgetMax: e.target.checked ? draft.budgetMax : "" })} className="h-4 w-4 rounded border-line text-red focus:ring-red" />
                      Бюджет известен
                    </label>
                  </div>
                  {draft.budgetKnown && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field id="budget-max" label="Сумма *" type="number" min="0" value={draft.budgetMax} onChange={(e) => update({ budgetMax: e.target.value })} placeholder="30000" className={errors.budgetMax ? "ring-1 ring-red/40 rounded-xl" : ""} />
                      <SelectField id="budget-currency" label="Валюта" value={draft.budgetCurrency} onChange={(e) => update({ budgetCurrency: e.target.value })}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="KZT">KZT</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="SGD">SGD</option>
                      </SelectField>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="scholarship" label="Насколько важна стипендия?" value={draft.scholarshipPreference} onChange={(e) => update({ scholarshipPreference: e.target.value })}>
                    <option value="required">Обязательна</option>
                    <option value="preferred">Предпочтительна</option>
                    <option value="not_necessary">Не нужна</option>
                    <option value="not_sure">Не уверена(эн)</option>
                  </SelectField>
                  <SelectField id="study-language" label="Язык обучения" value={draft.studyLanguage} onChange={(e) => update({ studyLanguage: e.target.value })}>
                    <option value="english">Английский</option>
                    <option value="russian">Русский</option>
                    <option value="kazakh">Казахский</option>
                    <option value="other">Другой</option>
                    <option value="no_preference">Без предпочтений</option>
                  </SelectField>
                  {draft.studyLanguage === "other" && <Field id="study-language-other" label="Укажи язык" value={draft.studyLanguageOther} onChange={(e) => update({ studyLanguageOther: e.target.value })} placeholder="Например, испанский" />}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="target-year" label="Целевой год поступления *" type="number" min="2024" max="2045" value={draft.targetYear} onChange={(e) => update({ targetYear: e.target.value })} placeholder="2027" className={errors.targetYear ? "ring-1 ring-red/40 rounded-xl" : ""} />
                  <SelectField id="target-intake" label="Предпочтительный интейк" value={draft.targetIntake} onChange={(e) => update({ targetIntake: e.target.value })}>
                    <option value="fall">Fall / осень</option>
                    <option value="spring">Spring / весна</option>
                    <option value="not_sure">Не уверена(эн)</option>
                  </SelectField>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink">Ограничения</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {constraintOptions.map((option) => <Chip key={option} active={draft.constraints.includes(option)} onClick={() => toggleArray("constraints", option)}>{option}</Chip>)}
                  </div>
                </div>
                <TextAreaField id="notes" label="Что ещё важно учитывать?" value={draft.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Напиши, если есть особые условия, которые стоит учесть." />
              </div>
            )}

            {errors.form && <p className="mt-5 text-[12.5px] text-red" role="alert">{errors.form}</p>}
          </section>

          <div className="mt-5 flex items-center justify-between gap-3 pb-24 lg:pb-0">
            <Button type="button" variant="secondary" onClick={previousStep} disabled={step === 0 || saving} className="min-w-[112px]">
              <ArrowLeft className="h-4 w-4" /> Назад
            </Button>
            {canContinue ? (
              <Button type="button" onClick={nextStep} disabled={saving} className="min-w-[140px]">
                Далее <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={finishOnboarding} disabled={saving} className="min-w-[190px]">
                {saving ? "Сохраняем..." : "Проанализировать профиль"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </main>

        <aside className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-paper/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-red/20" />
          <Link href="/app" className="relative inline-flex items-center gap-2 font-display text-[17px] font-bold" aria-label="ULYS">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white">✦</span>
            ULYS
          </Link>
          <div className="relative space-y-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">ULYS PROFILE</p>
              <h2 className="mt-4 max-w-sm font-display text-[27px] font-semibold leading-snug">Твой профиль — это маршрут, а не анкета.</h2>
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-paper/70">Мы учитываем твои цели, сильные стороны и ограничения, чтобы каждый следующий шаг был понятен.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/20 text-red"><ShieldCheck className="h-4 w-4" /></span>
                <div><p className="text-[13px] font-medium">Без выдуманных данных</p><p className="mt-0.5 text-[11.5px] text-paper/60">Рекомендации строятся только на твоём профиле.</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow"><Lightbulb className="h-4 w-4" /></span>
                <div><p className="text-[13px] font-medium">Понятные следующие шаги</p><p className="mt-0.5 text-[11.5px] text-paper/60">ULYS объясняет, почему действие важно сейчас.</p></div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-between border-t border-paper/10 pt-6 text-[11.5px] text-paper/55">
            <span>PROFILE → DIAGNOSIS → ROUTE</span>
            <span className="font-mono">01 / 05</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
