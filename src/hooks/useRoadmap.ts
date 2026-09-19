import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoadmapResponse, TaskStatus } from "@/types";

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<RoadmapResponse>("/api/roadmap");
      setRoadmap(data);
    } catch (e) {
      if (e instanceof Error && (e as { status?: number }).status === 401) {
        setError("unauthorized");
      } else {
        setError("failed");
      }
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus): Promise<boolean> => {
      try {
        await api.patch<{ id: string; status: string; updated: boolean }>(
          `/api/roadmap/tasks/${taskId}`,
          { status }
        );

        setRoadmap((prev) => {
          if (!prev) return prev;
          const updatedTasks = prev.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          );
          return {
            ...prev,
            tasks: updatedTasks,
            next_best_action: prev.next_best_action
              ? { ...prev.next_best_action, completed: status === "completed" ? true : prev.next_best_action.completed }
              : prev.next_best_action,
          };
        });

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  return { roadmap, loading, error, refresh: fetchRoadmap, updateTaskStatus };
}
