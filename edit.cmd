@echo off
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 (
    echo Install Node.js 22 or newer, then reopen this launcher.
    pause
    exit /b 1
)
echo Opening the website editor at http://localhost:8791/editor/
echo Keep this window open while editing. Press Ctrl+C to stop.
node server.mjs --edit
pause
