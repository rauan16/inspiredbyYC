import json
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db

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
