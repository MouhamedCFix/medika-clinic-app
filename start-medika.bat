@echo off
title MEDIKA - Clinic Reception & Spreadsheet System
color 0A

echo ======================================================================
echo           MEDIKA CLINIC - RECEPTION & SPREADSHEET SYSTEM
echo ======================================================================
echo.
echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js was not found on your system!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)

echo [2/3] Launching Local Backend Server & Frontend...
echo Database: data\clinic.db (Local SQLite)
echo URL:      http://localhost:3000
echo.

:: Start server and client concurrently
start /b cmd /c "node server/index.js"
start /b cmd /c "npm --prefix client run dev"

echo [3/3] Opening Google Chrome...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ======================================================================
echo  SYSTEM RUNNING! Keep this window open while using the reception app.
echo  Press Ctrl+C or close this window to exit.
echo ======================================================================
echo.

pause
