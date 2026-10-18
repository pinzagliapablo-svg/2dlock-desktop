@echo off
setlocal
cd /d "%~dp0"
echo =============================================
echo  2Dlock - CREA INSTALLER WINDOWS
 echo =============================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js non trovato. Installa Node.js LTS da https://nodejs.org e riapri questo file.
  pause
  exit /b 1
)
if not exist package-lock.json (
  echo Installazione delle dipendenze e creazione lockfile...
  call npm install
) else (
  echo Installazione dipendenze...
  call npm ci
)
if errorlevel 1 goto error
call npm run dist:win
if errorlevel 1 goto error
echo.
echo Build completata. Cerca il file Setup nella cartella dist.
pause
exit /b 0
:error
echo.
echo Build non riuscita. Controlla i messaggi sopra.
pause
exit /b 1
