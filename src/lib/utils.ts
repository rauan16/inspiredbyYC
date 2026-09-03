import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeadlineType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function getDeadlineLabel(
  deadline: string | null | undefined,
  deadlineType?: DeadlineType,
  now: Date = new Date()
): string {
  if (deadlineType === "rolling") {
    return "Приём заявок открыт";
  }
  if (!deadline) return "Срок не указан";

  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Срок не указан";

  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export type DeadlineStatus = "open" | "closing-soon" | "closed" | "no-deadline";

export function getDeadlineStatus(
  deadline: string | null | undefined,
  deadlineType?: DeadlineType,
  now: Date = new Date()
): DeadlineStatus {
  if (!deadline || deadlineType === "rolling") return "no-deadline";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "no-deadline";
  if (d.getTime() < now.getTime()) return "closed";
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "closing-soon";
  return "open";
}

export function getDeadlineStatusLabel(status: DeadlineStatus): string {
  switch (status) {
    case "open":
      return "Открыто";
    case "closing-soon":
      return "Скоро закрывается";
    case "closed":
      return "Закрыто";
    case "no-deadline":
      return "Без дедлайна";
  }
}

export function isDeadlinePassed(deadline: string | null | undefined, deadlineType?: DeadlineType, now: Date = new Date()): boolean {
  if (!deadline || deadlineType === "rolling") return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < now.getTime();
}
