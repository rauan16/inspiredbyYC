"use client";

import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { getAccount } from "@/lib/account";
import { cn } from "@/lib/utils";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useMentorMessages } from "@/hooks/useMentorMessages";
import { useUniversityRecommendations } from "@/hooks/useUniversityRecommendations";
import { useRoadmap } from "@/hooks/useRoadmap";
import { useOnlineStatus } from "@/hooks/useApi";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const SUGGESTED_PROMPTS = [
  "Почему университет может подходить мне?",
  "Что стоит улучшить в профиле?",
  "Как работает ULYS Match?",
  "Что такое ULYS What-If?",
];

function MessageAppear({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "message-appear",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function UliePage() {
  const [account, setAccount] = useState(() => getAccount());
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const { messages, sending, sendMessage } = useMentorMessages();
  const { recommendations, loading: recsLoading } = useUniversityRecommendations();
  const { roadmap, loading: roadmapLoading } = useRoadmap();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setAccount(getAccount());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim()) return;
    setInput("");
    await sendMessage(text);
  }

  const hasMessages = messages.length > 0;
  const hasProfile = profile.name || account.name;
  const academicInfo = profile.academicInfo || account.academicInfo;
  const hasAcademicInfo = academicInfo && (
    academicInfo.school ||
    academicInfo.intendedMajor ||
    academicInfo.gpaValue != null ||
    academicInfo.ielts ||
    academicInfo.sat ||
    academicInfo.toefl ||
    academicInfo.graduationYear
  );
  const portfolioStrength = profile.portfolioStrength ?? account.portfolioStrength ?? 0;
  const goals = profile.goals || account.goals || [];
  const interests = profile.interests || account.interests || [];

  return (
    <>
      <TopBar title="ULIE" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col px-5 py-6 lg:px-8 lg:py-8">
          {!isOnline && (
            <div className="mb-4 rounded-2xl border border-yellow bg-yellow-dim px-4 py-2.5 text-[12.5px] text-ink">
              Оффлайн-режим. ULIE временно недоступен. Сообщения будут отправлены при подключении.
            </div>
          )}

          {!hasMessages ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-5 text-center max-w-lg">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red text-white">
                    <Sparkles className="h-8 w-8" />
                  </div>
                </div>
                <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
                  ULIE
                </h1>
                <p className="font-display text-[20px] font-semibold text-ink">
                  Твой AI-помощник по поступлению
                </p>
                <p className="text-[14px] leading-relaxed text-ink-soft">
                  ULIE использует контекст твоего профиля, рекомендаций и roadmap, чтобы помогать тебе принимать следующие решения.
                </p>
              </div>

              <div className="mt-12 w-full max-w-xl">
                <p className="mb-4 text-[12px] font-medium uppercase tracking-wide text-ink-soft">Предложения</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      disabled={!isOnline}
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pb-6">
              {messages.map((m) => (
                <MessageAppear key={m.id}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed sm:max-w-[70%]",
                      m.role === "student"
                        ? "ml-auto rounded-tr-sm bg-ink text-paper font-medium"
                        : "mr-auto rounded-tl-sm bg-white border border-line text-ink"
                    )}
                  >
                    {m.role === "mentor" ? (
                      <div className="markdown-content">
                        <MarkdownRenderer content={m.content} />
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </MessageAppear>
              ))}
              {sending && (
                <MessageAppear>
                  <div className="mr-auto rounded-tl-sm bg-white border border-line px-4 py-3 text-[13.5px] text-ink-soft">
                    ULIE думает...
                  </div>
                </MessageAppear>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-center gap-2 rounded-full border border-line bg-white px-2 py-2 transition-colors focus-within:border-ink"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder={isOnline ? "Спроси ULIE..." : "Оффлайн — отправка недоступна"}
              disabled={!isOnline}
              className="flex-1 bg-transparent px-3 text-[13.5px] outline-none placeholder:text-ink-soft/70 disabled:cursor-not-allowed"
              aria-label="Сообщение ULIE"
            />
            <button
              type="submit"
              disabled={!isOnline || sending}
              aria-label="Отправить"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red text-white disabled:opacity-50 transition-colors hover:bg-red/90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <aside className="w-full shrink-0 border-t border-line/70 bg-white px-5 py-6 lg:w-80 lg:border-l lg:border-t-0 lg:px-6 lg:py-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-[13.5px] font-semibold">Контекст</p>
              <p className="text-[11px] text-ink-soft">ULIE видит это при ответе</p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Профиль</p>
              {hasProfile ? (
                <div className="mt-1.5 space-y-0.5 text-[12.5px]">
                  {account.name && <p><span className="text-ink-soft">Имя:</span> {account.name}</p>}
                  {account.grade && <p><span className="text-ink-soft">Класс:</span> {account.grade}</p>}
                  {account.location && <p><span className="text-ink-soft">Город:</span> {account.location}</p>}
                </div>
              ) : (
                <p className="mt-1.5 text-[12.5px] text-ink-soft">Профиль ещё не заполнен</p>
              )}
            </div>

             <div>
               <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Университеты</p>
               {recsLoading ? (
                 <p className="mt-1.5 text-[12.5px] text-ink-soft">Загрузка рекомендаций…</p>
               ) : recommendations && recommendations.length > 0 ? (
                 <div className="mt-1.5 space-y-1.5">
                   {recommendations.slice(0, 4).map((rec) => (
                     <div key={rec.university_id} className="flex items-center justify-between rounded-lg bg-paper-dim/30 px-2 py-1.5">
                       <span className="text-[12.5px] text-ink">{rec.name}</span>
                       <span className="font-mono text-[11px] font-medium text-red">{rec.match_score}%</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="mt-1.5 text-[12.5px] text-ink-soft">Рекомендации появятся после заполнения профиля</p>
               )}
             </div>

             <div>
               <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Roadmap</p>
               {roadmapLoading ? (
                 <p className="mt-1.5 text-[12.5px] text-ink-soft">Строим маршрут…</p>
               ) : roadmap?.next_best_action ? (
                 <div className="mt-1.5 rounded-lg bg-paper-dim/30 px-3 py-2">
                   <p className="text-[12.5px] font-medium text-ink">{roadmap.next_best_action.title}</p>
                   {roadmap.next_best_action.target_date && (
                     <p className="mt-0.5 text-[11.5px] text-ink-soft">{roadmap.next_best_action.target_date}</p>
                   )}
                 </div>
               ) : (
                 <p className="mt-1.5 text-[12.5px] text-ink-soft">Маршрут строится после заполнения профиля</p>
               )}
             </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Портфолио</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-dim">
                  <div className="h-full rounded-full bg-red" style={{ width: `${portfolioStrength}%` }} />
                </div>
                <span className="text-[12.5px] font-medium">{portfolioStrength}%</span>
              </div>
            </div>

            {hasAcademicInfo && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Академические данные</p>
                <div className="mt-1.5 space-y-0.5 text-[12.5px]">
                  {academicInfo.school && (
                    <p><span className="text-ink-soft">Школа:</span> {academicInfo.school}</p>
                  )}
                  {academicInfo.intendedMajor && (
                    <p><span className="text-ink-soft">Major:</span> {academicInfo.intendedMajor}</p>
                  )}
                  {academicInfo.gpaValue != null && (
                    <p><span className="text-ink-soft">GPA:</span> {academicInfo.gpaValue} / {academicInfo.gpaScale}</p>
                  )}
                </div>
              </div>
            )}

            {goals.length > 0 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Цели</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {goals.map((g) => (
                    <span key={g} className="rounded-full bg-paper-dim px-2.5 py-1 text-[11.5px]">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {interests.length > 0 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Интересы</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {interests.map((g) => (
                    <span key={g} className="rounded-full bg-paper-dim px-2.5 py-1 text-[11.5px]">{g}</span>
                  ))}
                </div>
              </div>
            )}

            <Link href="/app/portfolio" className="block rounded-xl border border-line px-3.5 py-2.5 text-center text-[12.5px] font-medium hover:border-ink">Открыть портфолио</Link>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes message-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-appear {
          animation: message-appear 0.3s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .message-appear { animation: none; }
        }
      `}</style>
    </>
  );
}