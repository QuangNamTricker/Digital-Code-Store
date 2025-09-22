@echo off
:: ======================================================
:: 🚀 Digital Code Store Git Tool
:: Copyright By Từ Quang Nam
:: Version: 1.0.1
:: ======================================================

:: Set màu mặc định (Xanh dương chữ trắng)
color 1F

:: Clear màn hình
cls

:: Hiện header
echo =====================================================
echo   🚀 DIGITAL CODE STORE - GIT TOOL
echo   ---------------------------------
echo   Copyright By Từ Quang Nam
echo   Version: 1.0.1
echo =====================================================
echo.

:: [1/5] Check trạng thái
echo [1/5] Checking Git status...
git status
echo.
set /p choice=❓ Ban co muon tiep tuc commit + push khong? (Y/N): 
if /I "%choice%" NEQ "Y" (
    echo ❌ Da huy thao tac.
    pause
    exit /b
)

:: [2/5] Auto tạo commit message
setlocal enabledelayedexpansion

:: File lưu số lần commit
set counterFile=commit-counter.txt
if not exist %counterFile% (
    echo 0 > %counterFile%
)

:: Đọc số commit
set /p commitCount=<%counterFile%
set /a commitCount+=1
echo %commitCount% > %counterFile%

:: Lấy ngày giờ
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set ngay=%%a-%%b-%%c
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set gio=%%a-%%b
)

set commitMsg=Digital Code Store - Commit #%commitCount% - %ngay% %gio%

echo [2/5] Auto commit message tao ra:
echo    "%commitMsg%"
echo.

:: [3/5] Add file
echo [3/5] Adding all files...
git add .
echo.

:: [4/5] Commit
echo [4/5] Committing...
git commit -m "%commitMsg%"
echo.

:: [5/5] Push
echo [5/5] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    color 4F
    echo.
    echo ❌ Push failed!
    pause
    exit /b
)

:: Ghi log
echo [%date% %time%] %commitMsg% >> commit-history.txt

:: Thong bao thanh cong
color 2F
echo.
echo =====================================================
echo ✅ Push thanh cong!
echo 📂 Log da luu vao commit-history.txt
echo 🌍 Dang mo repo tren trinh duyet...
echo =====================================================
echo.

:: Mo repo tren trinh duyet
start https://github.com/QuangNamTricker/Digital-Code-Store

pause
exit
