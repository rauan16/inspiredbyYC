import { useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";
import { getAccount, saveAccount, StoredAccount } from "@/lib/account";
import { getPendingActions, clearQueue } from "@/lib/sync";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
}

let globalState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isOnline: true,
  pendingSyncCount: 0,
};

const listeners = new Set<() => void>();

function setState(partial: Partial<AuthState>) {
  globalState = { ...globalState, ...partial };
  listeners.forEach((l) => l());
}

export function getAuthState(): AuthState {
  return globalState;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useAuthState(): AuthState {
  const [state, setLocal] = useState<AuthState>(globalState);
  useEffect(() => {
    setLocal(globalState);
    return subscribeAuth(() => setLocal({ ...globalState }));
  }, []);
  return state;
}

export async function initAuth() {
  const token = getToken();
  if (!token) {
    setState({ isAuthenticated: false, isLoading: false });
    return;
  }
  try {
    await api.get("/api/auth/me");
    setState({ isAuthenticated: true, isLoading: false });
  } catch {
    setState({ isAuthenticated: false, isLoading: false });
  }
}

export async function login(email: string, password: string) {
  const res = await api.post<{ access_token: string }>(
    "/api/auth/login",
    { email, password },
    { auth: false }
  );
  setToken(res.access_token);
  setState({ isAuthenticated: true });
  await syncPendingActions();
}

export async function signup(email: string, password: string, name: string) {
  const res = await api.post<{ access_token: string }>(
    "/api/auth/signup",
    { email, password, name },
    { auth: false }
  );
  setToken(res.access_token);
  setState({ isAuthenticated: true });
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch {
  }
  setToken(null);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("ulys-account");
  }
  setState({ isAuthenticated: false });
}

export async function checkOnline(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/health`,
      { method: "GET" }
    );
    const online = res.ok;
    setState({ isOnline: online });
    return online;
  } catch {
    setState({ isOnline: false });
    return false;
  }
}

export async function syncPendingActions() {
  const token = getToken();
  if (!token) return;

  const actions = getPendingActions();
  if (actions.length === 0) return;

  const profilePayload: Record<string, unknown> = {};
  const portfolioCreates: Record<string, unknown>[] = [];
  const portfolioUpdates: { id: string; deleted?: boolean }[] = [];
  let portfolioReorder: { id: string; sort_order: number }[] | undefined = undefined;
  const savedOps: { opportunity_id: string; saved: boolean }[] = [];

  for (const action of actions) {
    switch (action.type) {
      case "profile_update":
        Object.assign(profilePayload, action.payload);
        break;
      case "portfolio_create": {
        const { tempId: _tempId, ...payload } = action.payload;
        portfolioCreates.push(payload);
        break;
      }
      case "portfolio_update":
        portfolioUpdates.push({ id: action.id, ...action.payload });
        break;
      case "portfolio_delete":
        portfolioUpdates.push({ id: action.id, deleted: true });
        break;
      case "portfolio_reorder":
        portfolioReorder = action.items;
        break;
      case "saved_save":
        savedOps.push({ opportunity_id: action.opportunity_id, saved: true });
        break;
      case "saved_unsave":
        savedOps.push({ opportunity_id: action.opportunity_id, saved: false });
        break;
    }
  }

  try {
    await api.post("/api/sync", {
      profile: Object.keys(profilePayload).length ? profilePayload : undefined,
      portfolio_creates: portfolioCreates.length ? portfolioCreates : undefined,
      portfolio: portfolioUpdates.length ? portfolioUpdates : undefined,
      portfolio_reorder: portfolioReorder,
      saved_opportunities: savedOps.length ? savedOps : undefined,
    });
    clearQueue();
    setState({ pendingSyncCount: 0 });
    await refreshLocalData();
  } catch {
  }
}

export async function refreshLocalData() {
  const token = getToken();
  if (!token) return;

  try {
    const profile = await api.get<Partial<StoredAccount>>("/api/profile");
    if (profile) {
      saveAccount(profile);
    }
  } catch {
  }

  try {
    const portfolio = await api.get<StoredAccount["portfolioEntries"]>("/api/portfolio");
    if (portfolio) {
      const account = getAccount();
      saveAccount({ ...account, portfolioEntries: portfolio });
    }
  } catch {
  }

  try {
    const saved = await api.get<{ opportunity_id: string }[]>("/api/saved-opportunities");
    if (saved) {
      const account = getAccount();
      saveAccount({ ...account, savedOpportunityIds: saved.map((s) => s.opportunity_id) });
    }
  } catch {
  }
}
