import { AcademicInfo, MentorMessage, PortfolioEntry, Student } from "@/types";

const ACCOUNT_KEY = "ulys-account";

const emptyAcademicInfo: AcademicInfo = {};

const emptyAccount: Student = {
  name: "",
  grade: "",
  location: "",
  bio: "",
  interests: [],
  goals: [],
  avatarInitials: "",
  academicInfo: emptyAcademicInfo,
};

export type StoredAccount = Student & {
  email?: string;
  portfolioEntries?: PortfolioEntry[];
  mentorMessages?: MentorMessage[];
  savedOpportunityIds?: string[];
  academicInfo?: AcademicInfo;
  onboardingCompleted?: boolean;
};

type AccountInput = Partial<StoredAccount> & {
  academic_info?: AcademicInfo | string | null;
  onboarding_completed?: boolean | number | null;
};

function parseAcademicInfo(value: unknown): AcademicInfo {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" ? value as AcademicInfo : {};
}

export function normalizeAccount(input: AccountInput = {}): StoredAccount {
  const academicInfo = parseAcademicInfo(input.academicInfo ?? input.academic_info);
  const onboardingCompleted = input.onboardingCompleted ?? input.onboarding_completed ?? academicInfo.onboardingCompleted ?? false;
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const goals = Array.isArray(input.goals) ? input.goals : [];

  return {
    ...emptyAccount,
    ...input,
    name: typeof input.name === "string" ? input.name : "",
    grade: typeof input.grade === "string" ? input.grade : "",
    location: typeof input.location === "string" ? input.location : "",
    bio: typeof input.bio === "string" ? input.bio : "",
    avatarInitials: typeof input.avatarInitials === "string" ? input.avatarInitials : "",
    interests,
    goals,
    academicInfo,
    onboardingCompleted: Boolean(onboardingCompleted),
  };
}

export function getAccount(): StoredAccount {
  if (typeof window === "undefined") return normalizeAccount();

  try {
    const saved = window.localStorage.getItem(ACCOUNT_KEY);
    if (!saved) return normalizeAccount();
    return normalizeAccount(JSON.parse(saved));
  } catch {
    return normalizeAccount();
  }
}

export function saveAccount(account: Partial<StoredAccount> & AccountInput = {}) {
  if (typeof window === "undefined") return;
  const current = getAccount();
  const next = normalizeAccount({
    ...current,
    ...account,
    academicInfo: {
      ...current.academicInfo,
      ...(account.academicInfo ?? parseAcademicInfo(account.academic_info)),
    },
  });
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ulys-account-updated"));
}

export function clearAccount() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACCOUNT_KEY);
}

export function serializeProfileUpdate(updates: Partial<StoredAccount>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.grade !== undefined) payload.grade = updates.grade;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.interests !== undefined) payload.interests = updates.interests;
  if (updates.goals !== undefined) payload.goals = updates.goals;
  if (updates.portfolioStrength !== undefined) payload.portfolio_strength = updates.portfolioStrength;
  if (updates.avatarInitials !== undefined) payload.avatar_initials = updates.avatarInitials;
  if (updates.academicInfo !== undefined) payload.academic_info = updates.academicInfo;
  if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
  return payload;
}
