import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getAccount, saveAccount, StoredAccount } from "@/lib/account";
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
      const mapped: Partial<StoredAccount> = {};

      if (remote.name !== undefined) mapped.name = remote.name as string;
      if (remote.grade !== undefined) mapped.grade = remote.grade as string;
      if (remote.location !== undefined) mapped.location = remote.location as string;
      if (remote.bio !== undefined) mapped.bio = remote.bio as string;
      if (remote.interests !== undefined) mapped.interests = remote.interests as string[];
      if (remote.goals !== undefined) mapped.goals = remote.goals as string[];
      if (remote.portfolioStrength !== undefined) {
        mapped.portfolioStrength = remote.portfolioStrength as number;
      } else if (remote.portfolio_strength !== undefined) {
        mapped.portfolioStrength = remote.portfolio_strength as number;
      }
      if (remote.avatarInitials !== undefined) {
        mapped.avatarInitials = remote.avatarInitials as string;
      } else if (remote.avatar_initials !== undefined) {
        mapped.avatarInitials = remote.avatar_initials as string;
      }
      if (remote.academicInfo !== undefined) {
        mapped.academicInfo = remote.academicInfo as NonNullable<StoredAccount["academicInfo"]>;
      } else if (remote.academic_info !== undefined) {
        mapped.academicInfo = remote.academic_info as NonNullable<StoredAccount["academicInfo"]>;
      }

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
    async (updates: Partial<StoredAccount>) => {
      const current = getAccount();
      const merged = { ...current, ...updates };
      setProfile(merged);
      saveAccount(updates);
      setCachedProfile(merged);

      try {
        const remote = await api.patch<Partial<StoredAccount>>("/api/profile", updates);
        setProfile(remote);
        setCachedProfile(remote);
        saveAccount(remote);
      } catch {
        enqueue({ type: "profile_update", payload: updates });
      }
    },
    []
  );

  return { profile, loading, refresh: fetchProfile, updateProfile };
}
