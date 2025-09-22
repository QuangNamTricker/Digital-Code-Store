@echo off
:: ======================================================
:: 🚀 Digital Code Store Git Tool
:: Copyright By Từ Quang Nam
:: Version: 1.0.2
:: ======================================================

:: Bật ANSI escape code
for /f "tokens=2 delims=: " %%a in ('reg query HKEY_CURRENT_USER\Console ^| find "VirtualTerminalLevel"') do set vt=%%a
if not defined vt (
    reg add HKEY_CURRENT_USER\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul
)

:: Định nghĩa màu (ANSI)
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
echo %YELLOW% Version: 1.0.2 %RESET%
echo =====================================================
echo.

:: [1/5] Check trạng thái
echo %BLUE%[1/5] Checking Git status...%RESET%
git status
echo.
set /p choice=❓ %YELLOW%Bạn có muốn tiếp tục commit + push không? (Y/N): %RESET%
if /I "%choice%" NEQ "Y" (
    echo %RED%❌ Đã huỷ thao tác.%RESET%
    echo.
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

echo %BLUE%[2/5] Auto commit message tạo ra:%RESET%
echo    %GREEN%"%commitMsg%"%RESET%
echo.

:: [3/5] Add file
echo %BLUE%[3/5] Adding all files...%RESET%
git add .
echo.

:: [4/5] Commit
echo %BLUE%[4/5] Committing...%RESET%
git commit -m "%commitMsg%"
echo.

:: [5/5] Push
echo %BLUE%[5/5] Pushing to GitHub...%RESET%
git push origin main
if errorlevel 1 (
    echo.
    echo %RED%❌ Push failed!%RESET%
    echo.
    pause
    exit /b
)

:: Ghi log
echo [%date% %time%] %commitMsg% >> commit-history.txt

:: Thông báo thành công
echo.
echo =====================================================
echo %GREEN%✅ Push thành công!%RESET%
echo %CYAN%📂 Log đã lưu vào commit-history.txt%RESET%
echo %CYAN%🌍 Repo sẽ mở trên trình duyệt...%RESET%
echo =====================================================
echo.

:: Mở repo
start https://github.com/QuangNamTricker/Digital-Code-Store

:: Tạo khoảng trống trước khi đóng tool
echo.
echo.
pause
exit
