"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressRing } from "@/components/common/ProgressRing";
import { useRoadmap } from "@/hooks/useRoadmap";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Info,
  Loader2,
  Map,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  AlertCircle,
} from "lucide-react";
import type { TaskCategory, TaskPriority, TaskStatus } from "@/types";

const categoryLabels: Record<TaskCategory, string> = {
  ACADEMICS: "Экзамены",
  LANGUAGE: "Языки",
  UNIVERSITY_RESEARCH: "Исследование вузов",
  APPLICATION: "Заявки",
  ESSAYS: "Эссе",
  DOCUMENTS: "Документы",
  EXTRACURRICULARS: "Внеучебные активности",
};

const categoryIcons: Record<TaskCategory, React.ElementType> = {
  ACADEMICS: Target,
  LANGUAGE: FileText,
  UNIVERSITY_RESEARCH: Info,
  APPLICATION: Clock,
  ESSAYS: FileText,
  DOCUMENTS: FileCheck,
  EXTRACURRICULARS: CheckCircle2,
};

const priorityLabels: Record<TaskPriority, { label: string; icon: React.ElementType }> = {
  high: { label: "Высокий", icon: AlertCircle },
  medium: { label: "Средний", icon: Clock },
  low: { label: "Низкий", icon: CheckCircle2 },
};

