import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { UniversityRecommendation } from "@/types";

export function useUniversityRecommendations() {
  const [recommendations, setRecommendations] = useState<UniversityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<UniversityRecommendation[]>("/api/universities/recommendations");
        if (!cancelled) {
          setRecommendations(data || []);
        }
        } catch (e) {
        if (!cancelled) {
          if (e instanceof Error && (e as { status?: number }).status === 401) {
            setError("unauthorized");
          } else if (e instanceof Error && ((e as { status?: number }).status ?? 0) >= 500) {
            setError("server_error");
          } else {
            setError("failed");
          }
          setRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  return { recommendations, loading, error };
}