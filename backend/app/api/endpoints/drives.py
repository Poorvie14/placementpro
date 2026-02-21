from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app.api.deps import get_current_user, get_current_tpo
from app.models.user import UserInDB
from app.models.core import PlacementDriveCreate, PlacementDriveInDB
from app.core.database import get_database
from app.core.email import (
    send_email,
    build_drive_eligibility_email,
    build_aptitude_result_email,
    build_selection_email,
)
from bson import ObjectId
from datetime import datetime
import asyncio

router = APIRouter()


# ── Helper: find eligible students and their emails for a drive ──────────────

async def _get_eligible_student_emails(db, drive: dict) -> list[dict]:
    """Return list of {name, email} for students eligible for the given drive."""
    min_cgpa = float(drive.get("min_cgpa", 0))
    max_backlogs = int(drive.get("max_backlogs", 99))
    eligible_branches = drive.get("eligible_branches", [])

    # Build profile filter
    profile_filter: dict = {
        "cgpa": {"$gte": min_cgpa},
        "backlogs": {"$lte": max_backlogs},
    }
    if eligible_branches:
        profile_filter["branch"] = {"$in": eligible_branches}

    profiles = await db["student_profiles"].find(profile_filter).to_list(length=500)
    recipients = []
    for profile in profiles:
        user = await db["users"].find_one({"_id": ObjectId(profile["user_id"])})
        if user:
            recipients.append({"name": user.get("name", "Student"), "email": user["email"]})
    return recipients


# ── Drive CRUD ───────────────────────────────────────────────────────────────