function TaskItem({ task, onStatusChange }: {
  task: NonNullable<NonNullable<ReturnType<typeof useRoadmap>["roadmap"]>["tasks"]>[number];
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const Icon = categoryIcons[task.category] || Clock;
  const categoryLabel = categoryLabels[task.category] || task.category;
  const priorityInfo = priorityLabels[task.priority] || { label: task.priority, icon: Clock };
  const PriorityIcon = priorityInfo.icon;

  const handleToggle = () => {
    const nextStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border bg-white p-4 shadow-sm transition-all",
        task.status === "completed"
          ? "border-line bg-paper-dim/30 opacity-75"
          : "border-line hover:border-ink/30 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red/10 text-red">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-display text-[15px] font-semibold", task.status === "completed" ? "text-ink/50 line-through" : "text-ink")}>
                {task.title}
              </h3>
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                task.priority === "high" ? "bg-red/10 text-red" :
                task.priority === "medium" ? "bg-yellow/10 text-yellow" :
                "bg-ink/10 text-ink"
              )}>
                <PriorityIcon className="h-3 w-3" />
                {priorityInfo.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-ink-soft bg-paper-dim">
                {categoryLabel}
              </span>
              {task.status === "completed" && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-green bg-green-dim">
                  <CheckCircle2 className="h-3 w-3" /> Выполнено
                </span>
              )}
            </div>
            {task.description && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                {task.description}
              </p>
            )}
            {task.target_date && (
              <p className="mt-2 text-[11.5px] text-ink-soft flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Срок: {new Date(task.target_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            {task.related_university && (
              <p className="mt-1 text-[11.5px] text-ink-soft">
                Университет: {task.related_university}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
            task.status === "completed"
              ? "border-green bg-green text-white"
              : "border-line bg-white text-ink-soft hover:border-red hover:text-red"
          )}
          aria-label={task.status === "completed" ? "Отметить как не выполненную" : "Отметить выполненной"}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function NextBestActionCard({ action, onComplete }: {
  action: NonNullable<NonNullable<ReturnType<typeof useRoadmap>["roadmap"]>["next_best_action"]>;
  onComplete: () => void;
}) {
  const Icon = Route;

  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper-dim/40 p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red text-white">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-red">СЛЕДУЮЩИЙ ШАГ</p>
          <h2 className="mt-2 font-display text-[18px] font-semibold text-ink">{action.title}</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            {action.reason}
          </p>
          {action.target_date && (
            <p className="mt-2 text-[11.5px] text-ink-soft flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Срок: {new Date(action.target_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          <div className="mt-3 flex gap-3">
            <button
              onClick={onComplete}
              className="text-[12.5px] font-medium text-red hover:text-red/80"
            >
              Отметить выполненной
            </button>
            <Link href={`/app/ulie`}>
              Спросить ULIE
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4 ml-12 flex items-center gap-2">
        <div className="h-px flex-1 bg-line" />
        <ArrowRight className="h-4 w-4 text-ink-soft" />
        <div className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

function Link({ href, children, className }: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn("text-[12.5px] font-medium text-ink-soft hover:text-ink", className)}
    >
      {children}
    </a>
  );
}

export default function RoadmapPage() {
  const { roadmap, loading, error, updateTaskStatus } = useRoadmap();

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTaskStatus(id, status);
  };

  const handleCompleteNba = () => {
    if (roadmap?.next_best_action) {
      updateTaskStatus(roadmap.next_best_action.task_id, "completed");
    }
  };

  const completedCount = useMemo(() => {
    return roadmap?.tasks.filter((t) => t.status === "completed").length || 0;
  }, [roadmap]);

  const totalCount = roadmap?.tasks.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const profileCompleteness = roadmap?.profile_completeness || 0;

  if (loading) {
    return (
      <>
        <TopBar title="Roadmap" />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ТВОЙ МАРШРУТ</p>
              <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
                Персональный Roadmap
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                Экзамены, документы, дедлайны и действия — в одном понятном маршруте.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
              <Map className="h-5 w-5" />
            </span>
          </header>

          <div className="mt-8 flex items-center justify-center gap-2 py-12 text-ink-soft">
            <Loader2 className="h-5 w-5 animate-spin text-red" />
            <span>Загрузка roadmap…</span>
          </div>
        </main>
      </>
    );
  }

  if (error === "unauthorized") {
    return (
      <>
        <TopBar title="Roadmap" />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ТВОЙ МАРШРУТ</p>
              <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
                Персональный Roadmap
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                Экзамены, документы, дедлайны и действия — в одном понятном маршруте.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
              <Map className="h-5 w-5" />
            </span>
          </header>

          <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto">
              <Info className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-[20px] font-semibold">Требуется вход</h2>
            <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
              Войди, чтобы увидеть и редактировать свой roadmap.
            </p>
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title="Roadmap" />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ТВОЙ МАРШРУТ</p>
              <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
                Персональный Roadmap
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                Экзамены, документы, дедлайны и действия — в одном понятном маршруте.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
              <Map className="h-5 w-5" />
            </span>
          </header>

          <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto">
              <AlertCircle className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-[20px] font-semibold">Ошибка загрузки</h2>
            <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
              Не удалось загрузить roadmap. Проверьте подключение и попробуйте позже.
            </p>
          </section>
        </main>
      </>
    );
  }

  if (!roadmap || roadmap.tasks.length === 0) {
    return (
      <>
        <TopBar title="Roadmap" />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ТВОЙ МАРШРУТ</p>
              <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
                Персональный Roadmap
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
                Экзамены, документы, дедлайны и действия — в одном понятном маршруте.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
              <Map className="h-5 w-5" />
            </span>
          </header>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[12.5px] font-medium text-ink-soft">Прогресс маршрута</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-[12px] font-medium text-ink">
                0%
              </span>
            </div>
            <p className="text-[11.5px] text-ink-soft">Маршрут ещё не начат</p>
          </div>

          <section className="mt-6 rounded-[var(--radius-card)] border border-dashed border-line bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10 text-red mx-auto">
              <Map className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-[20px] font-semibold">Твой roadmap ещё не создан</h2>
            <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-soft">
              После выбора университетов ULYS соберёт персональный маршрут с экзаменами, документами, дедлайнами и следующими действиями.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/app/universities" size="md">
                Выбрать университеты <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/app/compare" variant="secondary" className="text-[13px]">
                Сравнить варианты <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </section>
        </main>
      </>
    );
  }

  const tasks = roadmap.tasks;

  return (
    <>
      <TopBar title="Roadmap" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-red">ТВОЙ МАРШРУТ</p>
            <h1 className="mt-3 font-display text-[25px] font-semibold leading-tight sm:text-[30px]">
              Персональный Roadmap
            </h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              Экзамены, документы, дедлайны и действия — в одном понятном маршруте.
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red shrink-0">
            <Map className="h-5 w-5" />
          </span>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12.5px] font-medium text-ink-soft">Прогресс маршрута</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-[12px] font-medium text-ink">
              {progressPercent}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-ink-soft">
              {completedCount} из {totalCount} задач выполнены
            </span>
            <ProgressRing value={progressPercent} label="прогресс" size={84} />
          </div>
        </div>

        <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red">NEXT BEST MOVE</p>
              <h2 className="mt-3 font-display text-[18px] font-semibold">Следующий шаг</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                ULYS выделяет одно действие, которое важнее всего сделать сейчас.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red">
              <Route className="h-5 w-5" />
            </span>
          </div>

          {roadmap.next_best_action && (
            <NextBestActionCard
              action={roadmap.next_best_action}
              onComplete={handleCompleteNba}
            />
          )}
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">
              Все задачи ({tasks.length})
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-ink-soft">
                Полнота профиля: {profileCompleteness}%
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow/15 text-yellow">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">STRATEGY CONNECTION</p>
              <h2 className="mt-1 font-display text-[16px] font-semibold">
                Roadmap меняется вместе с твоей стратегией
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Изменение IELTS, SAT, бюджета, страны или направления может изменить маршрут и следующий шаг.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ButtonLink href="/app/what-if" variant="secondary" className="text-[13px]">
              Проверить в What-If <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/app/ulie" variant="secondary" className="text-[13px]">
              Спросить ULIE <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>
    </>
  );
}
