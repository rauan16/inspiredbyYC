"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { student } from "@/data/student";
import { getAccount } from "@/lib/account";
import { PortfolioEntry } from "@/types";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePortfolio } from "@/hooks/usePortfolio";

const sectionOrder: PortfolioEntry["section"][] = [
  "education",
  "achievements",
  "projects",
  "competitions",
  "volunteering",
  "leadership",
  "certificates",
  "skills",
  "interests",
];

const sectionLabels: Record<PortfolioEntry["section"], string> = {
  education: "Образование",
  achievements: "Достижения",
  projects: "Проекты",
  competitions: "Конкурсы",
  volunteering: "Волонтёрство",
  leadership: "Лидерство",
  certificates: "Сертификаты",
  skills: "Навыки",
  interests: "Интересы",
};

const recommendations = [
  "Добавь ещё один проект с измеримым результатом",
  "Опиши свою роль в лидерском опыте подробнее",
  "Добавь короткий раздел «О себе»",
];

export default function PortfolioPage() {
  const [account, setAccount] = useState(student);
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dialogSection, setDialogSection] = useState<PortfolioEntry["section"] | null>(null);
  const [editing, setEditing] = useState<PortfolioEntry | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", date: "", description: "" });

  const { profile, updateProfile } = useProfile();
  const { entries, loading, createEntry, updateEntry, deleteEntry, reorder } = usePortfolio();

  useEffect(() => {
    setAccount(getAccount());
  }, []);

  const strength = useMemo(() => {
    const filledSections = new Set(entries.map((e) => e.section)).size;
    return Math.min(100, Math.round((filledSections / sectionOrder.length) * 100));
  }, [entries]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openAdd(section: PortfolioEntry["section"]) {
    setEditing(null);
    setForm({ title: "", subtitle: "", date: "", description: "" });
    setDialogSection(section);
  }

  function openEdit(entry: PortfolioEntry) {
    setEditing(entry);
    setForm({
      title: entry.title,
      subtitle: entry.subtitle ?? "",
      date: entry.date ?? "",
      description: entry.description ?? "",
    });
    setDialogSection(entry.section);
  }

  async function saveEntry() {
    if (!dialogSection || !form.title.trim()) return;
    if (editing) {
      await updateEntry(editing.id, { ...form, section: dialogSection });
      showToast("Запись обновлена");
    } else {
      await createEntry({ ...form, section: dialogSection });
      showToast("Запись добавлена");
    }
    setDialogSection(null);
    updateProfile({ portfolioStrength: Math.min(100, Math.round((new Set(entries.map((e) => e.section)).size / sectionOrder.length) * 100)) });
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    showToast("Запись удалена");
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = entries.findIndex((e) => e.id === id);
    const target = idx + dir;
    if (target < 0 || target >= entries.length) return;
    const copy = [...entries];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    await reorder(copy);
  }

  return (
    <>
      <TopBar title="Портфолио" />
      <div className="flex-1 space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red font-display text-[13px] font-semibold text-white">
                {account.avatarInitials}
              </span>
              <div>
                <p className="font-display text-[15px] font-semibold">{account.name}</p>
                <p className="text-[12px] text-ink-soft">{account.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] font-medium hover:border-ink"
              >
                <Eye className="h-4 w-4" /> {previewMode ? "Режим редактирования" : "Предпросмотр"}
              </button>
              <button
                onClick={() => showToast("Портфолио экспортировано (демо)")}
                className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12.5px] font-medium text-paper hover:bg-red"
              >
                <Download className="h-4 w-4" /> Экспорт
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-dim">
              <div className="h-full rounded-full bg-red" style={{ width: `${strength}%` }} />
            </div>
            <span className="font-display text-[14px] font-bold">{strength}%</span>
          </div>

          {!previewMode && (
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendations.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-yellow-dim px-3 py-1.5 text-[12px] font-medium text-ink"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {sectionOrder.map((section) => {
              const items = entries.filter((e) => e.section === section);
              return (
                <section key={section}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-[15px] font-semibold">
                      {sectionLabels[section]}
                    </h2>
                    {!previewMode && (
                      <button
                        onClick={() => openAdd(section)}
                        className="flex items-center gap-1 text-[12.5px] font-medium text-ink-soft hover:text-ink"
                      >
                        <Plus className="h-3.5 w-3.5" /> Добавить
                      </button>
                    )}
                  </div>

                  {items.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {items.map((e, i) => (
                        <li
                          key={e.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-medium">{e.title}</p>
                            {e.subtitle && (
                              <p className="text-[12px] text-ink-soft">{e.subtitle}</p>
                            )}
                            {e.date && <p className="text-[11px] text-ink-soft">{e.date}</p>}
                            {e.description && (
                              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                                {e.description}
                              </p>
                            )}
                          </div>
                          {!previewMode && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                onClick={() => move(e.id, -1)}
                                disabled={i === 0}
                                aria-label="Переместить выше"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-paper-dim disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => move(e.id, 1)}
                                disabled={i === items.length - 1}
                                aria-label="Переместить ниже"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-paper-dim disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openEdit(e)}
                                aria-label="Редактировать"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-paper-dim"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(e.id)}
                                aria-label="Удалить"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-red hover:bg-red-dim"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !previewMode && (
                      <button
                        onClick={() => openAdd(section)}
                        className="mt-3 flex w-full items-center justify-center rounded-xl border border-dashed border-line py-4 text-[12.5px] text-ink-soft hover:border-ink hover:text-ink"
                      >
                        Добавить в «{sectionLabels[section]}»
                      </button>
                    )
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <Dialog.Root open={!!dialogSection} onOpenChange={(o) => !o && setDialogSection(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] bg-white p-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-display text-[16px] font-semibold">
                {editing ? "Редактировать запись" : "Новая запись"}
                {dialogSection && (
                  <span className="ml-2 text-[12px] font-normal text-ink-soft">
                    · {sectionLabels[dialogSection]}
                  </span>
                )}
              </Dialog.Title>
              <Dialog.Close aria-label="Закрыть" className="text-ink-soft hover:text-ink">
                <X className="h-4.5 w-4.5" />
              </Dialog.Close>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Название"
                className="h-11 rounded-xl border border-line px-3.5 text-[14px] outline-none focus:border-ink"
              />
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Подзаголовок (необязательно)"
                className="h-11 rounded-xl border border-line px-3.5 text-[14px] outline-none focus:border-ink"
              />
              <input
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="Дата (например, 2026)"
                className="h-11 rounded-xl border border-line px-3.5 text-[14px] outline-none focus:border-ink"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Описание (необязательно)"
                className="min-h-[80px] rounded-xl border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close className="rounded-full border border-line px-4 py-2 text-[13px] font-medium hover:border-ink">
                Отмена
              </Dialog.Close>
              <button
                onClick={saveEntry}
                className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:bg-red"
              >
                Сохранить
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-[13px] text-paper shadow-lg lg:bottom-8"
          )}
        >
          {toast}
        </div>
      )}
    </>
  );
}
