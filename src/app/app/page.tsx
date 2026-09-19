"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/app/TopBar";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgressRing } from "@/components/common/ProgressRing";
import { ButtonLink } from "@/components/ui/Button";
import { getAccount } from "@/lib/account";
import { getFirstName, getMissingProfileFields, getProfileCompleteness } from "@/lib/profile";
import { useProfile } from "@/hooks/useProfile";
import { useOnlineStatus } from "@/hooks/useApi";
import { useUniversityRecommendations } from "@/hooks/useUniversityRecommendations";
import { useRoadmap } from "@/hooks/useRoadmap";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  FolderInput,
  GraduationCap,
  Lightbulb,
  Map,
  Route,
  Sparkles,
  Target,
  University,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { profile } = useProfile();
  const account = getAccount();
  const isOnline = useOnlineStatus();
  const { recommendations, error, loading } = useUniversityRecommendations();
  const { roadmap, loading: roadmapLoading, updateTaskStatus } = useRoadmap();
  const nextBestAction = roadmap?.next_best_action;

  const merged = useMemo(() => ({
    ...account,
    ...(profile.name ? { name: profile.name } : {}),
    ...(profile.grade ? { grade: profile.grade } : {}),
    ...(profile.location ? { location: profile.location } : {}),
    academicInfo: profile.academicInfo ?? account.academicInfo,
    onboardingCompleted: profile.onboardingCompleted ?? account.onboardingCompleted,
  }), [account, profile]);

  const completeness = getProfileCompleteness(merged);
  const missing = getMissingProfileFields(merged);
  const firstName = getFirstName(merged);
  const incomplete = !merged.onboardingCompleted;

  return (
    <>
      <TopBar title="Главная" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-soft">ULYS / STUDENT</p>
            <p className="mt-3 text-[13px] font-medium text-ink-soft">{firstName ? `Добрый вечер, ${firstName}` : "Добрый вечер"}</p>
            <h1 className="mt-1 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">{incomplete ? "Начни свой маршрут" : "Твой путь поступления"}</h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">Все важные рекомендации, шаги и изменения профиля — в одном месте.</p>
          </div>
          <span className={cn("flex h-2 w-2 rounded-full", isOnline ? "bg-green" : "bg-red")} title={isOnline ? "ULYS онлайн" : "ULYS офлайн"} />
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red">NEXT BEST MOVE</p>
                <h2 className="mt-3 font-display text-[18px] font-semibold">Твой следующий шаг</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red"><Target className="h-5 w-5" /></span>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper-dim/40 p-5">
              {roadmapLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-red" />
                  <span className="text-[13px] text-ink-soft">Загрузка roadmap…</span>
                </div>
              ) : nextBestAction ? (
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red text-white">
                    <Route className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-display text-[16px] font-semibold text-ink">{nextBestAction.title}</h2>
                    {nextBestAction.target_date && (
                      <p className="mt-1 text-[12.5px] text-ink-soft">
                        Срок: {new Date(nextBestAction.target_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{nextBestAction.reason}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => updateTaskStatus(nextBestAction.task_id, "completed")}
                        className="text-[12.5px] font-medium text-red hover:text-red/80"
                      >
                        Отметить выполненной
                      </button>
                      <Link href="/app/roadmap" className="text-[12.5px] font-medium text-ink-soft hover:text-ink">
                        Перейти в Roadmap
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red text-white">
                    <Route className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-display text-[15px] font-semibold">Главный приоритет появится здесь</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      После анализа рекомендаций и roadmap ULYS выделит одно действие, которое важнее всего сделать сейчас.
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-4 ml-12 flex items-center gap-2">
                <div className="h-px flex-1 bg-line" />
                <ArrowRight className="h-4 w-4 text-ink-soft" />
                <div className="h-px flex-1 bg-line" />
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">PROFILE STATUS</p>
                <h2 className="mt-3 font-display text-[18px] font-semibold">Профиль</h2>
                <p className="mt-1 text-[12.5px] text-ink-soft">Полнота данных, а не вероятность поступления.</p>
              </div>
              <ProgressRing value={completeness} label="полнота" size={100} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {missing.length > 0 ? missing.map((item) => (
                <span key={item} className="rounded-full border border-line bg-paper px-3 py-1.5 text-[11.5px] text-ink-soft">{item}</span>
              )) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-dim px-3 py-1.5 text-[11.5px] font-medium text-green"><CheckCircle2 className="h-3.5 w-3.5" /> Основные поля заполнены</span>
              )}
            </div>
            <ButtonLink href={incomplete ? "/onboarding" : "/app/profile"} variant="secondary" className="mt-6">
              Дополнить профиль <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </section>
        </div>

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">UNIVERSITY MATCHES</p>
              <h2 className="mt-3 font-display text-[18px] font-semibold">Подходящие университеты</h2>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-soft">ULYS сравнивает профиль с программами и объясняет, почему каждый вариант оказался в подборке.</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow/15 text-yellow"><GraduationCap className="h-5 w-5" /></span>
          </div>
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-ink-soft">
                <Loader2 className="h-5 w-5 animate-spin text-red" />
                <span>Загрузка рекомендаций…</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red">
                <AlertCircle className="h-5 w-5" />
                <span>Не удалось загрузить рекомендации.</span>
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState
                icon={<University className="h-5 w-5" />}
                title="Твои рекомендации появятся здесь"
                description="ULYS использует профиль, цели и ограничения, чтобы сформировать персональный shortlist. Пока здесь нет сгенерированных данных."
                primaryAction={{ label: incomplete ? "Завершить профиль" : "Смотреть университеты", href: incomplete ? "/onboarding" : "/app/universities" }}
              />
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <div key={`${rec.university_id}-${i}`} className="rounded-xl border border-line bg-white p-4 hover:border-ink/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-[15px] font-semibold truncate">{rec.name}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            rec.category === 'ambitious' ? 'bg-red/10 text-red' :
                            rec.category === 'target' ? 'bg-yellow/10 text-yellow' :
                            'bg-green/10 text-green'
                          }`}>
                            {rec.category === 'ambitious' && 'Амбициозный'}
                            {rec.category === 'target' && 'Целевой'}
                            {rec.category === 'safer' && 'Более безопасный'}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-ink-soft flex items-center gap-2">
                          <span>{rec.city}, {rec.country}</span>
                          <span>•</span>
                          <span>{rec.program || 'Программа'}</span>
                          <span>•</span>
                          <span>Совпадение: {rec.match_score}%</span>
                        </p>
                        {rec.reasons.length > 0 && (
                          <p className="mt-2 text-[12px] text-ink-soft/80">{rec.reasons[0]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/app/roadmap" className="group rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ROADMAP</p>
                <h2 className="mt-3 font-display text-[16px] font-semibold">Roadmap</h2>
                <p className="mt-1 text-[12.5px] text-ink-soft">Экзамены, документы и дедлайны в одной последовательности.</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red group-hover:scale-110 transition-transform"><Map className="h-4 w-4" /></span>
            </div>
            <div className="mt-6">
              {roadmapLoading ? (
                <div className="flex items-center gap-2 text-ink-soft">
                  <Loader2 className="h-4 w-4 animate-spin text-red" />
                  <span className="text-[12.5px]">Загрузка…</span>
                </div>
              ) : roadmap && roadmap.tasks.length > 0 ? (
                <div className="space-y-2">
                  {roadmap.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start gap-2">
                      <span className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", task.status === "completed" ? "bg-green" : task.priority === "high" ? "bg-red" : task.priority === "medium" ? "bg-yellow" : "bg-line")} />
                      <div>
                        <p className="text-[12.5px] font-medium text-ink">{task.title}</p>
                        {task.target_date && (
                          <p className="text-[11px] text-ink-soft">
                            {new Date(task.target_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {roadmap.tasks.length > 3 && (
                    <p className="text-[11.5px] text-ink-soft">+{roadmap.tasks.length - 3} задач</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className="flex items-center gap-2 flex-1">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", i === 0 ? "bg-red" : "bg-line")} />
                        {i < 3 && <div className={cn("h-px flex-1", i === 0 ? "bg-red/30" : "bg-line")} />}
                      </div>
                    ))}
                  </div>
                  <EmptyState
                    icon={<Map className="h-5 w-5" />}
                    title="Твой маршрут ещё не создан"
                    description="После выбора университетов здесь появятся экзамены, документы, дедлайны и следующие шаги."
                    primaryAction={{ label: "Открыть Roadmap", href: "/app/roadmap" }}
                  />
                </>
              )}
            </div>
          </Link>

          <Link href="/app/what-if" className="group rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red">✦ ULYS WHAT-IF</p>
                <h2 className="mt-3 font-display text-[16px] font-semibold">Измени одно решение —<br />увидь, как меняется путь</h2>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow group-hover:scale-110 transition-transform"><Sparkles className="h-4 w-4" /></span>
            </div>
            <div className="mt-5 space-y-2">
              {["IELTS", "SAT", "Бюджет", "Страна"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 max-w-[120px] rounded-full bg-paper-dim">
                    <span className="block h-full rounded-full bg-red/40" style={{ width: "40%" }} />
                  </span>
                  <span className="text-[11px] font-medium text-ink-soft">{label}</span>
                </div>
              ))}
              <div className="flex items-center justify-center py-1">
                <ArrowRight className="h-3.5 w-3.5 text-ink-soft rotate-90" />
              </div>
              {["Рекомендации", "Roadmap", "Следующий шаг"].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 max-w-[120px] rounded-full bg-paper-dim">
                    <span className="block h-full rounded-full bg-yellow/50" style={{ width: "30%" }} />
                  </span>
                  <span className="text-[11px] font-medium text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-red group-hover:text-red/80 transition-colors">
              Попробовать What-If <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/app/ulie" className="group rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">ULIE</p>
                <h2 className="mt-3 font-display text-[16px] font-semibold">✦ Спроси ULIE</h2>
                <p className="mt-1 text-[12.5px] text-ink-soft">AI-помощник будет использовать контекст твоего профиля и маршрута.</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red/10 text-red group-hover:scale-110 transition-transform"><Sparkles className="h-4 w-4" /></span>
            </div>
            <div className="mt-6">
              <ButtonLink href="/app/ulie" variant="secondary" className="text-[12.5px]">Спросить ULIE <ArrowRight className="h-3.5 w-3.5" /></ButtonLink>
            </div>
          </Link>

          <Link href="/app/applications" className="group rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">APPLICATIONS</p>
                <h2 className="mt-3 font-display text-[16px] font-semibold">Заявки</h2>
                <p className="mt-1 text-[12.5px] text-ink-soft">0 активных заявок</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue/15 text-blue group-hover:scale-110 transition-transform"><FolderInput className="h-4 w-4" /></span>
            </div>
            <div className="mt-6">
              <EmptyState
                icon={<FolderInput className="h-5 w-5" />}
                title="Когда ты начнёшь подаваться, здесь появятся статусы, документы и важные действия."
                description=""
                primaryAction={{ label: "Открыть заявки", href: "/app/applications" }}
              />
            </div>
          </Link>
        </div>

        <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-ink p-5 text-paper sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-white"><Lightbulb className="h-4 w-4" /></span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">ULYS PRINCIPLE</p>
                <h2 className="mt-2 font-display text-[16px] font-semibold">Сначала понять профиль. Потом действовать.</h2>
                <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-paper/65">ULYS не выдаёт случайный список университетов. Система связывает профиль, диагностику, варианты, маршрут и следующий шаг.</p>
              </div>
            </div>
            <span className="rounded-full border border-paper/15 px-3 py-1.5 text-[11px] text-paper/70">PROFILE → ROUTE → ACTION</span>
          </div>
        </section>
      </main>
    </>
  );
}
