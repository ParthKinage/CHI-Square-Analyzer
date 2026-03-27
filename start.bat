@echo off
title Chi-Square Analyzer
echo ============================================
echo    Chi-Square Goodness-of-Fit Analyzer
echo    Engineering Mathematics IV - VIT Mumbai
echo ============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo       Done!
)

:: Activate and install dependencies
echo [2/3] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done!

:: Create screenshots directory
if not exist "static\screenshots" mkdir static\screenshots

:: Launch the application
echo [3/3] Starting server...
echo.
echo ============================================
echo    App running at: http://localhost:5000
echo    Press Ctrl+C to stop the server
echo ============================================
echo.
python app.py
pause
