import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.security import get_password_hash

# Since the user didn't provide their actual password in the snippet, we'll prompt them for the full url 
# or use the one they set in Render. 
# WE DO NOT WANT TO COMMIT A REAL ATLAS URL HERE
url = sys.argv[1] if len(sys.argv) > 1 else None
if not url:
    print("Error: Missing MongoDB URL. Provide it as an argument: python seed_atlas.py <url>")
    sys.exit(1)

async def seed_db():
    print(f"Connecting to Atlas...")
    client = AsyncIOMotorClient(url)
    db = client.get_database("placementpro")
    
    print("Clearing users collection...")
    await db["users"].delete_many({})
    
    print("Inserting Demo Users...")
    users = [
        {"email": "tpo@college.edu", "name": "Admin Officer", "role": "TPO", "hashed_password": get_password_hash("password123")},
        {"email": "student1@college.edu", "name": "John Doe", "role": "STUDENT", "hashed_password": get_password_hash("password123")},
        {"email": "alumni1@college.edu", "name": "Mark Alumni", "role": "ALUMNI", "hashed_password": get_password_hash("password123")}
    ]
    await db["users"].insert_many(users)
    
    print("Seeding Complete. You can now login with student1@college.edu / password123")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
