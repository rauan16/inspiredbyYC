import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Opportunity } from "@/types";
import { enqueue } from "@/lib/sync";

export function useSavedOpportunities() {
  const [saved, setSaved] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Opportunity[]>("/api/saved-opportunities");
      setSaved(data);
      setSavedIds(data.map((o) => o.id));
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = useCallback(
    async (opportunity: Opportunity) => {
      const isSaved = savedIds.includes(opportunity.id);

      if (isSaved) {
        setSaved((prev) => prev.filter((o) => o.id !== opportunity.id));
        setSavedIds((prev) => prev.filter((id) => id !== opportunity.id));
      } else {
        setSaved((prev) => [...prev, opportunity]);
        setSavedIds((prev) => [...prev, opportunity.id]);
      }

      try {
        if (isSaved) {
          await api.delete(`/api/saved-opportunities/${opportunity.id}`);
        } else {
          await api.post("/api/saved-opportunities", { opportunity_id: opportunity.id });
        }
      } catch {
        if (isSaved) {
          setSaved((prev) => [...prev, opportunity]);
          setSavedIds((prev) => [...prev, opportunity.id]);
          enqueue({ type: "saved_unsave", opportunity_id: opportunity.id });
        } else {
          setSaved((prev) => prev.filter((o) => o.id !== opportunity.id));
          setSavedIds((prev) => prev.filter((id) => id !== opportunity.id));
          enqueue({ type: "saved_save", opportunity_id: opportunity.id });
        }
      }
    },
    [savedIds]
  );

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  return { saved, savedIds, loading, refresh: fetchSaved, toggleSave, isSaved };
}
