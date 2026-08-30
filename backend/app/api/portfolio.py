from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.opportunity import OpportunityResponse
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
    response = await supabase_request(
        method="GET",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={"user_id": f"eq.{user_id}", "select": "*", "order": "sort_order.asc"},
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolio",
        )

    return [_map_portfolio_entry(item) for item in response.json()]


@router.post("", response_model=PortfolioEntryResponse)
async def create_portfolio_entry(
    entry: PortfolioEntryCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    count_response = await supabase_request(
        method="GET",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={"user_id": f"eq.{user_id}", "select": "id"},
        prefer="count=exact",
    )

    sort_order = 0
    if count_response.status_code == 200:
        content_range = count_response.headers.get("content-range", "")
        if "/" in content_range:
            try:
                sort_order = int(content_range.split("/")[-1]) + 1
            except ValueError:
                sort_order = 0

    entry_data = entry.model_dump(exclude_unset=True)
    entry_data["user_id"] = user_id
    entry_data["sort_order"] = sort_order

    response = await supabase_request(
        method="POST",
        path="portfolio_items",
        user_token=current_user.get("token"),
        json=entry_data,
        prefer="return=representation",
    )

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portfolio entry",
        )

    data = response.json()
    if isinstance(data, list) and data:
        return _map_portfolio_entry(data[0])
    return await list_portfolio(current_user)


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

    response = await supabase_request(
        method="PATCH",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={"id": f"eq.{entry_id}", "user_id": f"eq.{user_id}"},
        json=update_data,
        prefer="return=representation",
    )

    if response.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update portfolio entry",
        )

    if response.status_code == 204 or not response.json():
        return await _get_single_entry(entry_id, current_user)

    data = response.json()
    if data:
        return _map_portfolio_entry(data[0])
    return await _get_single_entry(entry_id, current_user)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    response = await supabase_request(
        method="DELETE",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={"id": f"eq.{entry_id}", "user_id": f"eq.{user_id}"},
    )

    if response.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete portfolio entry",
        )


@router.post("/reorder")
async def reorder_portfolio(
    request: PortfolioReorderRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    for item in request.items:
        await supabase_request(
            method="PATCH",
            path="portfolio_items",
            user_token=current_user.get("token"),
            params={"id": f"eq.{item.id}", "user_id": f"eq.{user_id}"},
            json={"sort_order": item.sort_order},
        )

    return {"message": "Portfolio reordered"}


async def _get_single_entry(entry_id: str, current_user: dict) -> PortfolioEntryResponse:
    response = await supabase_request(
        method="GET",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={"id": f"eq.{entry_id}", "select": "*"},
    )
    data = response.json()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio entry not found",
        )
    return _map_portfolio_entry(data[0])


def _map_portfolio_entry(item: dict) -> PortfolioEntryResponse:
    return PortfolioEntryResponse(
        id=item.get("id", ""),
        section=item.get("section", ""),
        title=item.get("title", ""),
        subtitle=item.get("subtitle"),
        date=item.get("date"),
        description=item.get("description"),
        sort_order=item.get("sort_order"),
    )
