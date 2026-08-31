import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import get_db
from app.schemas.portfolio import (
    PortfolioEntryCreate,
    PortfolioEntryResponse,
    PortfolioEntryUpdate,
    PortfolioReorderRequest,
)

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("", response_model=list[PortfolioEntryResponse])
async def list_portfolio(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM portfolio_items WHERE user_id = ? ORDER BY sort_order ASC",
        (user_id,),
    ).fetchall()
    conn.close()

    return [_row_to_portfolio_entry(row) for row in rows]


@router.post("", response_model=PortfolioEntryResponse)
async def create_portfolio_entry(
    entry: PortfolioEntryCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    # Get max sort_order
    max_order = conn.execute(
        "SELECT MAX(sort_order) FROM portfolio_items WHERE user_id = ?",
        (user_id,),
    ).fetchone()[0]
    sort_order = (max_order or 0) + 1

    entry_data = entry.model_dump(exclude_unset=True)
    entry_id = str(uuid.uuid4())

    conn.execute("""
        INSERT INTO portfolio_items (id, user_id, section, title, subtitle, date, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry_id,
        user_id,
        entry_data.get("section", ""),
        entry_data.get("title", ""),
        entry_data.get("subtitle"),
        entry_data.get("date"),
        entry_data.get("description"),
        sort_order,
    ))
    conn.commit()

    row = conn.execute(
        "SELECT * FROM portfolio_items WHERE id = ?", (entry_id,)
    ).fetchone()
    conn.close()

    return _row_to_portfolio_entry(row)


@router.patch("/{entry_id}", response_model=PortfolioEntryResponse)
async def update_portfolio_entry(
    entry_id: str,
    update: PortfolioEntryUpdate,
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
        fields.append(f"{key} = ?")
        values.append(value)

    values.extend([entry_id, user_id])
    query = f"UPDATE portfolio_items SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
    conn.execute(query, values)
    conn.commit()

    row = conn.execute(
        "SELECT * FROM portfolio_items WHERE id = ? AND user_id = ?",
        (entry_id, user_id),
    ).fetchone()
    conn.close()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio entry not found",
        )

    return _row_to_portfolio_entry(row)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()
    conn.execute(
        "DELETE FROM portfolio_items WHERE id = ? AND user_id = ?",
        (entry_id, user_id),
    )
    conn.commit()
    conn.close()


@router.post("/reorder")
async def reorder_portfolio(
    request: PortfolioReorderRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    for item in request.items:
        conn.execute(
            "UPDATE portfolio_items SET sort_order = ? WHERE id = ? AND user_id = ?",
            (item.sort_order, item.id, user_id),
        )

    conn.commit()
    conn.close()
    return {"message": "Portfolio reordered"}


def _row_to_portfolio_entry(row) -> PortfolioEntryResponse:
    return PortfolioEntryResponse(
        id=row["id"],
        section=row["section"],
        title=row["title"],
        subtitle=row["subtitle"],
        date=row["date"],
        description=row["description"],
        sort_order=row["sort_order"],
    )
