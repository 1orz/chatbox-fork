@echo off
REM Launch the win-unpacked Chatbox build with DevTools and inspector ports enabled.
REM
REM Usage:
REM   1. Build first:  pnpm run build && npx electron-builder build --publish never -c.npmRebuild=false --win
REM   2. Double-click this script (or run it from a terminal)
REM
REM Inspector endpoints exposed:
REM   - F12 / Ctrl+Shift+I             open Chromium DevTools inside the app window
REM   - http://localhost:9222           Chromium DevTools Protocol (renderer)
REM   - chrome://inspect -> 9229        Node.js inspector (main process)

setlocal

set REPO_ROOT=%~dp0..
set UNPACKED=%REPO_ROOT%\release\build\win-unpacked\Chatbox.exe

if not exist "%UNPACKED%" (
    echo.
    echo [debug-unpacked] Cannot find the unpacked binary at:
    echo     %UNPACKED%
    echo.
    echo Build it first with:
    echo     pnpm run build
    echo     npx electron-builder build --publish never -c.npmRebuild=false --win
    echo.
    pause
    exit /b 1
)

set DEBUG_PROD=true
start "" "%UNPACKED%" --inspect=9229 --remote-debugging-port=9222
