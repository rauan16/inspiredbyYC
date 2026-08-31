import json
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()
    profile = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return _row_to_profile(profile)


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    update: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    update_data = update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    conn = get_db()

    # Build dynamic UPDATE query
    fields = []
    values = []
    for key, value in update_data.items():
        if key in ("interests", "goals") and isinstance(value, list):
            value = json.dumps(value)
        fields.append(f"{key} = ?")
        values.append(value)

    values.append(user_id)
    query = f"UPDATE profiles SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    conn.execute(query, values)
    conn.commit()

    profile = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()

    return _row_to_profile(profile)


def _row_to_profile(row) -> ProfileResponse:
    interests = row["interests"]
    if isinstance(interests, str):
        try:
            interests = json.loads(interests)
        except (json.JSONDecodeError, TypeError):
            interests = []

    goals = row["goals"]
    if isinstance(goals, str):
        try:
            goals = json.loads(goals)
        except (json.JSONDecodeError, TypeError):
            goals = []

    return ProfileResponse(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        grade=row["grade"],
        location=row["location"],
        bio=row["bio"],
        interests=interests or [],
        goals=goals or [],
        portfolio_strength=row["portfolio_strength"] or 0,
        avatar_initials=row["avatar_initials"],
    )
