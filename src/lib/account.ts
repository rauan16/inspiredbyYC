import { student } from "@/data/student";
import { AcademicInfo, MentorMessage, PortfolioEntry, Student } from "@/types";

const ACCOUNT_KEY = "ulys-account";

export type StoredAccount = Student & {
  email?: string;
  portfolioEntries?: PortfolioEntry[];
  mentorMessages?: MentorMessage[];
  savedOpportunityIds?: string[];
  academicInfo?: AcademicInfo;
};

export function getAccount(): StoredAccount {
  if (typeof window === "undefined") return student;

  try {
    const saved = window.localStorage.getItem(ACCOUNT_KEY);
    if (!saved) return student;
    const account = { ...student, ...JSON.parse(saved) };
    if (account.bio === student.bio) account.bio = "";
    return account;
  } catch {
    return student;
  }
}

export function saveAccount(account: Partial<StoredAccount>) {
  if (typeof window === "undefined") return;
  const next = { ...getAccount(), ...account };
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ulys-account-updated"));
}

export function clearAccount() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACCOUNT_KEY);
}
