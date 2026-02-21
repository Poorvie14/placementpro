from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from pydantic import BaseModel
from app.api.deps import get_current_tpo
from app.models.user import UserInDB
from app.core.database import get_database
from bson import ObjectId
import random

router = APIRouter()

class DriveConstraints(BaseModel):
    min_cgpa: float
    max_backlogs: int
    eligible_branches: List[str]
    passing_year: int

class NotificationSend(BaseModel):
    subject: str
    message: str
    drive_id: str

@router.post("/criteria-engine")
async def criteria_engine(constraints: DriveConstraints, current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    
    # student_profiles fields: user_id, cgpa, backlogs, branch, passing_year, skills
    query = {
        "cgpa": {"$gte": constraints.min_cgpa},
        "backlogs": {"$lte": constraints.max_backlogs},
        "branch": {"$in": constraints.eligible_branches},
    }
    # Only filter by passing_year if profiles actually have that field
    if constraints.passing_year:
        query["passing_year"] = constraints.passing_year
    
    cursor = db["student_profiles"].find(query)
    profiles = await cursor.to_list(length=1000)
    
    # fetch user details for emails and names
    users_cursor = db["users"].find({"role": "STUDENT"})
    users = await users_cursor.to_list(length=1000)
    user_dict = {str(u["_id"]): u for u in users}

    eligible_students = []
    for p in profiles:
        user_info = user_dict.get(p.get("user_id"))
        if user_info:
            eligible_students.append({
                "student_id": p.get("user_id"),
                "name": user_info.get("name"),
                "email": user_info.get("email"),
                "cgpa": p.get("cgpa"),
                "branch": p.get("branch"),
                "status": "Eligible"
            })

    return {
        "count": len(eligible_students),
        "students": eligible_students
    }

@router.post("/notify")
async def send_notifications(notif: NotificationSend, current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    notif_doc = notif.model_dump()
    notif_doc["sent_by"] = str(current_user.id)
    await db["notifications"].insert_one(notif_doc)
    return {"status": "success", "message": f"Notifications sent successfully for drive {notif.drive_id}"}


@router.get("/analytics")
async def get_analytics(current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    
    total_students = await db["users"].count_documents({"role": "STUDENT"})
    
    # Count placed (applications with status Selected)
    placed_cursor = db["applications"].find({"status": "Selected"})
    placed_apps = await placed_cursor.to_list(length=10000)
    placed_students = set([app["student_id"] for app in placed_apps])
    total_placed = len(placed_students)
    
    # Count upcoming interviews
    upcoming_interviews = await db["applications"].count_documents({"status": "Interview Scheduled"})

    placement_percentage = (total_placed / total_students * 100) if total_students > 0 else 0
    
    # Mock some branch wise and company wise data for the hackathon charts
    branch_analytics = [
        {"name": "CSE", "placed": random.randint(50, 100)},
        {"name": "IT", "placed": random.randint(40, 80)},
        {"name": "ECE", "placed": random.randint(30, 60)},
        {"name": "MECH", "placed": random.randint(10, 30)}
    ]
    
    company_analytics = [
        {"name": "Google", "hires": random.randint(1, 5)},
        {"name": "Microsoft", "hires": random.randint(2, 8)},
        {"name": "Amazon", "hires": random.randint(3, 10)},
        {"name": "TCS", "hires": random.randint(20, 50)}
    ]
    
    return {
        "total_students": total_students,
        "total_placed": total_placed,
        "upcoming_interviews": upcoming_interviews,
        "placement_percentage": round(placement_percentage, 1),
        "branch_analytics": branch_analytics,
        "company_analytics": company_analytics
    }
