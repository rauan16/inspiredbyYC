import json
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.services.matching import get_recommendations_for_profile

router = APIRouter(prefix="/api/universities", tags=["universities"])


@router.get("")
async def get_universities(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute(
        "SELECT data FROM universities ORDER BY name"
    ).fetchall()
    conn.close()

    universities = []
    for row in rows:
        if row["data"]:
            try:
                universities.append(json.loads(row["data"]))
            except (json.JSONDecodeError, TypeError):
                pass
    return universities


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()
    
    profile_row = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()
    
    if not profile_row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    import json as _json
    interests = profile_row["interests"]
    if isinstance(interests, str):
        try:
            interests = _json.loads(interests)
        except (_json.JSONDecodeError, TypeError):
            interests = []
    
    goals = profile_row["goals"]
    if isinstance(goals, str):
        try:
            goals = _json.loads(goals)
        except (_json.JSONDecodeError, TypeError):
            goals = []
    
    academic_info = None
    if "academic_info" in profile_row.keys():
        raw_academic = profile_row["academic_info"]
        if isinstance(raw_academic, str):
            try:
                academic_info = _json.loads(raw_academic)
            except (_json.JSONDecodeError, TypeError):
                academic_info = None
        elif raw_academic is not None:
            academic_info = raw_academic
    
    profile = {
        "name": profile_row["name"],
        "grade": profile_row["grade"],
        "location": profile_row["location"],
        "bio": profile_row["bio"],
        "interests": interests or [],
        "goals": goals or [],
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
    
    uni_rows = conn.execute(
        "SELECT data FROM universities ORDER BY name"
    ).fetchall()
    conn.close()
    
    universities = []
    for row in uni_rows:
        if row["data"]:
            try:
                universities.append(_json.loads(row["data"]))
            except (_json.JSONDecodeError, TypeError):
                pass
    
    recommendations = get_recommendations_for_profile(profile, portfolio, universities, limit=10)
    
    result = []
    for rec in recommendations:
        result.append({
            "university_id": rec.university_id,
            "name": rec.name,
            "country": rec.country,
            "city": rec.city,
            "program": rec.program,
            "match_score": rec.match_score,
            "category": rec.category,
            "reasons": rec.reasons,
            "strengths": rec.strengths,
            "gaps": rec.gaps,
            "next_actions": rec.next_actions,
        })
    
    return result


@router.get("/{university_id}")
async def get_university(university_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    row = conn.execute(
        "SELECT data FROM universities WHERE id = ?", (university_id,)
    ).fetchone()
    conn.close()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found",
        )

    if row["data"]:
        try:
            return json.loads(row["data"])
        except (json.JSONDecodeError, TypeError):
            pass

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="University data corrupted",
    )
