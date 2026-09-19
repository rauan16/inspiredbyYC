import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAccount, normalizeAccount, saveAccount, serializeProfileUpdate, StoredAccount } from "@/lib/account";
import { enqueue } from "@/lib/sync";

const PROFILE_CACHE_KEY = "ulys-profile-cache";

interface ProfileCache {
  profile: Partial<StoredAccount>;
  fetchedAt: number;
}

function getCachedProfile(): Partial<StoredAccount> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const cached: ProfileCache = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt < 5 * 60 * 1000) {
      return cached.profile;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: Partial<StoredAccount>) {
  if (typeof window === "undefined") return;
  const cache: ProfileCache = { profile, fetchedAt: Date.now() };
  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
}

export function useProfile() {
  const [profile, setProfile] = useState<Partial<StoredAccount>>(() => {
    const cached = getCachedProfile();
    return cached || getAccount();
  });
  const [loading, setLoading] = useState(!getCachedProfile());

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const remote = await api.get<Record<string, unknown>>("/api/profile");
      const mapped = normalizeAccount(remote);
      setProfile(mapped);
      setCachedProfile(mapped);
      saveAccount(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<StoredAccount>): Promise<boolean> => {
      const current = getAccount();
      const merged = normalizeAccount({
        ...current,
        ...updates,
        academicInfo: {
          ...current.academicInfo,
          ...(updates.academicInfo ?? {}),
        },
      });
      const payload = serializeProfileUpdate(updates);
      setProfile(merged);
      saveAccount(merged);
      setCachedProfile(merged);

      try {
        const remote = await api.patch<Record<string, unknown>>("/api/profile", payload);
        const mapped = normalizeAccount(remote);
        setProfile(mapped);
        setCachedProfile(mapped);
        saveAccount(mapped);
      } catch {
        enqueue({ type: "profile_update", payload });
      }
      return true;
    },
    []
  );

  return { profile, loading, refresh: fetchProfile, updateProfile };
}
