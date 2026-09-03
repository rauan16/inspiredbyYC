"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { University } from "@/types";
import { getAccount, StoredAccount } from "@/lib/account";
import { computeUniversityAnalysis } from "@/lib/universityMatching";

const FIT_COLORS: Record<string, { bg: string; text: string }> = {
  "Strong Fit": { bg: "border-blue bg-blue/10", text: "text-blue" },
  "Moderate Fit": { bg: "border-yellow bg-yellow/10", text: "text-yellow" },
  "Weak Fit": { bg: "border-red bg-red/10", text: "text-red" },
  "Not reliably estimable": { bg: "border-line bg-paper-dim", text: "text-ink-soft" },
};

interface UniversityAnalysisSidebarProps {
  university: University;
}

export function UniversityAnalysisSidebar({ university }: UniversityAnalysisSidebarProps) {
  const [account, setAccount] = useState<StoredAccount>(getAccount());

  useEffect(() => {
    const update = () => setAccount(getAccount());
    update();
    window.addEventListener("ulys-account-updated", update);
    return () => window.removeEventListener("ulys-account-updated", update);
  }, []);

  const analysis = useMemo(() => computeUniversityAnalysis(university, account), [university, account]);

  const fitStyle = FIT_COLORS[analysis.profileMatch] || FIT_COLORS["Not reliably estimable"];
  const fitLabel = analysis.profileMatch;

  return (
    <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5">
      <div className="text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[6px] ${fitStyle.bg}`}>
          <span className={`font-display text-[14px] font-bold ${fitStyle.text}`}>
            {fitLabel}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-medium text-ink-soft">Fit Level</p>
        <p className="mt-1 text-[10.5px] text-ink-soft">Оценка — ориентир, не гарантия поступления</p>
        <p className="mt-1 text-[10.5px] font-medium text-ink">
          Уверенность: {analysis.confidence === "High" ? "Высокая" : analysis.confidence === "Medium" ? "Средняя" : "Низкая"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Академич. соответствие</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.academicFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Тестирование</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.testingFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Специальность</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.majorFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Экстракур.</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.extracurricularFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Исследования</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.researchFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Лидерство</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.leadershipFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Требования</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.requirementsFit}
          </p>
        </div>
        <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
          <p className="text-[10.5px] text-ink-soft">Сила заявки</p>
          <p className="mt-1 font-display text-[13px] font-semibold">
            {analysis.applicationStrength}
          </p>
        </div>
      </div>

      {analysis.missingData && analysis.missingData.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            Отсутствующие данные
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.missingData.map((s) => (
              <li key={s} className="text-[12.5px] text-ink-soft">
                · {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.strengths.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            Сильные стороны
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12.5px] text-ink">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.gaps.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            Зоны роста
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.gaps.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[12.5px] text-ink">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.explanation && (
        <div className="border-t border-line pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            Пояснение
          </p>
          <p className="mt-2 text-[12.5px] leading-snug text-ink">
            {analysis.explanation}
          </p>
        </div>
      )}

      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          Рекомендации
        </p>
        <ul className="mt-2 space-y-1.5">
          {analysis.recommendations.map((r) => (
            <li key={r} className="text-[12.5px] leading-snug text-ink">
              · {r}
            </li>
          ))}
        </ul>
      </div>

      {university.officialAdmissionsUrl && (
        <div className="border-t border-line pt-4">
          <a
            href={university.officialAdmissionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-line py-3 text-[13.5px] font-medium hover:border-ink"
          >
            Официальный сайт <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
