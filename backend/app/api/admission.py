import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.admission import AdmissionAnalysisResponse
from app.services.admission_analysis import get_admission_analysis

router = APIRouter(prefix="/api/universities", tags=["admission"])

logger = logging.getLogger(__name__)


@router.get("/{university_id}/analysis", response_model=AdmissionAnalysisResponse)
async def get_university_analysis(
    university_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    uni_row = conn.execute(
        "SELECT data FROM universities WHERE id = ?", (university_id,)
    ).fetchone()

    if uni_row is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found",
        )

    if not uni_row["data"]:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="University data unavailable",
        )

    try:
        university = json.loads(uni_row["data"])
    except (json.JSONDecodeError, TypeError):
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="University data corrupted",
        )

    profile_row = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()

    profile: dict = {"id": user_id}
    if profile_row:
        interests_raw = profile_row["interests"]
        if isinstance(interests_raw, str):
            try:
                interests = json.loads(interests_raw)
            except (json.JSONDecodeError, TypeError):
                interests = []
        else:
            interests = interests_raw or []

        goals_raw = profile_row["goals"]
        if isinstance(goals_raw, str):
            try:
                goals = json.loads(goals_raw)
            except (json.JSONDecodeError, TypeError):
                goals = []
        else:
            goals = goals_raw or []

        academic_info = None
        if "academic_info" in profile_row.keys():
            raw_academic = profile_row["academic_info"]
            if isinstance(raw_academic, str):
                try:
                    academic_info = json.loads(raw_academic)
                except (json.JSONDecodeError, TypeError):
                    academic_info = None
            elif raw_academic is not None:
                academic_info = raw_academic

        profile = {
            "id": user_id,
            "name": profile_row["name"],
            "grade": profile_row["grade"],
            "location": profile_row["location"],
            "bio": profile_row["bio"],
            "interests": interests,
            "goals": goals,
            "academicInfo": academic_info,
        }

    portfolio_rows = conn.execute(
        "SELECT section, title, date, description FROM portfolio_items WHERE user_id = ? ORDER BY sort_order ASC",
        (user_id,),
    ).fetchall()
    portfolio = [
        {"section": row["section"], "title": row["title"], "date": row["date"], "description": row["description"]}
        for row in portfolio_rows
    ]
    conn.close()

    try:
        result = await get_admission_analysis(
            student_profile=profile,
            portfolio=portfolio,
            university=university,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again later.",
        )
