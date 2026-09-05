import json
import logging
import asyncio
import httpx
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

MAX_RETRIES = 5
RETRY_DELAY_BASE = 3

ADMISSION_ANALYST_PROMPT = """You are ULYS, an AI university admissions advisor. Analyze the student's complete profile against the selected university and program.

Your analysis must be structured as JSON with these exact keys:

{
  "requirementAnalysis": [
    {
      "criterion": "SAT",
      "status": "MET" | "NOT_MET" | "MISSING" | "UNKNOWN",
      "studentValue": "...",
      "requiredValue": "...",
      "explanation": "..."
    }
  ],
  "profileAnalysis": {
    "academic": {"rating": "EXCELLENT" | "STRONG" | "GOOD" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA", "explanation": "..."},
    "extracurricular": {"rating": "...", "explanation": "..."},
    "portfolio": {"rating": "...", "explanation": "..."}
  },
  "overallAssessment": {
    "level": "HIGHLY_COMPETITIVE" | "COMPETITIVE" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA",
    "explanation": "..."
  },
  "admissionEstimate": {
    "available": true | false,
    "min": number or null,
    "max": number or null,
    "confidence": "HIGH" | "MEDIUM" | "LOW" or null,
    "explanation": "..."
  },
  "weaknesses": ["..."],
  "recommendations": [
    {"priority": "HIGH" | "MEDIUM" | "LOW", "action": "...", "reason": "..."}
  ]
}

CRITICAL RULES:
1. NEVER invent SAT/IELTS/GPA requirements, acceptance rates, or admission statistics.
2. If university data is unavailable, say "Official data unavailable" in the explanation.
3. If student data is missing, mark the criterion as "MISSING" with explanation "Information missing."
4. If a university does not publish a requirement, mark it "UNKNOWN".
5. DO assign a numerical admission probability range when sufficient profile data exists (academic scores, test scores, portfolio). If insufficient data exists, set "available": false with explanation.
6. If admission estimate is not available, set "available": false with explanation.
7. Evaluate achievements and projects semantically — not by counting them.
8. Consider the relevance of the student's profile to the selected program.
9. Be conservative with estimates. A perfect SAT does NOT mean 95% admission chance.
10. If the student meets the published minimum requirement, mark it as "MET".
11. Never guarantee admission. Never output a fixed percentage as a guarantee.
12. Do NOT include any prose outside the JSON. Return ONLY valid JSON.
13. The JSON must be parseable. Do not include markdown code blocks or trailing text."""


def _format_student_profile(profile: dict, portfolio: list[dict]) -> str:
    parts = []
    parts.append("STUDENT PROFILE:")

    academic = profile.get("academicInfo")
    if academic:
        parts.append(f"  School: {academic.get('school', 'N/A')}")
        parts.append(f"  Curriculum: {academic.get('curriculum', 'N/A')}")
        parts.append(f"  Intended Major: {academic.get('intendedMajor', 'N/A')}")
        if academic.get("gpa"):
            parts.append(f"  GPA: {academic['gpa']} (scale: {academic.get('gpaScale', 'N/A')})")
        if academic.get("sat"):
            parts.append(f"  SAT: {academic['sat']}")
        if academic.get("act"):
            parts.append(f"  ACT: {academic['act']}")
        if academic.get("ielts"):
            parts.append(f"  IELTS: {academic['ielts']}")
        if academic.get("toefl"):
            parts.append(f"  TOEFL: {academic['toefl']}")
        if academic.get("graduationYear"):
            parts.append(f"  Graduation Year: {academic['graduationYear']}")
        if academic.get("gpaScale") == "percentage":
            parts.append("  GPA Scale: percentage")
        elif academic.get("gpaScale"):
            parts.append(f"  GPA Scale: {academic['gpaScale']}")
    else:
        parts.append("  Academic Info: Not provided")

    if profile.get("name"):
        parts.append(f"  Name: {profile['name']}")
    if profile.get("grade"):
        parts.append(f"  Grade: {profile['grade']}")
    if profile.get("location"):
        parts.append(f"  Location: {profile['location']}")
    if profile.get("bio"):
        parts.append(f"  Bio: {profile['bio']}")
    if profile.get("interests"):
        parts.append(f"  Interests: {', '.join(profile['interests'])}")
    if profile.get("goals"):
        parts.append(f"  Goals: {', '.join(profile['goals'])}")

    if portfolio:
        parts.append("\nPORTFOLIO ENTRIES:")
        for entry in portfolio:
            section = entry.get("section", "?")
            title = entry.get("title", "")
            date = entry.get("date", "")
            desc = entry.get("description", "")
            line = f"  [{section}] {title}"
            if date:
                line += f" ({date})"
            if desc:
                line += f" — {desc}"
            parts.append(line)
    else:
        parts.append("\nPORTFOLIO: Empty")

    return "\n".join(parts)


