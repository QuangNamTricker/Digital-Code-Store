@echo off
REM ================================
REM Auto Git Commit + Push Script
REM ================================

:: Nhập message cho commit
set /p msg=Nhap commit message: 

echo.
echo 🔄 Adding all files...
git add .

echo.
echo 📝 Committing...
git commit -m "%msg%"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Done!
pause
