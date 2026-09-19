import logging
import re
from typing import Optional
from dataclasses import dataclass
from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class StudentMatchingProfile:
    gpa: Optional[float] = None
    gpa_scale: Optional[str] = None
    sat: Optional[int] = None
    act: Optional[int] = None
    ielts: Optional[float] = None
    toefl: Optional[int] = None
    intended_major: Optional[str] = None
    preferred_countries: list[str] = None
    budget_max: Optional[int] = None
    budget_currency: Optional[str] = None
    achievements: list[str] = None
    extracurriculars: list[str] = None

    def __post_init__(self):
        if self.preferred_countries is None:
            self.preferred_countries = []
        if self.achievements is None:
            self.achievements = []
        if self.extracurriculars is None:
            self.extracurriculars = []


@dataclass
class UniversityMatch:
    university_id: str
    name: str
    country: str
    city: str
    program: str
    match_score: int
    category: str
    reasons: list[str]
    strengths: list[str]
    gaps: list[str]
    next_actions: list[str]


def normalize_student_profile(profile: dict, portfolio: list[dict]) -> StudentMatchingProfile:
    academic = profile.get("academicInfo") or {}
    
    preferred_countries = []
    if academic.get("preferredCountries"):
        preferred_countries = [c.lower() for c in academic["preferredCountries"]]
    
    budget_max = academic.get("budgetMax")
    budget_currency = academic.get("budgetCurrency")
    
    achievements = []
    extracurriculars = []
    for item in portfolio:
        section = item.get("section", "").lower()
        title = item.get("title", "")
        desc = item.get("description", "")
        text = f"{title} {desc}".lower()
        
        if section in ("achievements", "competitions", "certificates"):
            achievements.append(title)
        if section in ("projects", "volunteering", "leadership", "interests", "internships"):
            extracurriculars.append(title)
    
    return StudentMatchingProfile(
        gpa=academic.get("gpaValue") or academic.get("gpa"),
        gpa_scale=academic.get("gpaScale"),
        sat=academic.get("satScore") or academic.get("sat"),
        act=academic.get("actScore") or academic.get("act"),
        ielts=academic.get("englishScore") if academic.get("englishTest") == "IELTS" else academic.get("ielts"),
        toefl=academic.get("englishScore") if academic.get("englishTest") == "TOEFL" else academic.get("toefl"),
        intended_major=academic.get("intendedMajor") or academic.get("primaryField"),
        preferred_countries=preferred_countries,
        budget_max=budget_max,
        budget_currency=budget_currency,
        achievements=achievements,
        extracurriculars=extracurriculars,
    )


def parse_tuition_range(tuition_str: str) -> Optional[tuple[int, int]]:
    if not tuition_str:
        return None
    import re
    numbers = re.findall(r'[\d,]+', tuition_str.replace(',', ''))
    if len(numbers) >= 2:
        return (int(numbers[0]), int(numbers[1]))
    elif len(numbers) == 1:
        val = int(numbers[0])
        return (val, val)
    return None


def extract_sat_target(sat_req: str) -> Optional[int]:
    """Extract target SAT score from requirements string."""
    if not sat_req:
        return None
    sat_req = sat_req.lower()
    # Look for patterns like "SAT 1350+", "SAT 1400+", "1500+", etc.
    matches = re.findall(r'(?:sat\s*)?(\d{4})\s*[\+\-]', sat_req)
    if matches:
        return max(int(m) for m in matches)
    # Also check for standalone 4-digit numbers that could be SAT scores
    matches = re.findall(r'\b(1[3-5]\d{2})\b', sat_req)
    if matches:
        return max(int(m) for m in matches)
    return None


def extract_ielts_target(lang_req: str) -> Optional[float]:
    """Extract target IELTS score from requirements string."""
    if not lang_req:
        return None
    lang_req = lang_req.lower()
    # Look for patterns like "IELTS 7.0+", "IELTS 6.5+", "7.0+", etc.
    matches = re.findall(r'(?:ielts\s*)?(\d\.\d)\s*[\+\-]', lang_req)
    if matches:
        return max(float(m) for m in matches)
    return None


