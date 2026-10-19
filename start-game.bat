@echo off
setlocal
cd /d "%~dp0"

set "NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE=%ProgramFiles%\nodejs\node.exe"
  ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
  ) else (
    echo Node.js is required. Install the LTS version from https://nodejs.org/
    pause
    exit /b 1
  )
)

start "Tower Trials Server" cmd /k ""%NODE%" backend\server.js"
timeout /t 2 /nobreak >nul
start "" http://localhost:3000