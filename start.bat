@echo off
cd /d "%~dp0"
title OpenCode Free Proxy
set HTTP_PROXY=http://127.0.0.1:10809
set HTTPS_PROXY=http://127.0.0.1:10809
REM Check if port in use
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":4096" ^| findstr "LISTENING"') do (
  echo [WARN] Port 4096 already in use by PID %%p
  tasklist /FI "PID eq %%p" 2>nul
  echo Use stop.bat first or change config/settings.json
  pause
  exit /b 1
)
start "OpenCodeFreeProxy" /min node --use-env-proxy server.js
echo OpenCode Free Proxy started on http://127.0.0.1:4096
timeout /t 2 >nul
