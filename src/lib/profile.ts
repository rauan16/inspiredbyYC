import type { StoredAccount } from "@/lib/account";

const profileChecks = [
  { label: "Этап обучения", value: (account: StoredAccount) => Boolean(account.grade) },
  { label: "Страна проживания", value: (account: StoredAccount) => Boolean(account.academicInfo?.country || account.location) },
  { label: "Год окончания", value: (account: StoredAccount) => Boolean(account.academicInfo?.graduationYear) },
  { label: "Средний балл", value: (account: StoredAccount) => Boolean(account.academicInfo?.gpaValue != null || account.academicInfo?.gpaUnknown) },
  { label: "Английский язык", value: (account: StoredAccount) => Boolean(account.academicInfo?.englishStatus) },
  { label: "SAT", value: (account: StoredAccount) => Boolean(account.academicInfo?.satStatus) },
  { label: "Направление", value: (account: StoredAccount) => Boolean(account.academicInfo?.primaryField) },
  { label: "Приоритеты", value: (account: StoredAccount) => Boolean(account.academicInfo?.priorities?.length) },
  { label: "Страны обучения", value: (account: StoredAccount) => Boolean(account.academicInfo?.preferredCountries?.length || account.academicInfo?.countriesUndecided) },
  { label: "Бюджет", value: (account: StoredAccount) => Boolean(account.academicInfo?.budgetMax != null || account.academicInfo?.budgetUndecided) },
  { label: "Стипендия", value: (account: StoredAccount) => Boolean(account.academicInfo?.scholarshipPreference) },
  { label: "Язык обучения", value: (account: StoredAccount) => Boolean(account.academicInfo?.studyLanguage) },
  { label: "Год поступления", value: (account: StoredAccount) => Boolean(account.academicInfo?.targetYear) },
  { label: "Период поступления", value: (account: StoredAccount) => Boolean(account.academicInfo?.targetIntake) },
];

export function getProfileCompleteness(account: Partial<StoredAccount> = {}): number {
  const checks = profileChecks as { label: string; value: (account: Partial<StoredAccount>) => boolean }[];
  const complete = checks.filter((check) => check.value(account)).length;
  return Math.round((complete / checks.length) * 100);
}

export function getMissingProfileFields(account: Partial<StoredAccount> = {}, limit = 4): string[] {
  const checks = profileChecks as { label: string; value: (account: Partial<StoredAccount>) => boolean }[];
  return checks.filter((check) => !check.value(account)).map((check) => check.label).slice(0, limit);
}

export function getFirstName(account: Partial<StoredAccount> = {}): string {
  return account.name?.trim().split(/\s+/)[0] || "";
}
