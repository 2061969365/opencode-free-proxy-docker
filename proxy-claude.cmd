@echo off
title OpenCode Free Proxy - Claude Code

REM === ANTHROPIC_BASE_URL must NOT include /v1 ===
REM === Claude Code appends /v1/messages itself  ===
SET ANTHROPIC_AUTH_TOKEN=
SET ANTHROPIC_API_KEY=sk-ant-api03-proxy-opencode-free-000000000000000000000000000000000000000000000000000000-000000000AA
SET ANTHROPIC_BASE_URL=http://127.0.0.1:4096

echo ============================================
echo   OpenCode Free Proxy - Claude Code
echo ============================================
echo [Proxy] BASE_URL=%ANTHROPIC_BASE_URL%
echo [Proxy] Starting Claude Code through proxy...
echo.
claude %*
