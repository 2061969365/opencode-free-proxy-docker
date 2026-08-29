@echo off
cd /d "%~dp0"
title OpenCode Free Proxy
set HTTP_PROXY=http://127.0.0.1:10809
set HTTPS_PROXY=http://127.0.0.1:10809
REM Check if port in use - also detect orphan node processes writing cache
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":4096" ^| findstr "LISTENING"') do (
  echo [WARN] Port 4096 already in use by PID %%p
  tasklist /FI "PID eq %%p" 2>nul
  echo Use stop.bat first or change config/settings.json
  pause
  exit /b 1
)
REM Also detect orphan node processes not listening but holding cache file
for /f "tokens=2" %%p in ('tasklist ^| findstr /I "node.exe"') do (
  echo [INFO] Existing node PID %%p will be kept, new instance checks port only
)
start "OpenCodeFreeProxy" /min node --use-env-proxy server.js
echo OpenCode Free Proxy started on http://127.0.0.1:4096
timeout /t 2 >nul
