"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { saveAccount } from "@/lib/account";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const interestOptions = [
  "STEM",
  "Бизнес",
  "Медицина",
  "Право",
  "Дизайн",
  "Искусство",
  "Информатика",
  "Социальные науки",
];

const goalOptions = [
  "Поступление в университет",
  "Конкурсы",
  "Стипендии",
  "Волонтёрство",
  "Стажировки",
  "Портфолио",
];

const steps = ["Профиль", "Страна", "Интересы", "Цели"];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState("11 класс");
  const [country, setCountry] = useState("Казахстан");
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const isLast = step === steps.length - 1;

  async function finishOnboarding() {
    setSaving(true);
    saveAccount({ grade, location: country, interests, goals });

    try {
      await api.patch("/api/profile", { grade, location: country, interests, goals });
    } catch {
    }

    router.push("/app");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/" className="font-display text-[20px] font-bold">
        ULYS
      </Link>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step ? "bg-red" : "bg-line"
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-[12px] text-ink-soft">
        Шаг {step + 1} из {steps.length} · {steps[step]}
      </p>

      <div className="mt-8">
        {step === 0 && (
          <div>
            <h2 className="font-display text-[24px] font-bold">Расскажи о себе</h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              Это поможет подбирать подходящие возможности.
            </p>
            <div className="mt-6 flex flex-col gap-1.5">
              <label htmlFor="grade" className="text-[13px] font-medium text-ink">
                Класс / возраст
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-11 rounded-xl border border-line bg-white px-3.5 text-[14px] outline-none focus:border-ink"
              >
                {["8 класс", "9 класс", "10 класс", "11 класс"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-[24px] font-bold">Где ты учишься?</h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              Поможет показывать локальные возможности и релевантные университеты.
            </p>
            <div className="mt-6 flex flex-col gap-1.5">
              <label htmlFor="country" className="text-[13px] font-medium text-ink">
                Страна
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 rounded-xl border border-line bg-white px-3.5 text-[14px] outline-none focus:border-ink"
              >
                {["Казахстан", "Кыргызстан", "Узбекистан", "Другая страна"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-[24px] font-bold">Что тебе интересно?</h2>
            <p className="mt-2 text-[14px] text-ink-soft">Выбери всё, что подходит.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {interestOptions.map((opt) => {
                const active = interests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(interests, setInterests, opt)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors",
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-white text-ink hover:border-ink/40"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-[24px] font-bold">Какие у тебя цели?</h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              ULYS будет подбирать рекомендации под них.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {goalOptions.map((opt) => {
                const active = goals.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(goals, setGoals, opt)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors",
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-white text-ink hover:border-ink/40"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        {step > 0 ? (
          <Button variant="tertiary" onClick={() => setStep((s) => s - 1)}>
            Назад
          </Button>
        ) : (
          <span />
        )}

        {isLast ? (
          <Button onClick={finishOnboarding} disabled={saving}>
            {saving ? "Сохранение..." : "Завершить"}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>Далее</Button>
        )}
      </div>
    </div>
  );
}
