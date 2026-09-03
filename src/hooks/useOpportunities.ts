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
  const category = params?.category;
  const format = params?.format;
  const search = params?.search;

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getCached() || []);
  const [loading, setLoading] = useState(!getCached());

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (category && category !== "all") searchParams.set("category", category);
      if (format && format !== "all") searchParams.set("format", format);
      if (search) searchParams.set("search", search);
      const qs = searchParams.toString();
      const data = await api.get<Opportunity[]>(`/api/opportunities${qs ? `?${qs}` : ""}`);
      setOpportunities(data);
      if (!qs) setCached(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [category, format, search]);

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
