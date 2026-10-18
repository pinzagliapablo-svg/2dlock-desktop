@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installa Node.js LTS da https://nodejs.org prima di avviare la versione di sviluppo.
  pause
  exit /b 1
)
if not exist package-lock.json (call npm install) else (call npm ci)
if errorlevel 1 (pause & exit /b 1)
call npm start
pause
