from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler, ConfigDict
from pydantic_core import core_schema
from typing import Optional, Any
from enum import Enum
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


class RoleEnum(str, Enum):
    TPO = "TPO"
    STUDENT = "STUDENT"
    ALUMNI = "ALUMNI"


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: RoleEnum


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="ignore",
    )
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str


class UserResponse(UserBase):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )
    id: str = Field(alias="_id", default="")

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserResponse":
        return cls(
            id=str(doc["_id"]),
            email=doc["email"],
            name=doc["name"],
            role=doc["role"],
        )


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
