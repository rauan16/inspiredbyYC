import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/health`,
          { method: "GET" }
        );
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    const handleOnline = () => check();
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

export function useApiData<T>(
  path: string,
  fallback: T,
  opts = { enabled: true }
): { data: T; loading: boolean; refresh: () => Promise<void> } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!opts.enabled) {
      setLoading(false);
      return;
    }
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [path, opts.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}
