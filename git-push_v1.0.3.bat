@echo off
:: ======================================================
:: 🚀 Digital Code Store Git Tool
:: Copyright By Từ Quang Nam
:: Version: 1.0.3 (Stable Update)
:: ======================================================

:: [Khởi tạo màu sắc và UTF-8 giữ nguyên như cũ của Nam...]
chcp 65001 >nul
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set CYAN=[96m
set RESET=[0m

cls
echo =====================================================
echo %CYAN% 🚀 DIGITAL CODE STORE - GIT TOOL %RESET%
echo ---------------------------------
echo %YELLOW% Copyright By Từ Quang Nam %RESET%
echo %YELLOW% Version: 1.0.3 %RESET%
echo =====================================================

:: [BƯỚC 0] DỌN DẸP VÀ KIỂM TRA HỆ THỐNG
echo %BLUE%[0/5] Pre-checking system...%RESET%
:: Xóa file lock nếu tồn tại
del /f /q .git\index.lock >nul 2>&1
del /f /q .git\refs\remotes\origin\main.lock >nul 2>&1

:: Kiểm tra danh tính Git
git config user.name >nul 2>&1
if errorlevel 1 (
    echo %RED%⚠ Chưa thiết lập danh tính Git!%RESET%
    set /p gname=Nhập tên GitHub: 
    set /p gemail=Nhập email GitHub: 
    git config --global user.name "!gname!"
    git config --global user.email "!gemail!"
)

:: [1/5] CHECK STATUS & AUTO PULL
echo %BLUE%[1/5] Syncing with GitHub...%RESET%
git pull origin main
echo.
git status
echo.
set /p choice=❓ %YELLOW%Tiếp tục Commit + Push? (Y/N): %RESET%
if /I "%choice%" NEQ "Y" exit /b

:: [2/5] AUTO COMMIT MESSAGE (Giữ nguyên logic của Nam)
setlocal enabledelayedexpansion
set counterFile=commit-counter.txt
if not exist %counterFile% echo 0 > %counterFile%
set /p commitCount=<%counterFile%
set /a commitCount+=1
echo %commitCount% > %counterFile%

:: Lấy ngày giờ chuẩn hơn
set ngay=%date%
set gio=%time:~0,5%
set commitMsg=Digital Code Store - Commit #%commitCount% - %ngay% %gio%
echo %BLUE%[2/5] Message: %GREEN%"%commitMsg%"%RESET%

:: [3/5] ADD FILES
echo %BLUE%[3/5] Adding files...%RESET%
git add .
if errorlevel 1 (echo %RED%❌ Add failed!%RESET% & pause & exit /b)

:: [4/5] COMMIT
echo %BLUE%[4/5] Committing...%RESET%
git commit -m "%commitMsg%"
if errorlevel 1 (echo %RED%❌ Commit failed!%RESET% & pause & exit /b)

:: [5/5] PUSH
echo %BLUE%[5/5] Pushing to GitHub...%RESET%
git push origin main
if errorlevel 1 (
    echo %RED%❌ Push failed! Kiểm tra lại kết nối hoặc Token.%RESET%
    pause
    exit /b
)

:: KẾT THÚC
echo [%date% %time%] %commitMsg% >> commit-history.txt
echo =====================================================
echo %GREEN%✅ MỌI THỨ ĐÃ HOÀN TẤT!%RESET%
echo =====================================================
start https://github.com/QuangNamTricker/Digital-Code-Store
pause