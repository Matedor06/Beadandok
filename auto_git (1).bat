@echo off
title Auto Git
pushd "%~dp0"

:begin
set /p selection="1. Push vagy 2. Pull > "
@REM set commit=
@REM set /p commit="Commit esetén commit message > "

if %selection%==1 (
    git add .
    git status
    goto :commitpush
) else if %selection%==2 (
    git pull
    goto :end
) else (
    echo Hibás választás!
    goto :begin
)

:commitpush
set /p commit="Commit message: "
git commit -m "%date% - %commit%"
:push
git push
if %errorlevel%==128 (goto :push)

:end
net helpmsg %errorlevel%
timeout 5 /nobreak > nul
exit /b %errorlevel%