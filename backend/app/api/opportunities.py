import json
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.opportunity import OpportunityResponse

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(
    category: str | None = None,
    format: str | None = None,
    search: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    conn = get_db()
    query = "SELECT * FROM opportunities WHERE 1=1"
    params = []

    if category:
        query += " AND category = ?"
        params.append(category)
    if format:
        query += " AND format = ?"
        params.append(format)
    if search:
        query += " AND (title LIKE ? OR organization LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY deadline ASC"

    rows = conn.execute(query, params).fetchall()
    conn.close()

    return [_row_to_opportunity(row) for row in rows]


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user),
):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM opportunities WHERE id = ?", (opportunity_id,)
    ).fetchone()
    conn.close()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    return _row_to_opportunity(row)


def _row_to_opportunity(row) -> OpportunityResponse:
    requirements = row["requirements"]
    if isinstance(requirements, str):
        try:
            requirements = json.loads(requirements)
        except (json.JSONDecodeError, TypeError):
            requirements = []

    timeline = row["timeline"]
    if isinstance(timeline, str):
        try:
            timeline = json.loads(timeline)
        except (json.JSONDecodeError, TypeError):
            timeline = []

    return OpportunityResponse(
        id=row["id"],
        title=row["title"],
        organization=row["organization"],
        category=row["category"],
        category_label=row["category_label"],
        deadline=row["deadline"],
        location=row["location"],
        format=row["format"],
        eligibility=row["eligibility"],
        description=row["description"],
        requirements=requirements or [],
        timeline=timeline or [],
        color=row["color"],
        website=row["website"],
        recommended=bool(row["recommended"]),
    )
