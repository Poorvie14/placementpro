@echo off
echo ===================================================
echo   PlacementPro - Startup Script
echo ===================================================
echo.

:: Check if the backend virtual environment exists. If not, we need to run setup.
if not exist "backend\venv" (
    echo [SETUP 1/3] Python Virtual Environment not found. Setting up in /backend...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    
    echo.
    echo [SETUP 2/3] Installing Backend Dependencies...
    pip install fastapi uvicorn motor python-jose[cryptography] pydantic pydantic-settings email-validator python-multipart "passlib[bcrypt]" "bcrypt==4.0.1" python-dotenv
    
    echo.
    echo [SETUP 2.5/3] Seeding the MongoDB database with demo data...
    python seed.py
    cd ..
    
    echo.
    echo [SETUP 3/3] Installing Frontend NPM Dependencies...
    cd frontend
    call npm install
    cd ..
    
    echo.
    echo ===================================================
    echo Setup Complete! 
    echo ===================================================
) else (
    echo Setup already detected. Skipping initial installation...
)

echo.
echo Starting FastAPI Backend...
start "PlacementPro Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting React Vite Frontend...
start "PlacementPro Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Backend API: http://localhost:8000
echo - Frontend UI: http://localhost:5173
echo.
echo Make sure MongoDB is running locally on your machine.
echo You can close this window now. The servers will continue running in their respective windows.
pause
