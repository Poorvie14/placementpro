from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app.api.deps import get_current_user, get_current_tpo, get_current_student
from app.models.user import UserInDB
from app.core.database import get_database
from pydantic import BaseModel, Field
from bson import ObjectId

router = APIRouter()

class StudentProfileBase(BaseModel):
    user_id: str
    cgpa: float
    backlogs: int
    branch: str
    passing_year: int
    skills: List[str] = []
    resume_url: str = ""

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    cgpa: float = None
    backlogs: int = None
    branch: str = None
    passing_year: int = None
    skills: List[str] = None
    resume_url: str = None

@router.get("/me")
async def get_my_profile(current_user: UserInDB = Depends(get_current_student)) -> Any:
    db = get_database()
    profile = await db["student_profiles"].find_one({"user_id": str(current_user.id)})
    if not profile:
        # Create an empty profile stub
        profile = {"user_id": str(current_user.id), "cgpa": 0.0, "backlogs": 0, "branch": "", "passing_year": 0, "skills": [], "resume_url": ""}
        await db["student_profiles"].insert_one(profile)
    profile["id"] = str(profile.pop("_id", ""))
    return profile

@router.put("/me")
async def update_my_profile(profile_update: StudentProfileUpdate, current_user: UserInDB = Depends(get_current_student)) -> Any:
    db = get_database()
    update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}
    await db["student_profiles"].update_one(
        {"user_id": str(current_user.id)},
        {"$set": update_data},
        upsert=True
    )
    profile = await db["student_profiles"].find_one({"user_id": str(current_user.id)})
    profile["id"] = str(profile.pop("_id", ""))
    return profile

@router.get("/", dependencies=[Depends(get_current_tpo)])
async def list_all_students() -> Any:
    db = get_database()
    cursor = db["student_profiles"].find({})
    profiles = await cursor.to_list(length=1000)
    
    users_cursor = db["users"].find({"role": "STUDENT"})
    users = await users_cursor.to_list(length=1000)
    user_dict = {str(u["_id"]): u for u in users}

    result = []
    for p in profiles:
        p["id"] = str(p.pop("_id", ""))
        user_info = user_dict.get(p.get("user_id"))
        if user_info:
            p["name"] = user_info.get("name")
            p["email"] = user_info.get("email")
        result.append(p)
    return result