@router.post("/", response_model=PlacementDriveInDB)
async def create_drive(drive_in: PlacementDriveCreate, current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    drive_dict = drive_in.model_dump()
    result = await db["drives"].insert_one(drive_dict)
    created_drive = await db["drives"].find_one({"_id": result.inserted_id})

    # Fire-and-forget: email eligible students
    asyncio.create_task(_notify_eligible_students(db, created_drive))

    return PlacementDriveInDB.from_mongo(created_drive)


async def _notify_eligible_students(db, drive: dict):
    """Background task: find eligible students and email them."""
    try:
        recipients = await _get_eligible_student_emails(db, drive)
        drive_date = drive.get("drive_date")
        date_str = drive_date.strftime("%d %b %Y") if isinstance(drive_date, datetime) else str(drive_date)[:10]

        for r in recipients:
            html = build_drive_eligibility_email(
                student_name=r["name"],
                company=drive.get("company_name", ""),
                role=drive.get("role", ""),
                drive_date=date_str,
                salary=drive.get("salary_pkg", "N/A"),
                min_cgpa=drive.get("min_cgpa", 0),
            )
            await send_email([r["email"]], f"🎯 You're Eligible – {drive.get('company_name')} Drive | PlacementPro", html)
        print(f"[EMAIL] Notified {len(recipients)} eligible students for drive: {drive.get('company_name')}")
    except Exception as e:
        print(f"[EMAIL ERROR] _notify_eligible_students failed: {e}")


@router.get("/")
async def list_drives(current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    cursor = db["drives"].find({})
    drives = await cursor.to_list(length=100)
    result = []
    for d in drives:
        d["id"] = str(d.pop("_id"))
        if isinstance(d.get("drive_date"), datetime):
            d["drive_date"] = d["drive_date"].isoformat()
        result.append(d)
    return result


@router.post("/{drive_id}/apply")
async def apply_to_drive(drive_id: str, current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    try:
        oid = ObjectId(drive_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid drive ID")

    drive = await db["drives"].find_one({"_id": oid})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    existing = await db["applications"].find_one({"drive_id": drive_id, "student_id": str(current_user.id)})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this drive")

    app_data = {
        "drive_id": drive_id,
        "student_id": str(current_user.id),
        "status": "Applied",
        "applied_at": datetime.utcnow().isoformat(),
        "interview_time": None,
    }

    result = await db["applications"].insert_one(app_data)
    app = await db["applications"].find_one({"_id": result.inserted_id})
    app["id"] = str(app.pop("_id"))
    return app


@router.get("/applications")
async def list_applications(current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    query = {}
    if current_user.role == "STUDENT":
        query = {"student_id": str(current_user.id)}

    cursor = db["applications"].find(query)
    apps = await cursor.to_list(length=1000)
    for app in apps:
        app["id"] = str(app.pop("_id"))
        try:
            drive = await db["drives"].find_one({"_id": ObjectId(app["drive_id"])})
            if drive:
                app["company_name"] = drive.get("company_name")
                app["role"] = drive.get("role")
                app["salary_pkg"] = drive.get("salary_pkg", "")
        except Exception:
            pass
    return apps


@router.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, status: str, current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    await db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": status}}
    )
    app = await db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app["id"] = str(app.pop("_id"))

    # Send "Selected" email
    if status == "Selected":
        asyncio.create_task(_notify_selected(db, app))

    return app


async def _notify_selected(db, app: dict):
    try:
        user = await db["users"].find_one({"_id": ObjectId(app["student_id"])})
        drive = await db["drives"].find_one({"_id": ObjectId(app["drive_id"])})
        if user and drive:
            html = build_selection_email(
                student_name=user.get("name", "Student"),
                company=drive.get("company_name", ""),
                role=drive.get("role", ""),
                salary=drive.get("salary_pkg", "N/A"),
            )
            await send_email(
                [user["email"]],
                f"🎉 Congratulations! You've been Selected – {drive.get('company_name')} | PlacementPro",
                html,
            )
    except Exception as e:
        print(f"[EMAIL ERROR] _notify_selected: {e}")


@router.put("/applications/{app_id}/aptitude")
async def update_aptitude_score(
    app_id: str,
    score: float,
    cutoff: float = 60.0,
    current_user: UserInDB = Depends(get_current_tpo),
) -> Any:
    """TPO enters aptitude score; system emails student result + pass/fail."""
    db = get_database()
    passed = score >= cutoff
    new_status = "Aptitude Passed" if passed else "Aptitude Failed"

    await db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"aptitude_score": score, "aptitude_cutoff": cutoff, "status": new_status}},
    )
    app = await db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app["id"] = str(app.pop("_id"))

    asyncio.create_task(_notify_aptitude(db, app, score, cutoff, passed))
    return app


async def _notify_aptitude(db, app: dict, score: float, cutoff: float, passed: bool):
    try:
        user = await db["users"].find_one({"_id": ObjectId(app["student_id"])})
        drive = await db["drives"].find_one({"_id": ObjectId(app["drive_id"])})
        if user and drive:
            html = build_aptitude_result_email(
                student_name=user.get("name", "Student"),
                company=drive.get("company_name", ""),
                score=score,
                cutoff=cutoff,
                passed=passed,
            )
            subject = (
                f"✅ Aptitude Passed – {drive.get('company_name')} | PlacementPro"
                if passed else
                f"📊 Aptitude Results – {drive.get('company_name')} | PlacementPro"
            )
            await send_email([user["email"]], subject, html)
    except Exception as e:
        print(f"[EMAIL ERROR] _notify_aptitude: {e}")


@router.put("/applications/{app_id}/schedule")
async def schedule_interview(
    app_id: str,
    interview_time: str,
    status: str = "Interview Scheduled",
    current_user: UserInDB = Depends(get_current_tpo),
) -> Any:
    db = get_database()
    parsed_time = datetime.fromisoformat(interview_time)
    await db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"interview_time": parsed_time, "status": status}}
    )
    app = await db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app["id"] = str(app.pop("_id"))
    if app.get("interview_time"):
        app["interview_time"] = app["interview_time"].isoformat()
    return app


@router.delete("/expired")
async def delete_expired_drives(current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    now = datetime.utcnow()
    result = await db["drives"].delete_many({"drive_date": {"$lt": now}})
    return {"status": "success", "deleted_count": result.deleted_count}


@router.delete("/{drive_id}")
async def delete_drive(drive_id: str, current_user: UserInDB = Depends(get_current_tpo)) -> Any:
    db = get_database()
    result = await db["drives"].delete_one({"_id": ObjectId(drive_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {"status": "deleted", "drive_id": drive_id}
