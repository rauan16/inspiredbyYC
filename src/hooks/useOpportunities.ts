import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Opportunity } from "@/types";

const OPP_CACHE_KEY = "ulys-opportunities-cache";

interface OpportunitiesCache {
  data: Opportunity[];
  fetchedAt: number;
}

function getCached(): Opportunity[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OPP_CACHE_KEY);
    if (!raw) return null;
    const cached: OpportunitiesCache = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
      return cached.data;
    }
    return null;
  } catch {
    return null;
  }
}

function setCached(data: Opportunity[]) {
  if (typeof window === "undefined") return;
  const cache: OpportunitiesCache = { data, fetchedAt: Date.now() };
  window.localStorage.setItem(OPP_CACHE_KEY, JSON.stringify(cache));
}

export function useOpportunities(params?: { category?: string; format?: string; search?: string }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getCached() || []);
  const [loading, setLoading] = useState(!getCached());

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== "all") searchParams.set("category", params.category);
      if (params?.format && params.format !== "all") searchParams.set("format", params.format);
      if (params?.search) searchParams.set("search", params.search);
      const qs = searchParams.toString();
      const data = await api.get<Opportunity[]>(`/api/opportunities${qs ? `?${qs}` : ""}`);
      setOpportunities(data);
      if (!qs) setCached(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [params?.category, params?.format, params?.search]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, refresh: fetchOpportunities };
}

export function useOpportunity(id: string | null) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchOpp = async () => {
      try {
        setLoading(true);
        const data = await api.get<Opportunity>(`/api/opportunities/${id}`);
        setOpportunity(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id]);

  return { opportunity, loading };
}
