import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user, create_user, authenticate_user, create_access_token
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    user = create_user(request.email, request.password, request.name)
    access_token = create_access_token(data={"sub": user["id"]})

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": user["id"]})

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
        ),
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user.get("id", ""),
        email=current_user.get("email"),
    )
