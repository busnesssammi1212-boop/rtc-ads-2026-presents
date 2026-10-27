@echo off
setlocal
title Upload to GitHub
cd /d "%~dp0"

set REPO=https://github.com/busnesssammi1212-boop/rtc-ads-2026-presents.git
set BRANCH=main

where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed. Download it from https://git-scm.com/download/win and run this file again.
  pause
  exit /b 1
)

if not exist ".git" (
  echo Initializing git...
  git init
)
git branch -M %BRANCH%

rem Git needs a name and email to create a commit
for /f "delims=" %%i in ('git config user.name') do set GNAME=%%i
for /f "delims=" %%i in ('git config user.email') do set GMAIL=%%i
if not defined GNAME git config user.name "busnesssammi1212-boop"
if not defined GMAIL git config user.email "busnesssammi1212-boop@users.noreply.github.com"

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin %REPO%
) else (
  git remote set-url origin %REPO%
)

echo.
echo Adding all files (.gitignore bypassed)...
rem node_modules, .next and .env.local are excluded on purpose (huge / secret keys).
git add -A -f -- . ":(exclude)node_modules" ":(exclude).next" ":(exclude).env.local" ":(exclude).env"
if errorlevel 1 (
  echo.
  echo git add failed. Make sure this file is inside the project folder.
  pause
  exit /b 1
)

echo.
echo Files to be uploaded:
git status --short
echo.

git commit -m "Upload all files"
git rev-parse --verify HEAD >nul 2>nul
if errorlevel 1 (
  echo.
  echo No commit was created, so there is nothing to push.
  echo Read the message above. Is this file inside the folder that has package.json?
  pause
  exit /b 1
)

echo.
echo Pushing...
git push -u origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Normal push was rejected because GitHub has other files from a web upload.
  echo Your local folder is the correct one, so replacing GitHub with it now...
  git push -u origin %BRANCH% --force
  if errorlevel 1 (
    echo.
    echo Push failed. Check: 1^) the GitHub login popup was completed, 2^) your account can write to the repo.
    pause
    exit /b 1
  )
)

echo.
echo Done! Upload complete: %REPO%
pause
