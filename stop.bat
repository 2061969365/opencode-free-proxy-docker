@echo off
setlocal enabledelayedexpansion
set PORT=4096
for /f "tokens=2 delims=:" %%a in ('findstr /R "\"port\"" config\settings.json 2^>nul') do (
  set TMP=%%a
  set TMP=!TMP: =!
  set TMP=!TMP:,=!
  set TMP=!TMP:"=!
  if not "!TMP!"=="" set PORT=!TMP!
)
set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R ":%PORT% .*LISTENING"') do (
  tasklist /FI "PID eq %%p" 2>nul | findstr /I "node.exe" >nul
  if !errorlevel! equ 0 (
    echo Stopping node PID %%p on port %PORT%
    taskkill /f /pid %%p >nul 2>&1
    set FOUND=1
  )
)
if %FOUND%==0 echo No node process found on port %PORT%
echo OpenCode Free Proxy stopped
timeout /t 2 >nul
