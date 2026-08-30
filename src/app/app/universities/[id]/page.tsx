import { TopBar } from "@/components/app/TopBar";
import { getUniversityById, universities } from "@/data/universities";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function generateStaticParams() {
  return universities.map((u) => ({ id: u.id }));
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = getUniversityById(id);
  if (!u) notFound();

  return (
    <>
      <TopBar title="Университет" />
      <div className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <Link
          href="/app/universities"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Все университеты
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 md:p-8">
            <h1 className="font-display text-[26px] font-bold leading-tight md:text-[30px]">
              {u.name}
            </h1>
            <p className="mt-1.5 text-[14px] text-ink-soft">
              {u.location}, {u.country} · Дедлайн заявки {u.deadline}
            </p>

            <div className="mt-6">
              <h2 className="font-display text-[15px] font-semibold">Обзор</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{u.overview}</p>
            </div>

            <div className="mt-6">
              <h2 className="font-display text-[15px] font-semibold">Требования</h2>
              <ul className="mt-2 space-y-1.5">
                {u.requirements.map((r) => (
                  <li key={r} className="text-[14px] text-ink-soft">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-fit space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <div className="text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-blue">
                <span className="font-display text-[18px] font-bold text-blue">
                  {u.analysis.profileMatch}%
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-ink-soft">Profile Match</p>
              <p className="mt-1 text-[10.5px] text-ink-soft">Оценка — ориентир, не гарантия</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
                <p className="text-[10.5px] text-ink-soft">Академич. соответствие</p>
                <p className="mt-1 font-display text-[13px] font-semibold">
                  {u.analysis.academicFit}
                </p>
              </div>
              <div className="rounded-xl bg-paper-dim px-3 py-3 text-center">
                <p className="text-[10.5px] text-ink-soft">Сила заявки</p>
                <p className="mt-1 font-display text-[13px] font-semibold">
                  {u.analysis.applicationStrength}
                </p>
              </div>
            </div>

            {u.analysis.strengths.length > 0 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  Сильные стороны
                </p>
                <ul className="mt-2 space-y-1.5">
                  {u.analysis.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[12.5px] text-ink">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {u.analysis.gaps.length > 0 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  Зоны роста
                </p>
                <ul className="mt-2 space-y-1.5">
                  {u.analysis.gaps.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[12.5px] text-ink">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Рекомендации
              </p>
              <ul className="mt-2 space-y-1.5">
                {u.analysis.recommendations.map((r) => (
                  <li key={r} className="text-[12.5px] leading-snug text-ink">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
