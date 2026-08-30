from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.sync import SyncRequest, SyncResponse

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("", response_model=SyncResponse)
async def sync(
    request: SyncRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    result = SyncResponse()

    if request.profile:
        update_data = request.profile.model_dump(exclude_unset=True)
        if update_data:
            response = await supabase_request(
                method="PATCH",
                path="profiles",
                user_token=current_user.get("token"),
                params={"id": f"eq.{user_id}"},
                json=update_data,
            )
            result.profile_updated = response.status_code in (200, 204)

    if request.portfolio_creates:
        for item in request.portfolio_creates:
            create_data = item.model_dump(exclude_unset=True)
            create_data["user_id"] = user_id
            create_response = await supabase_request(
                method="POST",
                path="portfolio_items",
                user_token=current_user.get("token"),
                json=create_data,
                prefer="return=minimal",
            )
            if create_response.status_code in (200, 201):
                result.portfolio_created += 1

    if request.portfolio:
        for item in request.portfolio:
            if item.deleted:
                del_response = await supabase_request(
                    method="DELETE",
                    path="portfolio_items",
                    user_token=current_user.get("token"),
                    params={"id": f"eq.{item.id}", "user_id": f"eq.{user_id}"},
                )
                if del_response.status_code in (200, 204):
                    result.portfolio_deleted += 1
            else:
                update_data = item.model_dump(exclude_unset=True, exclude={"id"})
                if update_data:
                    upd_response = await supabase_request(
                        method="PATCH",
                        path="portfolio_items",
                        user_token=current_user.get("token"),
                        params={"id": f"eq.{item.id}", "user_id": f"eq.{user_id}"},
                        json=update_data,
                    )
                    if upd_response.status_code in (200, 204):
                        result.portfolio_updated += 1

    if request.portfolio_reorder:
        for item in request.portfolio_reorder:
            upd_response = await supabase_request(
                method="PATCH",
                path="portfolio_items",
                user_token=current_user.get("token"),
                params={"id": f"eq.{item.id}", "user_id": f"eq.{user_id}"},
                json={"sort_order": item.sort_order},
            )
            if upd_response.status_code in (200, 204):
                result.portfolio_reordered = True

    if request.saved_opportunities:
        for item in request.saved_opportunities:
            if item.saved:
                await supabase_request(
                    method="POST",
                    path="saved_opportunities",
                    user_token=current_user.get("token"),
                    json={"user_id": user_id, "opportunity_id": item.opportunity_id},
                    prefer="return=minimal,resolution=ignore-duplicates",
                )
                result.saved_updated += 1
            else:
                del_response = await supabase_request(
                    method="DELETE",
                    path="saved_opportunities",
                    user_token=current_user.get("token"),
                    params={
                        "user_id": f"eq.{user_id}",
                        "opportunity_id": f"eq.{item.opportunity_id}",
                    },
                )
                if del_response.status_code in (200, 204):
                    result.saved_removed += 1

    return result
