@echo off
title Digital Code Store - Email Automation Tool
color 0B

echo ========================================================
echo    DIGITAL CODE STORE - CONG CU GUI EMAIL TU DONG
echo ========================================================
echo.

REM Kiem tra file Python
if not exist "Auto_Send_Email.py" (
    echo [LOI] Khong tim thay file Auto_Send_Email.py
    echo Vui long dat file nay cung thu muc voi file .bat
    pause
    exit /b 1
)

echo Dang khoi dong chuong trinh...
echo.

python Auto_Send_Email.py

if errorlevel 1 (
    echo.
    echo ========================================================
    echo                       LOI!
    echo ========================================================
    echo.
    echo Chuong trinh bi loi. Vui long kiem tra:
    echo   1. Da cai dat Python chua?
    echo   2. Da cai dat thu vien Pillow chua?
    echo   3. Chay file install_requirements.bat truoc
    echo.
)

pause