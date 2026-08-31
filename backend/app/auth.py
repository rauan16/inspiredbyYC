from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

from app.config import settings
from app.database import get_db

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8") if isinstance(hashed_password, str) else hashed_password
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # Truncate to 72 bytes to avoid bcrypt limit
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    conn = get_db()
    user = conn.execute(
        "SELECT id, email, name FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {"id": user["id"], "email": user["email"], "name": user["name"]}


def create_user(email: str, password: str, name: str) -> dict:
    conn = get_db()
    user_id = str(uuid.uuid4())
    password_hash = get_password_hash(password)
    avatar_initials = name[:2].upper() if name else "U"

    try:
        conn.execute(
            "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
            (user_id, email, password_hash, name),
        )
        conn.execute(
            "INSERT INTO profiles (id, email, name, avatar_initials) VALUES (?, ?, ?, ?)",
            (user_id, email, name, avatar_initials),
        )
        conn.commit()
    except Exception as e:
        conn.close()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    conn.close()
    return {"id": user_id, "email": email, "name": name}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    conn = get_db()
    user = conn.execute(
        "SELECT id, email, name, password_hash FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    if user is None or not verify_password(password, user["password_hash"]):
        return None

    return {"id": user["id"], "email": user["email"], "name": user["name"]}
