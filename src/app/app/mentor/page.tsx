"use client";

import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { student, suggestedPrompts } from "@/data/student";
import { getAccount } from "@/lib/account";
import { cn } from "@/lib/utils";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useMentorMessages } from "@/hooks/useMentorMessages";
import { useOnlineStatus } from "@/hooks/useApi";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function MentorPage() {
  const [account, setAccount] = useState(student);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const { messages, sending, sendMessage } = useMentorMessages();
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

  return (
    <>
      <TopBar title="AI Mentor" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col px-5 py-6 lg:px-8 lg:py-8">
          {!isOnline && (
            <div className="mb-4 rounded-2xl border border-yellow bg-yellow-dim px-4 py-2.5 text-[12.5px] text-ink">
              Оффлайн-режим. ULIE временно недоступен. Сообщения будут отправлены при подключении.
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line bg-paper-dim/45 px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow text-ink">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-[16px] font-semibold">Начни разговор с ULIE</h2>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">Расскажи о своей цели или выбери подсказку ниже. Здесь появится твой персональный план.</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "prose-sm max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed sm:max-w-[70%]",
                  m.role === "student"
                    ? "ml-auto rounded-tr-sm bg-ink text-paper font-medium"
                    : "mr-auto rounded-tl-sm bg-white border border-line text-ink",
                )}
              >
                {m.role === "mentor" ? (
                  <div className="markdown-content">
                    <MarkdownRenderer content={m.content} />
                  </div>
                ) : (
                  m.content
                )}
                {m.actions && m.role === "mentor" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-paper-dim px-3 py-1.5 text-[12px] font-medium text-ink"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={!isOnline}
                className="rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-center gap-2 rounded-full border border-line bg-white px-2 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder={isOnline ? "Спроси о чём угодно..." : "Оффлайн — отправка недоступна"}
              disabled={!isOnline}
              className="flex-1 bg-transparent px-3 text-[13.5px] outline-none placeholder:text-ink-soft/70 disabled:cursor-not-allowed"
              aria-label="Сообщение AI Mentor"
            />
            <button
              type="submit"
              disabled={!isOnline || sending}
              aria-label="Отправить"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red text-white disabled:opacity-50"
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
              <p className="font-display text-[13.5px] font-semibold">Контекст студента</p>
              <p className="text-[11px] text-ink-soft">ULIE видит это при ответе</p>
            </div>
          </div>

           <div className="mt-5 space-y-4">
             <div>
               <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                 Портфолио
               </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-dim">
                    <div
                      className="h-full rounded-full bg-red"
                      style={{ width: `${profile.portfolioStrength ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[12.5px] font-medium">{profile.portfolioStrength ?? 0}%</span>
                </div>
             </div>

             {(profile.academicInfo ?? account.academicInfo) && (
               <div>
                 <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Академические данные</p>
                 <div className="mt-1.5 space-y-0.5 text-[12.5px]">
                   {(profile.academicInfo ?? account.academicInfo)?.school && (
                     <p><span className="text-ink-soft">Школа:</span> {(profile.academicInfo ?? account.academicInfo)!.school}</p>
                   )}
                   {(profile.academicInfo ?? account.academicInfo)?.intendedMajor && (
                     <p><span className="text-ink-soft">Major:</span> {(profile.academicInfo ?? account.academicInfo)!.intendedMajor}</p>
                   )}
                   {(profile.academicInfo ?? account.academicInfo)?.gpa && (
                     <p><span className="text-ink-soft">GPA:</span> {(profile.academicInfo ?? account.academicInfo)!.gpa} / {(profile.academicInfo ?? account.academicInfo)!.gpaScale}</p>
                   )}
                   {(profile.academicInfo ?? account.academicInfo)?.sat && (
                     <p><span className="text-ink-soft">SAT:</span> {(profile.academicInfo ?? account.academicInfo)!.sat}</p>
                   )}
                   {(profile.academicInfo ?? account.academicInfo)?.ielts && (
                     <p><span className="text-ink-soft">IELTS:</span> {(profile.academicInfo ?? account.academicInfo)!.ielts}</p>
                   )}
                   {(profile.academicInfo ?? account.academicInfo)?.toefl && (
                     <p><span className="text-ink-soft">TOEFL:</span> {(profile.academicInfo ?? account.academicInfo)!.toefl}</p>
                   )}
                 </div>
               </div>
             )}

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Цели</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(profile.goals ?? account.goals ?? []).map((g) => (
                  <span key={g} className="rounded-full bg-paper-dim px-2.5 py-1 text-[11.5px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Интересы
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(profile.interests ?? account.interests ?? []).map((g) => (
                  <span key={g} className="rounded-full bg-paper-dim px-2.5 py-1 text-[11.5px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/app/portfolio"
              className="block rounded-xl border border-line px-3.5 py-2.5 text-center text-[12.5px] font-medium hover:border-ink"
            >
              Открыть портфолио
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
