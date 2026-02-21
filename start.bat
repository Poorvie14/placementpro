@echo off
echo ===================================================
echo   Starting PlacementPro Servers
echo ===================================================
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
echo You can close this window now. The servers will continue running in their respective windows.
pause
