"use client";

import { TopBar } from "@/components/app/TopBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <>
      <TopBar title="Уведомления" />
      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="Пока нет уведомлений"
          description="Здесь будут появляться важные обновления, дедлайны и новые действия."
        />
      </main>
    </>
  );
}
