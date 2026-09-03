import { useCallback, useEffect, useState } from "react";
import { api, isBackendReachable } from "@/lib/api";
import { University } from "@/types";
import { universities as staticUniversities, getUniversityById as getStaticUniversityById } from "@/data/universities";

const UNI_CACHE_KEY = "ulys-universities-cache";

interface UniversitiesCache {
  data: University[];
  fetchedAt: number;
}

function getCached(): University[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(UNI_CACHE_KEY);
    if (!raw) return null;
    const cached: UniversitiesCache = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt < 60 * 60 * 1000) {
      return cached.data;
    }
    return null;
  } catch {
    return null;
  }
}

function setCached(data: University[]) {
  if (typeof window === "undefined") return;
  const cache: UniversitiesCache = { data, fetchedAt: Date.now() };
  window.localStorage.setItem(UNI_CACHE_KEY, JSON.stringify(cache));
}

export function useUniversities() {
  const [data, setData] = useState<University[]>(() => getCached() || staticUniversities);
  const [loading, setLoading] = useState(!getCached());

  const fetchUniversities = useCallback(async () => {
    const reachable = await isBackendReachable();
    if (!reachable) return;

    try {
      setLoading(true);
      const result = await api.get<University[]>("/api/universities");
      setData(result);
      setCached(result);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  return { universities: data, loading, refresh: fetchUniversities };
}

export function useUniversity(id: string | null) {
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const staticUni = getStaticUniversityById(id);
    if (staticUni) setUniversity(staticUni);

    const fetchUniversity = async () => {
      try {
        setLoading(true);
        const result = await api.get<University>(`/api/universities/${id}`);
        setUniversity(result);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  return { university, loading };
}
