"use client";

import { TopBar } from "@/components/app/TopBar";
import { student } from "@/data/student";
import { MapPin, Pencil } from "lucide-react";
import { getAccount } from "@/lib/account";
import { useEffect, useState } from "react";
import { PortfolioEntry } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";

const activity: { id: string; text: string; date: string }[] = [];

const feedback: { id: string; from: string; text: string }[] = [];

export default function ProfilePage() {
  const [account, setAccount] = useState(student);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", location: "", grade: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const { profile, updateProfile } = useProfile();
  const { entries } = usePortfolio();

  useEffect(() => {
    const current = getAccount();
    setAccount(current);
    setDraft({
      name: current.name,
      location: current.location,
      grade: current.grade,
      bio: current.bio,
    });
    setPortfolio(current.portfolioEntries ?? []);
  }, []);

  useEffect(() => {
    setPortfolio(entries);
  }, [entries]);

  async function saveProfile() {
    setSaving(true);
    const name = draft.name.trim() || account.name;
    const updates = {
      ...draft,
      name,
      avatarInitials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    };
    await updateProfile(updates);
    setEditing(false);
    setSaving(false);
  }

  const displayName = profile.name ?? account.name;
  const displayLocation = profile.location ?? account.location;
  const displayGrade = profile.grade ?? account.grade;
  const displayBio = profile.bio ?? account.bio;
  const displayInitials = profile.avatarInitials ?? account.avatarInitials;
   const displayInterests = profile.interests ?? account.interests ?? [];

  return (
    <>
      <TopBar title="Мой профиль" />
      <div className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red font-display text-[18px] font-semibold text-white">
                {displayInitials}
              </span>
              <div>
                <h1 className="font-display text-[19px] font-bold">{displayName}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" /> {displayLocation} · {displayGrade}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] font-medium hover:border-ink"
            >
              <Pencil className="h-3.5 w-3.5" /> {editing ? "Отмена" : "Редактировать"}
            </button>
          </div>

          {editing ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <input aria-label="Имя" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-10 rounded-xl border border-line bg-paper px-3 text-[13px] outline-none focus:border-ink" />
              <input aria-label="Город" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="h-10 rounded-xl border border-line bg-paper px-3 text-[13px] outline-none focus:border-ink" />
              <input aria-label="Класс" value={draft.grade} onChange={(event) => setDraft({ ...draft, grade: event.target.value })} className="h-10 rounded-xl border border-line bg-paper px-3 text-[13px] outline-none focus:border-ink" />
              <textarea aria-label="О себе" value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="min-h-20 rounded-xl border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-ink sm:col-span-3" />
              <button type="button" onClick={saveProfile} disabled={saving} className="h-10 rounded-full bg-red px-5 text-[13px] font-medium text-white hover:bg-red/90 disabled:opacity-50 sm:col-span-3 sm:w-fit">
                {saving ? "Сохранение..." : "Сохранить профиль"}
              </button>
            </div>
          ) : (
            <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              {displayBio || "Добавь информацию о себе, чтобы персонализировать свой путь."}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {displayInterests.map((i) => (
              <span key={i} className="rounded-full bg-paper-dim px-3 py-1.5 text-[12px] font-medium">
                {i}
              </span>
            ))}
          </div>
        </div>

        <TabsRoot
          portfolio={portfolio}
          activity={activity}
          feedback={feedback}
        />
      </div>
    </>
  );
}

function TabsRoot({ portfolio, activity, feedback }: { portfolio: PortfolioEntry[]; activity: { id: string; text: string; date: string }[]; feedback: { id: string; from: string; text: string }[] }) {
  const [tab, setTab] = useState("activity");

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-line">
        {[
          { value: "activity", label: "Активность" },
          { value: "portfolio", label: "Портфолио" },
          { value: "feedback", label: "Отзывы" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`border-b-2 px-4 py-3 text-[13.5px] font-medium transition-colors ${
              tab === t.value
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "activity" && (
        <div className="mt-5 space-y-2.5">
          {activity.length > 0 ? activity.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3"
            >
              <p className="text-[13.5px]">{a.text}</p>
              <span className="shrink-0 text-[11.5px] text-ink-soft">{a.date}</span>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
              <p className="font-display text-[14px] font-semibold">Активность появится здесь</p>
              <p className="mt-1 text-[12.5px] text-ink-soft">Добавляй возможности и обновляй портфолио.</p>
            </div>
          )}
        </div>
      )}

      {tab === "portfolio" && (
        <div className="mt-5 space-y-2.5">
          {portfolio.slice(0, 6).map((e) => (
            <div key={e.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="text-[13.5px] font-medium">{e.title}</p>
              {e.date && <p className="text-[11.5px] text-ink-soft">{e.date}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "feedback" && (
        <div className="mt-5 space-y-2.5">
          {feedback.length > 0 ? feedback.map((f) => (
            <div key={f.id} className="rounded-xl border border-line bg-white px-4 py-3">
              <p className="text-[12px] font-medium text-ink-soft">{f.from}</p>
              <p className="mt-1 text-[13.5px]">{f.text}</p>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center">
              <p className="font-display text-[14px] font-semibold">Отзывов пока нет</p>
              <p className="mt-1 text-[12.5px] text-ink-soft">Здесь появятся рекомендации от Mentor.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
