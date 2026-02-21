import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MONGO_URL = "mongodb://localhost:27017/placementpro"

async def seed_db():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_database()
    
    print("Clearing collections...")
    await db["users"].delete_many({})
    await db["student_profiles"].delete_many({})
    await db["drives"].delete_many({})
    
    print("Inserting Users...")
    users = [
        {"email": "tpo@college.edu", "name": "Admin Officer", "role": "TPO", "hashed_password": pwd_context.hash("password123")},
        {"email": "student1@college.edu", "name": "John Doe", "role": "STUDENT", "hashed_password": pwd_context.hash("password123")},
        {"email": "student2@college.edu", "name": "Jane Smith", "role": "STUDENT", "hashed_password": pwd_context.hash("password123")},
        {"email": "alumni1@college.edu", "name": "Mark Alumni", "role": "ALUMNI", "hashed_password": pwd_context.hash("password123")}
    ]
    user_docs = await db["users"].insert_many(users)
    
    print("Inserting Student Profiles...")
    profiles = [
        {"user_id": str(user_docs.inserted_ids[1]), "cgpa": 8.5, "backlogs": 0, "branch": "CSE", "passing_year": 2024, "skills": ["React", "Python", "SQL"]},
        {"user_id": str(user_docs.inserted_ids[2]), "cgpa": 7.2, "backlogs": 1, "branch": "ECE", "passing_year": 2024, "skills": ["C++", "Java", "IoT"]}
    ]
    await db["student_profiles"].insert_many(profiles)
    
    print("Inserting Drives...")
    drives = [
        {"company_name": "Google", "role": "Software Engineer", "description": "L3 SWE Role", "min_cgpa": 8.0, "max_backlogs": 0, "eligible_branches": ["CSE", "IT"], "passing_year": 2024, "salary_pkg": "30 LPA", "drive_date": "2024-05-10T10:00:00Z"},
        {"company_name": "TCS", "role": "System Engineer", "description": "Mass Hiring", "min_cgpa": 6.0, "max_backlogs": 2, "eligible_branches": ["CSE", "IT", "ECE", "MECH"], "passing_year": 2024, "salary_pkg": "7 LPA", "drive_date": "2024-04-15T09:00:00Z"}
    ]
    await db["drives"].insert_many(drives)
    
    print("Seeding Complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
