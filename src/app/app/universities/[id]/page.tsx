import { TopBar } from "@/components/app/TopBar";
import { getUniversityById, universities } from "@/data/universities";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { UniversityAnalysisSidebar } from "@/components/university/UniversityAnalysisSidebar";

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
          <ArrowLeft className="h-4 w-4" /> Все универсеты
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
              {u.rankingContext && (
                <p className="mt-2 text-[12.5px] text-ink-soft">Рейтинг: {u.rankingContext}</p>
              )}
              {u.acceptanceInfo && (
                <p className="mt-1 text-[12.5px] text-ink-soft">Приём: {u.acceptanceInfo}</p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-display text-[15px] font-semibold">Программы</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {u.undergraduatePrograms.map((p) => (
                  <span key={p} className="rounded-full bg-paper-dim px-3 py-1 text-[12px] font-medium text-ink">
                    {p}
                  </span>
                ))}
              </div>
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

            {u.languageRequirements && (
              <div className="mt-6">
                <h2 className="font-display text-[15px] font-semibold">Языковые требования</h2>
                <p className="mt-2 text-[14px] text-ink-soft">{u.languageRequirements}</p>
              </div>
            )}

            {u.satRequirements && (
              <div className="mt-6">
                <h2 className="font-display text-[15px] font-semibold">SAT/ACT</h2>
                <p className="mt-2 text-[14px] text-ink-soft">{u.satRequirements}</p>
              </div>
            )}

            {u.tuition && (
              <div className="mt-6">
                <h2 className="font-display text-[15px] font-semibold">Стоимость обучения</h2>
                <p className="mt-2 text-[14px] text-ink-soft">{u.tuition}</p>
              </div>
            )}

            {u.financialAid && (
              <div className="mt-6">
                <h2 className="font-display text-[15px] font-semibold">Финансовая помощь</h2>
                <p className="mt-2 text-[14px] text-ink-soft">{u.financialAid}</p>
              </div>
            )}
          </div>

          <div className="h-fit">
            <UniversityAnalysisSidebar university={u} />
          </div>
        </div>
      </div>
    </>
  );
}
