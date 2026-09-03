import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Opportunity,
  OpportunityCategory,
  OpportunityFormat,
  OpportunityStatus,
  VerificationStatus,
  DeadlineType,
} from "@/types";

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

function safeString(val: unknown): string {
  return typeof val === "string" ? val : val === null || val === undefined ? "" : String(val);
}

function safeStringOrNull(val: unknown): string | null {
  return typeof val === "string" ? val : val === null || val === undefined ? null : String(val);
}

function safeStringOpt(val: unknown): string | undefined {
  return typeof val === "string" ? val : val === null || val === undefined ? undefined : String(val);
}

function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapApiOpportunity(raw: Record<string, unknown>): Opportunity {
  return {
    id: safeString(raw.id),
    title: safeString(raw.title),
    organization: safeString(raw.organization),
    category: safeString(raw.category) as OpportunityCategory,
    categoryLabel: safeString(raw.categoryLabel ?? raw.category_label),
    deadline: raw.deadline ? String(raw.deadline) : "",
    deadlineType: (raw.deadlineType ?? raw.deadline_type ?? "date") as DeadlineType,
    eventDate: safeStringOpt(raw.eventDate ?? raw.event_date),
    location: safeString(raw.location),
    format: safeString(raw.format) as OpportunityFormat,
    eligibility: safeString(raw.eligibility),
    ageGrade: safeStringOpt(raw.ageGrade ?? raw.age_grade),
    description: safeString(raw.description),
    requirements: safeArray(raw.requirements),
    timeline: safeArray(raw.timeline).map((t) => {
      try {
        return typeof t === "string" ? JSON.parse(t) : (t as { label: string; date: string });
      } catch {
        return { label: String(t), date: "" };
      }
    }),
    color: safeString(raw.color),
    website: safeString(raw.website),
    recommended: Boolean(raw.recommended),
    recommendationReason: safeStringOpt(raw.recommendationReason ?? raw.recommendation_reason),
    saved: Boolean(raw.saved),
    status: String(raw.status ?? "active") as OpportunityStatus,
    verificationStatus: String(
      raw.verificationStatus ?? raw.verification_status ?? "verified"
    ) as VerificationStatus,
    verified: Boolean(raw.verified),
    officialSourceUrl: String(raw.officialSourceUrl ?? raw.official_source_url ?? ""),
    applicationUrl: safeStringOpt(raw.applicationUrl ?? raw.application_url),
    lastVerifiedAt: String(raw.lastVerifiedAt ?? raw.last_verified_at ?? ""),
    tags: safeArray(raw.tags),
    relevantSubjects: safeArray(raw.relevantSubjects ?? raw.relevant_subjects),
    targetUserTypes: safeArray(raw.targetUserTypes ?? raw.target_user_types),
    isFree: Boolean(raw.isFree ?? raw.is_free ?? true),
  };
}

export function useOpportunities(params?: { category?: string; format?: string; search?: string }) {
  const category = params?.category;
  const format = params?.format;
  const search = params?.search;

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getCached() || []);
  const [loading, setLoading] = useState(!getCached());
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams = new URLSearchParams();
      if (category && category !== "all") searchParams.set("category", category);
      if (format && format !== "all") searchParams.set("format", format);
      if (search) searchParams.set("search", search);
      const qs = searchParams.toString();
      const rawData = await api.get<Record<string, unknown>[]>(
        `/api/opportunities${qs ? `?${qs}` : ""}`
      );
      const mapped = rawData.map(mapApiOpportunity);
      setOpportunities(mapped);
      setError(null);
      if (!qs) setCached(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  }, [category, format, search]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, error, refresh: fetchOpportunities };
}

export function useOpportunity(id: string | null) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchOpp = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await api.get<Record<string, unknown>>(`/api/opportunities/${id}`);
        setOpportunity(mapApiOpportunity(raw));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch opportunity");
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id]);

  return { opportunity, loading, error };
}