def compute_academic_fit(student: StudentMatchingProfile, university: dict) -> tuple[int, list[str], list[str]]:
    score = 0
    reasons = []
    gaps = []
    
    uni_gpa = university.get("gpaRequirements", "").lower()
    uni_sat = university.get("satRequirements", "").lower()
    uni_lang = university.get("languageRequirements", "").lower()
    
    has_gpa_req = any(kw in uni_gpa for kw in ["gpa", "балл", "grade", "3.", "4.", "ib 38", "80%"])
    has_sat_req = any(kw in uni_sat for kw in ["sat", "act", "required", "requir", "consider", "subject", "1350", "1400", "1450", "1500", "29", "30"]) and \
                  not any(kw in uni_sat for kw in ["optional", "не используется", "not used", "not specified", "recommended"])
    has_lang_req = any(kw in uni_lang for kw in ["ielts", "toefl", "english", "английский", "toefl 100", "ielts 7", "ielts 6.5", "ielts 6.0"])
    
    # Extract target scores from university requirements
    sat_target = extract_sat_target(university.get("satRequirements", ""))
    ielts_target = extract_ielts_target(university.get("languageRequirements", ""))
    
    if student.gpa and has_gpa_req:
        score += 20
        reasons.append("GPA соответствует требованиям")
    elif has_gpa_req and not student.gpa:
        gaps.append("GPA не указан")
    
    if student.sat and has_sat_req:
        score += 20
        reasons.append("SAT соответствует требованиям")
        # Check if SAT is below target
        if sat_target and student.sat < sat_target:
            gaps.append(f"SAT {student.sat} ниже целевого {sat_target}+")
    elif student.act and has_sat_req:
        score += 20
        reasons.append("ACT соответствует требованиям")
    elif has_sat_req and not student.sat and not student.act:
        gaps.append("SAT/ACT не указан")
    
    if (student.ielts or student.toefl) and has_lang_req:
        score += 20
        reasons.append("Уровень английского соответствует требованиям")
        # Check if IELTS is below target
        if student.ielts and ielts_target and student.ielts < ielts_target:
            gaps.append(f"IELTS {student.ielts} ниже целевого {ielts_target}+")
    elif has_lang_req and not student.ielts and not student.toefl:
        gaps.append("IELTS/TOEFL не указан")
    
    if student.gpa and student.gpa >= 3.7 and has_gpa_req:
        score += 10
        reasons.append("Высокий GPA")
    elif student.sat and student.sat >= 1400 and has_sat_req:
        score += 10
        reasons.append("Высокий SAT")
    elif student.act and student.act >= 30 and has_sat_req:
        score += 10
        reasons.append("Высокий ACT")
    
    if student.ielts and student.ielts >= 7.0 and has_lang_req:
        score += 10
        reasons.append("Отличный IELTS")
    elif student.toefl and student.toefl >= 100 and has_lang_req:
        score += 10
        reasons.append("Отличный TOEFL")
    
    return min(score, 60), reasons, gaps


def compute_program_fit(student: StudentMatchingProfile, university: dict) -> tuple[int, list[str], list[str]]:
    score = 0
    reasons = []
    gaps = []
    
    majors = [m.lower() for m in university.get("majors", [])]
    programs = [p.lower() for p in university.get("undergraduatePrograms", [])]
    all_programs = majors + programs
    
    if student.intended_major:
        intended = student.intended_major.lower()
        if any(intended in p or p in intended for p in all_programs):
            score += 25
            reasons.append(f"Есть программа {student.intended_major}")
        else:
            gaps.append(f"Программа {student.intended_major} не найдена")
    
    return min(score, 25), reasons, gaps


def compute_preference_fit(student: StudentMatchingProfile, university: dict) -> tuple[int, list[str], list[str]]:
    score = 0
    reasons = []
    gaps = []
    
    uni_country = university.get("country", "").lower()
    
    if student.preferred_countries:
        if any(c in uni_country or uni_country in c for c in student.preferred_countries):
            score += 15
            reasons.append("Страна совпадает с предпочтениями")
        else:
            gaps.append("Страна не в списке предпочтений")
    
    tuition_range = parse_tuition_range(university.get("tuition", ""))
    if student.budget_max and tuition_range:
        min_tuition, max_tuition = tuition_range
        if min_tuition <= student.budget_max:
            score += 10
            reasons.append("Входит в бюджет")
        else:
            gaps.append("Превышает бюджет")
    
    return min(score, 25), reasons, gaps


