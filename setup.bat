@echo off
echo ===================================================
echo   PlacementPro - Initial Setup Script
echo ===================================================
echo.

echo [1/3] Setting up Python Virtual Environment in /backend...
cd backend
python -m venv venv
call venv\Scripts\activate

echo.
echo [2/3] Installing Backend Dependencies...
pip install fastapi uvicorn motor pyjwt pydantic python-multipart passlib[bcrypt] python-dotenv

echo.
echo [2.5/3] Seeding the MongoDB database with demo data...
python seed.py
cd ..

echo.
echo [3/3] Installing Frontend NPM Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ===================================================
echo Setup Complete! 
echo Make sure MongoDB is running on your machine.
echo You can now use start.bat to launch the application.
echo ===================================================
pause
