import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeadlineType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function getDeadlineLabel(
  deadline: string,
  deadlineType: DeadlineType,
  now: Date = new Date()
): string {
  if (deadlineType === "rolling") {
    return "Приём заявок открыт";
  }
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Срок не указан";

  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Дедлайн прошёл";
  if (diffDays === 0) return "Сегодня";
  return `${diffDays} дней осталось`;
}

export function isDeadlinePassed(deadline: string, deadlineType: DeadlineType, now: Date = new Date()): boolean {
  if (deadlineType === "rolling") return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < now.getTime();
}