def _format_university_data(university: dict, program: str | None = None) -> str:
    if not university:
        return "UNIVERSITY: No data available"

    parts = ["UNIVERSITY DATA:"]
    parts.append(f"  Name: {university.get('name', 'N/A')}")
    parts.append(f"  Country: {university.get('country', 'N/A')}")
    parts.append(f"  Location: {university.get('location', 'N/A')}")
    if program:
        parts.append(f"  Selected Program: {program}")

    if university.get("majors"):
        parts.append(f"  Available Majors: {', '.join(university['majors'])}")

    if university.get("languageRequirements"):
        parts.append(f"  Language Requirements: {university['languageRequirements']}")

    if university.get("satRequirements"):
        parts.append(f"  SAT/ACT Requirements: {university['satRequirements']}")

    if university.get("gpaRequirements"):
        parts.append(f"  GPA Requirements: {university['gpaRequirements']}")

    if university.get("requirements"):
        reqs = "; ".join(university["requirements"]) if isinstance(university["requirements"], list) else str(university["requirements"])
        parts.append(f"  General Requirements: {reqs}")

    if university.get("curriculumRequirements"):
        parts.append(f"  Curriculum Requirements: {', '.join(university['curriculumRequirements'])}")

    if university.get("subjectRequirements"):
        parts.append(f"  Subject Requirements: {', '.join(university['subjectRequirements'])}")

    if university.get("kazakhstanRequirements"):
        parts.append(f"  Kazakhstan Requirements: {', '.join(university['kazakhstanRequirements'])}")

    if university.get("internationalRequirements"):
        parts.append(f"  International Requirements: {', '.join(university['internationalRequirements'])}")

    if university.get("scholarshipAvailability"):
        parts.append(f"  Scholarship: Available")
    else:
        parts.append("  Scholarship: Not specified")

    if university.get("tuition"):
        parts.append(f"  Tuition: {university['tuition']}")

    if university.get("financialAid"):
        parts.append(f"  Financial Aid: {university['financialAid']}")

    if university.get("rankingContext"):
        parts.append(f"  Ranking: {university['rankingContext']}")

    if university.get("acceptanceInfo"):
        parts.append(f"  Acceptance Info: {university['acceptanceInfo']}")

    if university.get("officialAdmissionsUrl"):
        parts.append(f"  Official URL: {university['officialAdmissionsUrl']}")

    if university.get("lastVerifiedAt"):
        parts.append(f"  Last Verified: {university['lastVerifiedAt']}")

    parts.append("\nIMPORTANT: Use ONLY the above university data. Do NOT invent or assume any requirements that are not listed.")

    return "\n".join(parts)


async def get_admission_analysis(
    student_profile: dict,
    portfolio: list[dict],
    university: dict,
    program: str | None = None,
) -> dict:
    """Call AI to analyze student profile against a specific university."""

    student_context = _format_student_profile(student_profile, portfolio)
    university_context = _format_university_data(university, program)

    user_prompt = f"""Analyze the student's profile for admission to the selected university and program.

{student_context}

{university_context}

Return your analysis as JSON only, following the exact schema specified in the system prompt. Consider all aspects: formal requirements, academic strength, extracurricular profile, portfolio/projects, and program-specific fit."""

    messages = [
        {"role": "system", "content": ADMISSION_ANALYST_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.AI_API_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://ulys-gamma.vercel.app",
                        "X-Title": "ULYS",
                    },
                    json={
                        "model": settings.AI_MODEL,
                        "messages": messages,
                        "max_tokens": 2048,
                        "temperature": 0.3,
                    },
                )

                if response.status_code == 429:
                    retry_after = response.headers.get("retry-after", "").strip()
                    delay = int(retry_after) if retry_after.isdigit() else RETRY_DELAY_BASE * (2 ** attempt)
                    logger.warning(f"AI rate limited (429). Retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
                    await asyncio.sleep(delay)
                    continue

                if response.status_code != 200:
                    try:
                        err_data = response.json()
                        safe_detail = str(err_data.get("error", {}).get("message", ""))[:200]
                    except Exception:
                        safe_detail = response.text[:200]
                    logger.error(f"AI provider error: status={response.status_code}, message={safe_detail}")
                    raise HTTPException(status_code=502, detail="AI service error")

                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    logger.error("AI provider error: no choices in response")
                    raise HTTPException(status_code=502, detail="AI service returned no response")

                content = choices[0].get("message", {}).get("content", "")

                try:
                    result = json.loads(content)
                    if isinstance(result, str):
                        result = json.loads(result)
                    if not isinstance(result, dict):
                        raise ValueError("Response is not a dict")
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"AI returned non-JSON: {str(e)[:200]}")
                    raise HTTPException(
                        status_code=502,
                        detail="AI service returned an invalid response format",
                    )

                result.setdefault("studentProfile", student_profile)
                result.setdefault("universityData", university)
                return result

        except httpx.TimeoutException:
            logger.error("AI provider error: timeout (60s)")
            last_error = "timeout"
        except httpx.ConnectError:
            logger.error("AI provider error: connection failed")
            last_error = "connection"

        if attempt < MAX_RETRIES - 1 and last_error:
            delay = RETRY_DELAY_BASE * (2 ** attempt)
            logger.warning(f"Retrying after {last_error} in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
            await asyncio.sleep(delay)

    if last_error:
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again later.",
        )
    raise HTTPException(status_code=502, detail="AI service error")
