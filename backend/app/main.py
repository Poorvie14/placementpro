from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.endpoints import auth, drives, students, jobs, mentorship, tpo, ai

app = FastAPI(title=settings.PROJECT_NAME)

# Determine allowed origins from settings or default to wide-open for easy deployment
origins_str = getattr(settings, "ALLOW_ORIGINS", "http://localhost:5173,http://localhost:5174,*")
allowed_origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(drives.router, prefix=f"{settings.API_V1_STR}/drives", tags=["drives"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["students"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])
app.include_router(mentorship.router, prefix=f"{settings.API_V1_STR}/mentorship", tags=["mentorship"])
app.include_router(tpo.router, prefix=f"{settings.API_V1_STR}/tpo", tags=["tpo"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to PlacementPro API"}

# ── Static Frontend Serving for Deployment ──
# If the 'dist' folder exists, mount it so FastAPI serves the React app
frontend_dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(frontend_dist_path):
    # Mount the /assets/ folder explicitly
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

    # Serve the main index.html for the root route, overriding the API root
    @app.get("/", include_in_schema=False)
    @app.get("/{catchall:path}", include_in_schema=False)
    async def serve_react_app(request: Request, catchall: str = ""):
        # Ignore API calls dropping into the catchall
        if catchall.startswith(settings.API_V1_STR.strip('/')):
            return {"error": "API route not found"}
        
        # Check if the requested file exists (like favicon.ico, manifest.json)
        requested_file = os.path.join(frontend_dist_path, catchall)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
            
        # Fallback to index.html for React Router
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
