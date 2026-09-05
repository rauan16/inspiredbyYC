"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, ExternalLink } from "lucide-react";
import { AdmissionAnalysis } from "@/types";

interface AdmissionAnalysisCardProps {
  universityName: string;
  officialAdmissionsUrl?: string;
  analysis: AdmissionAnalysis | null;
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

const ASSESSMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HIGHLY_COMPETITIVE: { bg: "bg-green/10", text: "text-green", label: "Высококонкурентно" },
  COMPETITIVE: { bg: "bg-blue/10", text: "text-blue", label: "Конкурентно" },
  MODERATE: { bg: "bg-yellow/10", text: "text-yellow", label: "Умеренно" },
  WEAK: { bg: "bg-red/10", text: "text-red", label: "Слабо" },
  INSUFFICIENT_DATA: { bg: "bg-ink-soft/10", text: "text-ink-soft", label: "Недостаточно данных" },
};

const RATING_COLORS: Record<string, { bg: string; text: string }> = {
  EXCELLENT: { bg: "bg-green/10", text: "text-green" },
  STRONG: { bg: "bg-blue/10", text: "text-blue" },
  GOOD: { bg: "bg-yellow/10", text: "text-yellow" },
  MODERATE: { bg: "bg-orange/10", text: "text-orange" },
  WEAK: { bg: "bg-red/10", text: "text-red" },
  INSUFFICIENT_DATA: { bg: "bg-ink-soft/10", text: "text-ink-soft" },
};

