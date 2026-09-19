import json
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.what_if import WhatIfRequest, WhatIfResponse
from app.services.what_if import run_what_if_simulation

router = APIRouter(prefix="/api/what-if", tags=["what-if"])


@router.post("", response_model=WhatIfResponse)
async def run_what_if(
    request: WhatIfRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    # Fetch real profile
    profile_row = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()

    if profile_row is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    # Parse profile data
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

    # Fetch portfolio
    portfolio_rows = conn.execute(
        "SELECT section, title, subtitle, date, description FROM portfolio_items WHERE user_id = ? ORDER BY sort_order ASC",
        (user_id,),
    ).fetchall()
    portfolio = [
        {"section": row["section"], "title": row["title"], "subtitle": row["subtitle"], "date": row["date"], "description": row["description"]}
        for row in portfolio_rows
    ]

    conn.close()

    # Run simulation (no persistence, no side effects)
    try:
        result = run_what_if_simulation(profile, portfolio, request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Simulation failed",
        )