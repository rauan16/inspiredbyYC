import { useCallback, useEffect, useState } from "react";
import { api, isBackendReachable } from "@/lib/api";
import { AdmissionAnalysis } from "@/types";

interface UseAdmissionAnalysisResult {
  analysis: AdmissionAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdmissionAnalysis(
  universityId: string | null,
): UseAdmissionAnalysisResult {
  const [analysis, setAnalysis] = useState<AdmissionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!universityId) return;

    setError(null);
    setLoading(true);
    try {
      const result = await api.get<AdmissionAnalysis>(`/api/universities/${universityId}/analysis`);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [universityId]);

  useEffect(() => {
    const load = async () => {
      const reachable = await isBackendReachable();
      if (!reachable) {
        setError("Backend unavailable");
        return;
      }
      fetchAnalysis();
    };

    if (universityId) load();
  }, [fetchAnalysis, universityId]);

  return { analysis, loading, error, refetch: fetchAnalysis };
}
