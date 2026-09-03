import { TopBar } from "@/components/app/TopBar";
import { opportunities as staticOpportunities } from "@/data/opportunities";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink, MapPin, ShieldCheck, Users } from "lucide-react";
import { getDeadlineLabel, getDeadlineStatusLabel, getDeadlineStatus } from "@/lib/utils";

export function generateStaticParams() {
  return staticOpportunities.map((o) => ({ id: o.id }));
}

const colorDim: Record<string, string> = {
  red: "bg-red-dim text-red",
  yellow: "bg-yellow-dim text-ink",
  blue: "bg-blue-dim text-blue",
  violet: "bg-violet-dim text-violet",
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = staticOpportunities.find((o) => o.id === id);
  if (!opportunity) notFound();

  return (
    <>
      <TopBar title="Возможность" />
      <div className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <Link
          href="/app/opportunities"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Все возможности
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 md:p-8">
            <span
              className={`inline-block rounded-full px-3 py-1 text-[11.5px] font-medium ${colorDim[opportunity.color]}`}
            >
              {opportunity.categoryLabel}
            </span>
            <h1 className="mt-4 font-display text-[26px] font-bold leading-tight md:text-[30px]">
              {opportunity.title}
            </h1>
            <p className="mt-1.5 text-[14px] text-ink-soft">{opportunity.organization}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-[13px] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Дедлайн: {getDeadlineLabel(opportunity.deadline, opportunity.deadlineType)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  getDeadlineStatus(opportunity.deadline, opportunity.deadlineType) === "open"
                    ? "bg-green/10 text-green"
                    : getDeadlineStatus(opportunity.deadline, opportunity.deadlineType) === "closing-soon"
                      ? "bg-yellow/10 text-yellow"
                      : getDeadlineStatus(opportunity.deadline, opportunity.deadlineType) === "closed"
                        ? "bg-red/10 text-red"
                        : "bg-ink/10 text-ink-soft"
                }`}
              >
                {getDeadlineStatusLabel(getDeadlineStatus(opportunity.deadline, opportunity.deadlineType))}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {opportunity.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {opportunity.eligibility}
              </span>
              {opportunity.ageGrade && (
                <span className="flex items-center gap-1.5">
                  Возраст/класс: {opportunity.ageGrade}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-green-dim px-2.5 py-1 text-green">
                <ShieldCheck className="h-4 w-4" />
                {opportunity.verificationStatus === "verified"
                  ? "Проверено"
                  : opportunity.verificationStatus === "partially_verified"
                    ? "Частично проверено"
                    : opportunity.verificationStatus === "expired"
                      ? "Завершено"
                      : "Не проверено"}
              </span>
            </div>

            <div className="mt-7">
              <h2 className="font-display text-[15px] font-semibold">Описание</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {opportunity.description}
              </p>
            </div>

            <div className="mt-7">
              <h2 className="font-display text-[15px] font-semibold">Требования</h2>
              <ul className="mt-2 space-y-1.5">
                {opportunity.requirements.map((r) => (
                  <li key={r} className="text-[14px] text-ink-soft">
                    · {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <h2 className="font-display text-[15px] font-semibold">Таймлайн</h2>
              <ul className="mt-3 space-y-3 border-l border-line pl-4">
                {opportunity.timeline.map((t) => (
                  <li key={t.label} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-red" />
                    <p className="text-[13.5px] font-medium">{t.label}</p>
                    <p className="text-[12.5px] text-ink-soft">{t.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-fit space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <a
              href={opportunity.applicationUrl || opportunity.website}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-[13.5px] font-medium text-paper hover:bg-red"
            >
              Открыть официальную страницу <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="border-t border-line pt-4 text-[12.5px] leading-relaxed text-ink-soft">
              <p className="mb-1">Формат: <span className="font-medium text-ink">{opportunity.format}</span></p>
              {opportunity.ageGrade && (
                <p className="mb-1">Возраст/класс: <span className="font-medium text-ink">{opportunity.ageGrade}</span></p>
              )}
              <p>Статус: <span className="font-medium text-ink">{opportunity.status}</span></p>
              <p className="mt-2">Последняя проверка: <span className="font-medium text-ink">{opportunity.lastVerifiedAt}</span></p>
              {opportunity.officialSourceUrl && (
                <p className="mt-1">
                  Источник:{" "}
                  <a href={opportunity.officialSourceUrl} target="_blank" rel="noreferrer" className="text-blue hover:underline">
                    {opportunity.officialSourceUrl}
                  </a>
                </p>
              )}
            </div>
            <div className="border-t border-line pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft mb-2">Теги</p>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-paper-dim px-2.5 py-1 text-[11px] font-medium text-ink">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