function RatingBadge({ rating, explanation }: { rating: string; explanation: string }) {
  const style = RATING_COLORS[rating] || RATING_COLORS.INSUFFICIENT_DATA;
  const label = rating === "INSUFFICIENT_DATA" ? "Н/Д" : rating === "EXCELLENT" ? "Отлично" : rating === "STRONG" ? "Сильно" : rating === "GOOD" ? "Хорошо" : rating === "MODERATE" ? "Умеренно" : rating === "WEAK" ? "Слабо" : rating;
  const score = rating === "INSUFFICIENT_DATA" ? "?" : rating === "EXCELLENT" ? "5" : rating === "STRONG" ? "4" : rating === "GOOD" ? "3" : rating === "MODERATE" ? "2" : "1";

  return (
    <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
      <p className="text-[10.5px] text-ink-soft">{label}</p>
      <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full ${style.bg}`}>
        <span className={`font-display text-[11px] font-bold ${style.text}`}>
          {score}
        </span>
      </div>
      <p className="mt-1 text-[9px] leading-tight text-ink-soft opacity-70">
        {explanation.slice(0, 80)}
      </p>
    </div>
  );
}

export function AdmissionAnalysisCard({
  universityName,
  officialAdmissionsUrl,
  analysis,
  loading,
  error,
  onRefetch,
}: AdmissionAnalysisCardProps) {
  const [showModal, setShowModal] = useState(false);

  if (loading && !analysis) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
        <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>AI анализирует ваш профиль для {universityName}...</span>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
        <p className="text-[13.5px] text-ink-soft">{error}</p>
        <button
          onClick={onRefetch}
          className="mt-3 rounded-full border border-line px-4 py-1.5 text-[12.5px] font-medium hover:border-ink"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const assessmentStyle = ASSESSMENT_COLORS[analysis.overallAssessment.level] || ASSESSMENT_COLORS.INSUFFICIENT_DATA;

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-semibold">AI Анализ поступления</h3>
          <button
            onClick={onRefetch}
            disabled={loading}
            className="rounded-full border border-line px-3 py-1 text-[11px] font-medium hover:border-ink disabled:opacity-50"
          >
            Обновить
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl bg-paper-dim px-4 py-3">
          <div className={`rounded-lg p-2 ${assessmentStyle.bg}`}>
            <TrendingUp className={`h-5 w-5 ${assessmentStyle.text}`} />
          </div>
          <div className="flex-1">
            <p className={`font-display text-[14px] font-bold ${assessmentStyle.text}`}>
              {assessmentStyle.label}
            </p>
            <p className="text-[11.5px] text-ink-soft">{analysis.overallAssessment.explanation}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <RatingBadge rating={analysis.profileAnalysis.academic.rating} explanation={analysis.profileAnalysis.academic.explanation} />
          <RatingBadge rating={analysis.profileAnalysis.extracurricular.rating} explanation={analysis.profileAnalysis.extracurricular.explanation} />
          <RatingBadge rating={analysis.profileAnalysis.portfolio.rating} explanation={analysis.profileAnalysis.portfolio.explanation} />
        </div>

        {analysis.admissionEstimate.available && (
          <div className="mb-4 rounded-xl bg-paper-dim px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Оценка шансов</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[20px] font-bold text-blue">
                {analysis.admissionEstimate.min}%–{analysis.admissionEstimate.max}%
              </span>
              {analysis.admissionEstimate.confidence && (
                <span className="text-[11px] text-ink-soft">
                  Уверенность: {analysis.admissionEstimate.confidence === "HIGH" ? "Высокая" : analysis.admissionEstimate.confidence === "MEDIUM" ? "Средняя" : "Низкая"}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11.5px] text-ink-soft">
              {analysis.admissionEstimate.explanation}
            </p>
            <p className="mt-1 text-[10px] text-ink-soft">
              Оценка — ориентир, не гарантия поступления
            </p>
          </div>
        )}

        {analysis.requirementAnalysis.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Проверка требований</p>
            <div className="mt-2 space-y-2">
              {analysis.requirementAnalysis.map((req, i) => {
                const isMet = req.status === "MET";
                const isMissing = req.status === "MISSING";
                const isUnknown = req.status === "UNKNOWN";
                const statusIcon = isMet ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
                ) : (
                  <AlertCircle className={`h-4 w-4 shrink-0 ${isMissing ? "text-red" : isUnknown ? "text-ink-soft" : "text-yellow"}`} />
                );

                return (
                  <div key={i} className="flex items-start gap-2.5">
                    {statusIcon}
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[12.5px] font-medium text-ink">{req.criterion}</p>
                        <span
                          className={`text-[10px] font-semibold ${
                            isMet ? "text-green" : isMissing ? "text-red" : isUnknown ? "text-ink-soft" : "text-yellow"
                          }`}
                        >
                          {isMet ? "Выполнено" : isMissing ? "Не указано" : isUnknown ? "Не указано университетом" : "Не выполнено"}
                        </span>
                      </div>
                      {req.studentValue && (
                        <p className="mt-0.5 text-[11px] text-ink-soft">Ваш результат: {req.studentValue}</p>
                      )}
                      {req.requiredValue && (
                        <p className="mt-0.5 text-[11px] text-ink-soft">Требуется: {req.requiredValue}</p>
                      )}
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{req.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-full border border-line py-2 text-[12.5px] font-medium hover:border-ink"
        >
          Подробный отчет
        </button>
      </div>

      {officialAdmissionsUrl && (
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-4">
          <a
            href={officialAdmissionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-line py-3 text-[13.5px] font-medium hover:border-ink"
          >
            Официальный сайт {universityName} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-card)] border border-line bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[18px] font-semibold">Полный AI анализ для {universityName}</h3>
              <button onClick={() => setShowModal(false)} className="text-[18px] text-ink-soft hover:text-ink">
                ×
              </button>
            </div>

            <div className="space-y-5 text-[13.5px]">
              <div>
                <h4 className="font-display text-[13px] font-semibold text-ink">Оценка слабых сторон</h4>
                <ul className="mt-2 space-y-1 text-[12.5px] text-ink-soft">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display text-[13px] font-semibold text-ink">Рекомендации</h4>
                <ul className="mt-2 space-y-2 text-[12.5px]">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                          r.priority === "HIGH"
                            ? "bg-red/10 text-red"
                            : r.priority === "MEDIUM"
                            ? "bg-yellow/10 text-yellow"
                            : "bg-blue/10 text-blue"
                        }`}
                      >
                        {r.priority === "HIGH" ? "!" : r.priority === "MEDIUM" ? "!" : "i"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-ink">{r.action}</p>
                        <p className="text-ink-soft">{r.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
