import re


def classify_activity(entry: dict) -> dict:
    text = f"{entry.get('title', '')} {entry.get('description', '')} {entry.get('subtitle', '')}".lower()
    categories = []

    if any(k in text for k in ["olympiad", "диплом", "academic"]):
        categories.append("Academic")
    if any(k in text for k in ["research", "исследователь", "lab", "published"]):
        categories.append("Research")
    if any(k in text for k in ["tech", "software", "ai", "python", "code", "programming", "application", "app", "digital", "data", "it", "developer", "engineering", "hackathon", "startup"]):
        categories.append("Technology")
    if any(k in text for k in ["startup", "founder", "co-founder", "business", "entrepreneur", "product", "revenue", "funding", "venture"]):
        categories.append("Entrepreneurship")
        categories.append("Innovation")
    if any(k in text for k in ["lead", "organiz", "headed", "managed", "president", "founder", "director", "captain", "chair"]):
        categories.append("Leadership")
    if any(k in text for k in ["hackathon", "competition", "contest", "olympiad", "award", "prize", "winner", "1st", "2nd", "3rd", "finalist", "championship"]):
        categories.append("Competition")
    if any(k in text for k in ["marathon", "sport", "football", "basketball", "swim", "run", "athletic", "gym", "fitness"]):
        categories.append("Sports")
    if any(k in text for k in ["art", "music", "theater", "film", "photography", "design", "drawing", "painting", "creative"]):
        categories.append("Arts")
    if any(k in text for k in ["volunteer", "charity", "community", "service", "social", "ngo", "campaign", "help"]):
        categories.append("Community")
    if any(k in text for k in ["intern", "experience", "company", "firm", "office", "professional", "career", "job"]):
        categories.append("Professional")
    if any(k in text for k in ["project", "built", "developed", "created", "launched", "implemented", "designed"]):
        categories.append("Project")
    if any(k in text for k in ["international", "exchange", "abroad", "global", "world", "overseas", "foreign"]):
        categories.append("International")
    if any(k in text for k in ["hobby", "interest", "club", "personal", "fun", "leisure"]):
        categories.append("Personal")

    if not categories:
        categories.append("Other")

    strength = "Weak"
    if any(k in text for k in ["won", "winner", "1st", "first", "gold", "published", "founded", "built", "led", "head", "managed", "national", "international", "top"]):
        strength = "Strong"
    elif any(k in text for k in ["participated", "attended", "organized", "created", "developed", "project", "intern", "member", "team"]):
        strength = "Moderate"

    if "Entrepreneurship" in categories or "Research" in categories:
        relevance = "Demonstrates initiative and real-world impact"
    elif "Competition" in categories and strength == "Strong":
        relevance = "Demonstrates competitive excellence"
    elif "Technology" in categories or "Project" in categories:
        relevance = "Demonstrates practical technical experience"
    elif "Leadership" in categories:
        relevance = "Demonstrates leadership and initiative"
    elif "Sports" in categories:
        relevance = "Demonstrates discipline and commitment"
    elif "Community" in categories:
        relevance = "Demonstrates social engagement and initiative"
    elif "Professional" in categories:
        relevance = "Demonstrates professional experience"
    elif "Academic" in categories:
        relevance = "Demonstrates academic achievement"
    else:
        relevance = "Adds a personal dimension to the profile"

    return {"categories": categories, "strength": strength, "relevance": relevance}


def get_program_focus(university: dict) -> str:
    text = " ".join(
        (university.get("majors", []) or []) + (university.get("undergraduatePrograms", []) or [])
    ).lower()
    if any(k in text for k in ["computer", "software", "engineer", "tech", "information", "data", "math", "physics", "chemistry", "biology", "science"]):
        return "STEM"
    if any(k in text for k in ["business", "management", "economics", "finance", "entrepreneur", "marketing"]):
        return "Business"
    if any(k in text for k in ["medicine", "health", "medical", "nursing", "pharmacy"]):
        return "Medicine"
    if any(k in text for k in ["law", "legal", "justice"]):
        return "Law"
    if any(k in text for k in ["arts", "humanities", "literature", "history", "philosophy", "social", "political"]):
        return "LiberalArts"
    return "General"


