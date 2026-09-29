@echo off
title Smart Hostel System Starter
cd /d "%~dp0"

echo ========================================================
echo   STARTING SMART HOSTEL MANAGEMENT SYSTEM
echo ========================================================
echo.

echo [1/3] Starting Backend API on http://localhost:5000...
start "Smart Hostel Backend API (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend UI on http://localhost:3000...
start "Smart Hostel Frontend UI (Port 3000)" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Opening application in your browser...
start http://localhost:3000

echo.
echo ========================================================
echo   SYSTEM IS READY!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
