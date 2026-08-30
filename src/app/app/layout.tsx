"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/app/Sidebar";
import { BottomNav } from "@/components/app/BottomNav";
import { initAuth, getAuthState, subscribeAuth, syncPendingActions } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      await initAuth();
      const state = getAuthState();
      setAuthenticated(state.isAuthenticated);
      setReady(true);
    };
    check();

    const unsub = subscribeAuth(() => {
      setAuthenticated(getAuthState().isAuthenticated);
    });

    const interval = setInterval(async () => {
      if (getAuthState().isAuthenticated) {
        await syncPendingActions();
      }
    }, 60000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-ink-soft">Перенаправление на страницу входа...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper-dim/40">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
