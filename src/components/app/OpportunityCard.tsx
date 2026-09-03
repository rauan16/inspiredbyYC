"use client";

import { Opportunity } from "@/types";
import { cn, getDeadlineLabel } from "@/lib/utils";
import { Star, Clock, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";

const colorMap: Record<Opportunity["color"], { bg: string; text: string; sub: string }> = {
  red: { bg: "bg-red", text: "text-white", sub: "text-white/80" },
  yellow: { bg: "bg-yellow", text: "text-ink", sub: "text-ink/70" },
  blue: { bg: "bg-blue", text: "text-white", sub: "text-white/80" },
  violet: { bg: "bg-violet", text: "text-white", sub: "text-white/80" },
};

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const c = colorMap[opportunity.color];
  const { isSaved, toggleSave } = useSavedOpportunities();
  const saved = isSaved(opportunity.id);

  const verificationLabel =
    opportunity.verificationStatus === "verified"
      ? "Проверено"
      : opportunity.verificationStatus === "partially_verified"
        ? "Частично проверено"
        : opportunity.verificationStatus === "expired"
          ? "Завершено"
          : "Не проверено";

  return (
    <Link
      href={`/app/opportunities/${opportunity.id}`}
      className={cn(
        "group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/30 p-5 shadow-[0_18px_32px_rgba(41,37,34,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(41,37,34,0.12)]",
        c.bg
      )}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("text-[11px] font-medium uppercase tracking-[0.14em]", c.sub)}>
          {opportunity.categoryLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-ink">
            <ShieldCheck className="h-3 w-3" />
            {verificationLabel}
          </span>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Убрать из сохранённых" : "Сохранить возможность"}
            onClick={(e) => {
              e.preventDefault();
              toggleSave(opportunity);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-white/30 backdrop-blur-sm transition-all duration-200",
              saved ? "bg-white text-ink shadow-[0_10px_18px_rgba(0,0,0,0.12)]" : "bg-white/15 text-white hover:bg-white/25",
              opportunity.color === "yellow" && !saved && "border-ink/10 bg-ink/10 text-ink hover:bg-ink/15"
            )}
          >
            <Star className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="relative">
        <h3 className={cn("font-display text-[19px] font-semibold leading-[1.1] tracking-[-0.05em]", c.text)}>
          {opportunity.title}
        </h3>
        <p className={cn("mt-2 text-[13px]", c.sub)}>{opportunity.organization}</p>
        <p className={cn("mt-2 line-clamp-2 text-[12.5px] leading-relaxed", c.sub)}>
          {opportunity.description}
        </p>
        {opportunity.recommendationReason && (
          <p className={cn("mt-2 line-clamp-2 text-[11px] italic leading-relaxed", c.sub)}>
            {opportunity.recommendationReason}
          </p>
        )}
      </div>

      <div className={cn("relative flex items-center gap-3 text-[12px] font-medium", c.sub)}>
        <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-1">
          <Clock className="h-3.5 w-3.5" /> {getDeadlineLabel(opportunity.deadline, opportunity.deadlineType)}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-1">
          <MapPin className="h-3.5 w-3.5" /> {opportunity.location}
        </span>
      </div>
    </Link>
  );
}
