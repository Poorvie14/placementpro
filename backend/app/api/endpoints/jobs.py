from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app.api.deps import get_current_user, get_current_alumni
from app.models.user import UserInDB
from app.core.database import get_database
from bson import ObjectId
from app.models.core import JobPostCreate, JobPostInDB

router = APIRouter()

@router.post("/", response_model=JobPostInDB)
async def create_job(job_in: JobPostCreate, current_user: UserInDB = Depends(get_current_alumni)) -> Any:
    db = get_database()
    job_dict = job_in.model_dump()
    job_dict["alumni_id"] = str(current_user.id)
    result = await db["job_posts"].insert_one(job_dict)
    created_job = await db["job_posts"].find_one({"_id": result.inserted_id})
    return JobPostInDB.from_mongo(created_job)

@router.get("/", response_model=List[JobPostInDB])
async def list_jobs(current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    cursor = db["job_posts"].find({})
    jobs = await cursor.to_list(length=100)
    return [JobPostInDB.from_mongo(j) for j in jobs]
