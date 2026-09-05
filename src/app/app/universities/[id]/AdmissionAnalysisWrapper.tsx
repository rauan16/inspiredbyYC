"use client";

import { useAdmissionAnalysis } from "@/hooks/useAdmissionAnalysis";
import { AdmissionAnalysisCard } from "@/components/university/AdmissionAnalysisCard";
import { University } from "@/types";

export function AdmissionAnalysisWrapper({ university }: { university: University }) {
  const { analysis, loading, error, refetch } = useAdmissionAnalysis(university.id);

  return (
    <AdmissionAnalysisCard
      universityName={university.name}
      officialAdmissionsUrl={university.officialAdmissionsUrl}
      analysis={analysis}
      loading={loading}
      error={error}
      onRefetch={refetch}
    />
  );
}
