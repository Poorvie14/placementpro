from pydantic import BaseModel, Field, GetCoreSchemaHandler, ConfigDict
from pydantic_core import core_schema
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler):
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if ObjectId.is_valid(str(v)):
            return ObjectId(str(v))
        raise ValueError("Invalid ObjectId")


# ── Drive Models ────────────────────────────────────────────────────────────

class PlacementDriveBase(BaseModel):
    company_name: str
    role: str
    description: str
    min_cgpa: float
    max_backlogs: int
    eligible_branches: List[str]
    passing_year: int
    salary_pkg: str
    drive_date: datetime

class PlacementDriveCreate(PlacementDriveBase):
    pass

class PlacementDriveInDB(PlacementDriveBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, extra="ignore")
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict) -> "PlacementDriveInDB":
        return cls(**doc)


# ── Application Models ──────────────────────────────────────────────────────

class ApplicationBase(BaseModel):
    drive_id: str
    student_id: str
    status: str = "Applied"
    interview_time: Optional[datetime] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationInDB(ApplicationBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, extra="ignore")
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")


# ── Job Post Models ─────────────────────────────────────────────────────────

class JobPostBase(BaseModel):
    alumni_id: str = ""   # set server-side from token; optional from client
    title: str
    company: str
    location: str
    domain: str
    description: str
    apply_link: str

class JobPostCreate(JobPostBase):
    pass

class JobPostInDB(JobPostBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, extra="ignore")
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict) -> "JobPostInDB":
        return cls(**doc)


# ── Mentorship Slot Models ──────────────────────────────────────────────────

class MentorshipSlotBase(BaseModel):
    alumni_id: str = ""   # set server-side from token
    start_time: datetime
    end_time: datetime
    is_booked: bool = False
    booked_by_student_id: Optional[str] = None

class MentorshipSlotCreate(MentorshipSlotBase):
    pass

class MentorshipSlotInDB(MentorshipSlotBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, extra="ignore")
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict) -> "MentorshipSlotInDB":
        return cls(**doc)
