from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_config = Database()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db_config.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_config.db = db_config.client.get_database()
    logging.info("Connected to MongoDB!")

async def close_mongo_connection():
    logging.info("Closing MongoDB connection...")
    if db_config.client:
        db_config.client.close()
    logging.info("MongoDB connection closed!")

def get_database():
    return db_config.db
