import { useCallback, useEffect, useState } from "react";
import { UniversityRecommendation } from "@/types";

const SELECTED_KEY = "ulys-compare-selected";

function getSavedSelected(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSelected(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_KEY, JSON.stringify(ids));
}

export function useSelectedUniversities() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getSavedSelected());

  useEffect(() => {
    saveSelected(selectedIds);
  }, [selectedIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const clear = useCallback(() => setSelectedIds([]), []);

  const selectedFromRecommendations = (recommendations: UniversityRecommendation[]) => {
    const map = new Map(recommendations.map((r) => [r.university_id, r]));
    return selectedIds
      .map((id) => map.get(id))
      .filter((r): r is UniversityRecommendation => r !== undefined);
  };

  return { selectedIds, toggle, isSelected, clear, selectedFromRecommendations };
}
