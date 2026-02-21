from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app.api.deps import get_current_user, get_current_alumni, get_current_student
from app.models.user import UserInDB
from app.core.database import get_database
from bson import ObjectId
from app.models.core import MentorshipSlotCreate, MentorshipSlotInDB

router = APIRouter()

@router.post("/", response_model=MentorshipSlotInDB)
async def create_slot(slot_in: MentorshipSlotCreate, current_user: UserInDB = Depends(get_current_alumni)) -> Any:
    db = get_database()
    slot_dict = slot_in.model_dump()
    slot_dict["alumni_id"] = str(current_user.id)
    result = await db["mentorship_slots"].insert_one(slot_dict)
    created_slot = await db["mentorship_slots"].find_one({"_id": result.inserted_id})
    return MentorshipSlotInDB.from_mongo(created_slot)

@router.get("/", response_model=List[MentorshipSlotInDB])
async def list_slots(current_user: UserInDB = Depends(get_current_user)) -> Any:
    db = get_database()
    cursor = db["mentorship_slots"].find({})
    slots = await cursor.to_list(length=100)
    return [MentorshipSlotInDB.from_mongo(s) for s in slots]

@router.put("/{slot_id}/book")
async def book_slot(slot_id: str, current_user: UserInDB = Depends(get_current_student)) -> Any:
    db = get_database()
    slot = await db["mentorship_slots"].find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.get("is_booked"):
        raise HTTPException(status_code=400, detail="Slot already booked")

    await db["mentorship_slots"].update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"is_booked": True, "booked_by_student_id": str(current_user.id)}}
    )

    updated_slot = await db["mentorship_slots"].find_one({"_id": ObjectId(slot_id)})
    return MentorshipSlotInDB.from_mongo(updated_slot)