def compute_profile_strength(student: StudentMatchingProfile) -> tuple[int, list[str], list[str]]:
    score = 0
    reasons = []
    gaps = []
    
    if student.achievements:
        score += min(len(student.achievements) * 3, 15)
        reasons.append(f"{len(student.achievements)} достижений")
    else:
        gaps.append("Нет достижений в портфолио")
    
    if student.extracurriculars:
        score += min(len(student.extracurriculars) * 2, 10)
        reasons.append(f"{len(student.extracurriculars)} внеучебных активностей")
    else:
        gaps.append("Нет внеучебных активностей")
    
    return min(score, 25), reasons, gaps


def determine_category(match_score: int, student: StudentMatchingProfile, university: dict) -> str:
    uni_gpa_req = university.get("gpaRequirements", "").lower()
    uni_sat_req = university.get("satRequirements", "").lower()
    uni_lang_req = university.get("languageRequirements", "").lower()
    
    has_hard_reqs = any(kw in uni_gpa_req for kw in ["3.7", "3.8", "3.9", "4.0"]) or \
                    any(kw in uni_sat_req for kw in ["1400", "1450", "1500", "1550"]) or \
                    any(kw in uni_lang_req for kw in ["7.0", "7.5", "8.0", "100", "110"])
    
    if match_score >= 80 and not has_hard_reqs:
        return "target"
    elif match_score >= 70:
        return "target"
    elif match_score >= 50:
        return "ambitious" if has_hard_reqs else "target"
    else:
        return "ambitious"


def match_student_to_universities(
    student: StudentMatchingProfile,
    universities: list[dict],
    limit: int = 10
) -> list[UniversityMatch]:
    matches = []
    
    for uni in universities:
        academic_score, academic_reasons, academic_gaps = compute_academic_fit(student, uni)
        program_score, program_reasons, program_gaps = compute_program_fit(student, uni)
        pref_score, pref_reasons, pref_gaps = compute_preference_fit(student, uni)
        strength_score, strength_reasons, strength_gaps = compute_profile_strength(student)
        
        total_score = academic_score + program_score + pref_score + strength_score
        
        all_reasons = academic_reasons + program_reasons + pref_reasons + strength_reasons
        all_gaps = academic_gaps + program_gaps + pref_gaps + strength_gaps
        
        strengths = []
        if academic_score >= 40:
            strengths.append("Academic")
        if program_score >= 20:
            strengths.append("Program")
        if pref_score >= 15:
            strengths.append("Preferences")
        if strength_score >= 15:
            strengths.append("Extracurriculars")
        
        next_actions = []
        if "GPA не указан" in all_gaps:
            next_actions.append("Добавьте GPA в профиль")
        if "SAT/ACT не указан" in all_gaps:
            next_actions.append("Сдайте SAT или ACT")
        if "IELTS/TOEFL не указан" in all_gaps:
            next_actions.append("Сдайте IELTS или TOEFL")
        if "Программа" in " ".join(all_gaps):
            next_actions.append("Проверьте доступные программы")
        if "Страна" in " ".join(all_gaps):
            next_actions.append("Рассмотрите другие страны")
        if "Нет достижений" in all_gaps:
            next_actions.append("Добавьте достижения в портфолио")
        if "Нет внеучебных" in " ".join(all_gaps):
            next_actions.append("Добавьте проекты или волонтёрство")
        
        if not next_actions:
            next_actions.append("Заполните профиль подробнее")
        
        category = determine_category(total_score, student, uni)
        
        program_name = student.intended_major or (uni.get("majors", [""])[0] if uni.get("majors") else "")
        
        matches.append(UniversityMatch(
            university_id=uni.get("id", ""),
            name=uni.get("name", ""),
            country=uni.get("country", ""),
            city=uni.get("city", ""),
            program=program_name,
            match_score=min(total_score, 100),
            category=category,
            reasons=all_reasons,
            strengths=strengths,
            gaps=list(set(all_gaps)),
            next_actions=next_actions,
        ))
    
    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches[:limit]


def get_recommendations_for_profile(profile: dict, portfolio: list[dict], universities: list[dict], limit: int = 10) -> list[UniversityMatch]:
    student = normalize_student_profile(profile, portfolio)
    return match_student_to_universities(student, universities, limit)