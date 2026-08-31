import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.sync import SyncRequest, SyncResponse

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("", response_model=SyncResponse)
async def sync(
    request: SyncRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    result = SyncResponse()
    conn = get_db()

    if request.profile:
        update_data = request.profile.model_dump(exclude_unset=True)
        if update_data:
            fields = []
            values = []
            for key, value in update_data.items():
                if key in ("interests", "goals") and isinstance(value, list):
                    import json
                    value = json.dumps(value)
                fields.append(f"{key} = ?")
                values.append(value)

            values.append(user_id)
            query = f"UPDATE profiles SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            conn.execute(query, values)
            result.profile_updated = True

    if request.portfolio_creates:
        for item in request.portfolio_creates:
            create_data = item.model_dump(exclude_unset=True)
            entry_id = str(uuid.uuid4())

            # Get max sort_order
            max_order = conn.execute(
                "SELECT MAX(sort_order) FROM portfolio_items WHERE user_id = ?",
                (user_id,),
            ).fetchone()[0]
            sort_order = (max_order or 0) + 1

            conn.execute("""
                INSERT INTO portfolio_items (id, user_id, section, title, subtitle, date, description, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry_id,
                user_id,
                create_data.get("section", ""),
                create_data.get("title", ""),
                create_data.get("subtitle"),
                create_data.get("date"),
                create_data.get("description"),
                sort_order,
            ))
            result.portfolio_created += 1

    if request.portfolio:
        for item in request.portfolio:
            if item.deleted:
                conn.execute(
                    "DELETE FROM portfolio_items WHERE id = ? AND user_id = ?",
                    (item.id, user_id),
                )
                result.portfolio_deleted += 1
            else:
                update_data = item.model_dump(exclude_unset=True, exclude={"id"})
                if update_data:
                    fields = []
                    values = []
                    for key, value in update_data.items():
                        fields.append(f"{key} = ?")
                        values.append(value)

                    values.extend([item.id, user_id])
                    query = f"UPDATE portfolio_items SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
                    conn.execute(query, values)
                    result.portfolio_updated += 1

    if request.portfolio_reorder:
        for item in request.portfolio_reorder:
            conn.execute(
                "UPDATE portfolio_items SET sort_order = ? WHERE id = ? AND user_id = ?",
                (item.sort_order, item.id, user_id),
            )
            result.portfolio_reordered = True

    if request.saved_opportunities:
        for item in request.saved_opportunities:
            if item.saved:
                existing = conn.execute(
                    "SELECT id FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
                    (user_id, item.opportunity_id),
                ).fetchone()
                if existing is None:
                    conn.execute(
                        "INSERT INTO saved_opportunities (id, user_id, opportunity_id) VALUES (?, ?, ?)",
                        (str(uuid.uuid4()), user_id, item.opportunity_id),
                    )
                    result.saved_updated += 1
            else:
                conn.execute(
                    "DELETE FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?",
                    (user_id, item.opportunity_id),
                )
                result.saved_removed += 1

    conn.commit()
    conn.close()
    return result
