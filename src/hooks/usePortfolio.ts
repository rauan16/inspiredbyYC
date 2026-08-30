import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PortfolioEntry } from "@/types";
import { enqueue } from "@/lib/sync";

export function usePortfolio() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<PortfolioEntry[]>("/api/portfolio");
      setEntries(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const createEntry = useCallback(
    async (entry: Omit<PortfolioEntry, "id">) => {
      const tempId = `temp-${Date.now()}`;
      const tempEntry: PortfolioEntry = { ...entry, id: tempId };
      setEntries((prev) => [...prev, tempEntry]);

      try {
        const created = await api.post<PortfolioEntry>("/api/portfolio", entry);
        setEntries((prev) => prev.map((e) => (e.id === tempId ? created : e)));
        return created;
      } catch {
        enqueue({ type: "portfolio_create", payload: { ...entry, tempId } });
        return tempEntry;
      }
    },
    []
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<PortfolioEntry>) => {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

      try {
        const updated = await api.patch<PortfolioEntry>(`/api/portfolio/${id}`, updates);
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        return updated;
      } catch {
        enqueue({ type: "portfolio_update", id, payload: updates });
      }
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));

    try {
      await api.delete(`/api/portfolio/${id}`);
    } catch {
      enqueue({ type: "portfolio_delete", id });
    }
  }, []);

  const reorder = useCallback(async (newEntries: PortfolioEntry[]) => {
    const previous = entries;
    setEntries(newEntries);

    const items = newEntries.map((e, idx) => ({ id: e.id, sort_order: idx }));

    try {
      await api.post("/api/portfolio/reorder", { items });
    } catch {
      setEntries(previous);
      enqueue({ type: "portfolio_reorder", items });
    }
  }, [entries]);

  return { entries, loading, refresh: fetchPortfolio, createEntry, updateEntry, deleteEntry, reorder };
}
