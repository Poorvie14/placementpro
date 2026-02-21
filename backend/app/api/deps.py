from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_database
from app.models.user import UserInDB, RoleEnum
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    user_data = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user_data is None:
        raise credentials_exception
    return UserInDB(**user_data)

async def get_current_tpo(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role != RoleEnum.TPO:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_student(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role != RoleEnum.STUDENT:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_alumni(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role != RoleEnum.ALUMNI:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
