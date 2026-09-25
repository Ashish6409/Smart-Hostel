@echo off
echo ========================================================
echo   SMART HOSTEL MANAGEMENT SYSTEM - LAUNCHER
echo ========================================================
echo.

echo Starting Node.js Backend API on port 5000...
start "Smart Hostel Backend" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting React Vite Frontend on port 3000...
start "Smart Hostel Frontend" cmd /k "cd client && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Python ML Mess Demand Engine on port 8001...
start "Smart Hostel ML Engine" cmd /k "cd ml_service && py -m uvicorn app:app --port 8001 --reload"

echo.
echo ========================================================
echo System ready! Access the application at:
echo http://localhost:3000
echo ========================================================
