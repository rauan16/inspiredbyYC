import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import get_db
from app.schemas.opportunity import OpportunityResponse
from app.api.opportunities import _row_to_opportunity

router = APIRouter(prefix="/api/saved-opportunities", tags=["saved-opportunities"])


class SaveRequest(BaseModel):
    opportunity_id: str


@router.get("", response_model=list[OpportunityResponse])
async def list_saved_opportunities(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()
    rows = conn.execute("""
        SELECT o.* FROM opportunities o
        JOIN saved_opportunities s ON o.id = s.opportunity_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
    """, (user_id,)).fetchall()
    conn.close()

    return [_row_to_opportunity(row) for row in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
async def save_opportunity(
    request: SaveRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    # Check if opportunity exists
    opp = conn.execute(
        "SELECT id FROM opportunities WHERE id = ?", (request.opportunity_id,)
    ).fetchone()
    if opp is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    # Check if already saved
    existing = conn.execute(
        "SELECT id FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
        (user_id, request.opportunity_id),
    ).fetchone()

    if existing is None:
        conn.execute(
            "INSERT INTO saved_opportunities (id, user_id, opportunity_id) VALUES (?, ?, ?)",
            (str(uuid.uuid4()), user_id, request.opportunity_id),
        )
        conn.commit()

    conn.close()
    return {"message": "Opportunity saved"}


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()
    conn.execute(
        "DELETE FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
        (user_id, opportunity_id),
    )
    conn.commit()
    conn.close()