CATEGORY_RELEVANCE = {
    "STEM": {"Research": 3, "Technology": 3, "Competition": 2, "Project": 2, "Innovation": 2, "Academic": 2, "Leadership": 1, "Sports": 1, "Personal": 1, "Community": 1, "Professional": 1, "Arts": 1, "Entrepreneurship": 1, "International": 1, "Other": 0},
    "Business": {"Entrepreneurship": 3, "Leadership": 3, "Competition": 2, "Project": 2, "Innovation": 2, "Professional": 2, "Community": 1, "Academic": 1, "Sports": 1, "Personal": 1, "Research": 1, "Technology": 1, "Arts": 1, "International": 1, "Other": 0},
    "Medicine": {"Research": 3, "Community": 3, "Academic": 2, "Professional": 2, "Competition": 2, "Project": 1, "Leadership": 1, "Sports": 1, "Personal": 1, "Technology": 1, "Innovation": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
    "Law": {"Leadership": 3, "Community": 3, "Competition": 2, "Academic": 2, "Project": 1, "Professional": 1, "Sports": 1, "Personal": 1, "Research": 1, "Technology": 1, "Innovation": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
    "LiberalArts": {"Leadership": 3, "Community": 3, "Arts": 3, "Competition": 2, "Academic": 2, "Project": 2, "Research": 2, "Sports": 1, "Personal": 1, "Technology": 1, "Innovation": 1, "International": 1, "Professional": 1, "Entrepreneurship": 1, "Other": 0},
    "General": {"Leadership": 2, "Competition": 2, "Project": 2, "Research": 2, "Technology": 2, "Innovation": 2, "Community": 2, "Professional": 2, "Academic": 2, "Sports": 1, "Personal": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
}


def compute_holistic_extracurricular_score(classified: list[dict], program_focus: str):
    score = 0
    signals = []
    seen = set()

    for activity in classified:
        category = activity.get("categories", ["Other"])[0]
        strength = activity.get("strength", "Weak")
        relevance = activity.get("relevance", "")
        cat_score = CATEGORY_RELEVANCE.get(program_focus, {}).get(category, 0)
        strength_multiplier = 1.0 if strength == "Strong" else 0.7 if strength == "Moderate" else 0.4

        if cat_score > 0 and category not in seen:
            score += cat_score * strength_multiplier
            seen.add(category)
            signals.append(f"{strength} {category.lower()}: {relevance}")

    return min(20, round(score)), signals[:5]


def compute_admission_estimate(profile: dict, portfolio: list[dict], university: dict) -> dict:
    academic = profile.get("academicInfo", {}) or {}
    sat = academic.get("sat")
    act = academic.get("act")
    ielts = academic.get("ielts") or academic.get("toefl")
    gpa = academic.get("gpa")

    sections: dict = {}
    for entry in portfolio:
        section = entry.get("section", "other")
        sections.setdefault(section, []).append(entry)

    sat_raw = university.get("satRequirements", "") or ""
    lang_raw = university.get("languageRequirements", "") or ""
    gpa_raw = university.get("gpaRequirements", "") or ""

    sat_optional = bool(re.search(r"optional|не используется|not specified", sat_raw, re.I))
    sat_considered = not sat_optional and bool(re.search(r"sat|act|requir|consider", sat_raw, re.I))
    ielts_required = bool(re.search(r"ielts|toefl|английский|english", lang_raw, re.I))
    gpa_required = bool(re.search(r"gpa|балл|grade", gpa_raw, re.I))

    has_sat = sat is not None or act is not None
    has_ielts = ielts is not None
    has_gpa = gpa is not None

    factors = []
    gaps = []

    if sat_considered:
        if has_sat:
            factors.append(f"SAT {sat or act}")
        else:
            gaps.append("SAT/ACT score")
    if ielts_required:
        if has_ielts:
            factors.append(f"IELTS {ielts}")
        else:
            gaps.append("IELTS/TOEFL score")
    if gpa_required:
        if has_gpa:
            factors.append(f"GPA {gpa}")
        else:
            gaps.append("GPA")

    classified = []
    for section_entries in sections.values():
        for entry in section_entries:
            classified.append(classify_activity(entry))

    program_focus = get_program_focus(university)
    holistic_score, holistic_signals = compute_holistic_extracurricular_score(classified, program_focus)
    factors.extend(holistic_signals)

    has_any_portfolio = bool(portfolio)
    if not has_any_portfolio:
        gaps.append("Portfolio is empty")

    score = 0
    if has_gpa and gpa_required:
        score += 10
    if has_sat and sat_considered:
        score += 10
    if has_ielts and ielts_required:
        score += 10

    if sat and sat >= 1400 and sat_considered:
        score += 15
    elif sat and sat >= 1200 and sat_considered:
        score += 10
    elif sat and sat_considered:
        score += 5

    if act and act >= 30 and sat_considered:
        score += 15
    elif act and act >= 24 and sat_considered:
        score += 10
    elif act and sat_considered:
        score += 5

    if ielts and ielts >= 7.0 and ielts_required:
        score += 15
    elif ielts and ielts >= 6.0 and ielts_required:
        score += 10
    elif ielts and ielts_required:
        score += 5

    score += holistic_score

    ranking = (university.get("rankingContext", "") or "").lower()
    acceptance = (university.get("acceptanceInfo", "") or "").lower()
    multiplier = 1.0
    if re.search(r"qs\s*(top\s*)?10|qs\s*2|qs\s*3|qs\s*4|qs\s*8|qs\s*9|qs\s*11|qs\s*17|qs\s*22|qs\s*37", ranking) or re.search(r"очень высокий конкурс|very high|highly competitive", acceptance):
        multiplier = 0.6
    elif re.search(r"qs\s*(50|51|100|101|200|251|300)", ranking) or re.search(r"высокий конкурс|competitive", acceptance):
        multiplier = 0.8
    elif "конкурс" in acceptance:
        multiplier = 0.9

    final_score = min(100, round(score * multiplier))

    if final_score >= 80:
        min_pct, max_pct = 70, 90
    elif final_score >= 60:
        min_pct, max_pct = 50, 70
    elif final_score >= 40:
        min_pct, max_pct = 30, 50
    elif final_score >= 20:
        min_pct, max_pct = 15, 35
    else:
        min_pct, max_pct = 5, 20

    required_fields = 0
    present_fields = 0
    if sat_considered:
        required_fields += 1
        if has_sat:
            present_fields += 1
    if ielts_required:
        required_fields += 1
        if has_ielts:
            present_fields += 1
    if gpa_required:
        required_fields += 1
        if has_gpa:
            present_fields += 1
    required_fields += 1
    if has_any_portfolio:
        present_fields += 1

    if required_fields == 0:
        confidence = "Medium"
    elif present_fields == required_fields:
        confidence = "High"
    elif present_fields >= (required_fields + 1) // 2:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "available": True,
        "min": min_pct,
        "max": max_pct,
        "confidence": confidence,
        "factors": factors,
        "gaps": gaps,
    }
