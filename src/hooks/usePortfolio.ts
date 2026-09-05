import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PortfolioEntry } from "@/types";
import { enqueue } from "@/lib/sync";
import { getAccount, saveAccount } from "@/lib/account";

export function usePortfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const syncToAccount = useCallback((updatedEntries: PortfolioEntry[]) => {
    const account = getAccount();
    saveAccount({ ...account, portfolioEntries: updatedEntries });
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<PortfolioEntry[]>("/api/portfolio");
      setEntries(data);
      syncToAccount(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [syncToAccount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPortfolio();
  }, [fetchPortfolio]);

  const createEntry = useCallback(
    async (entry: Omit<PortfolioEntry, "id">) => {
      const tempId = `temp-${Date.now()}`;
      const tempEntry: PortfolioEntry = { ...entry, id: tempId };
      setEntries((prev) => [...prev, tempEntry]);
      syncToAccount([...entries, tempEntry]);

      try {
        const created = await api.post<PortfolioEntry>("/api/portfolio", entry);
        setEntries((prev) => prev.map((e) => (e.id === tempId ? created : e)));
        syncToAccount([...entries.map((e) => (e.id === tempId ? created : e))]);
        return created;
      } catch {
        enqueue({ type: "portfolio_create", payload: { ...entry, tempId } });
        return tempEntry;
      }
    },
    [entries, syncToAccount]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<PortfolioEntry>) => {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      const updatedEntries = entries.map((e) => (e.id === id ? { ...e, ...updates } : e));
      syncToAccount(updatedEntries);

      try {
        const updated = await api.patch<PortfolioEntry>(`/api/portfolio/${id}`, updates);
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        syncToAccount(entries.map((e) => (e.id === id ? updated : e)));
        return updated;
      } catch {
        enqueue({ type: "portfolio_update", id, payload: updates });
      }
    },
    [entries, syncToAccount]
  );

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    syncToAccount(entries.filter((e) => e.id !== id));

    try {
      await api.delete(`/api/portfolio/${id}`);
    } catch {
      enqueue({ type: "portfolio_delete", id });
    }
  }, [entries, syncToAccount]);

  const reorder = useCallback(async (newEntries: PortfolioEntry[]) => {
    const previous = entries;
    setEntries(newEntries);
    syncToAccount(newEntries);

    const items = newEntries.map((e, idx) => ({ id: e.id, sort_order: idx }));

    try {
      await api.post("/api/portfolio/reorder", { items });
    } catch {
      setEntries(previous);
      syncToAccount(previous);
      enqueue({ type: "portfolio_reorder", items });
    }
  }, [entries, syncToAccount]);

  return { entries, loading, refresh: fetchPortfolio, createEntry, updateEntry, deleteEntry, reorder };
}
