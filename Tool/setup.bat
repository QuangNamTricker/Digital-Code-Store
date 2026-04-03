@echo off
title Cài đặt thư viện cho Email Automation Tool - Digital Code Store
color 0A

echo ========================================================
echo    DIGITAL CODE STORE - CAI DAT THU VIEN CHO TOOL EMAIL
echo ========================================================
echo.

echo [1/3] Kiem tra Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [LOI] Khong tim thay Python. Vui long cai dat Python truoc!
    echo Truy cap: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Da tim thay Python
echo.

echo [2/3] Nang cap pip len phien ban moi nhat...
python -m pip install --upgrade pip
echo.

echo [3/3] Cai dat thu vien Pillow (xu ly anh)...
pip install Pillow
echo.

echo ========================================================
echo    CAI DAT HOAN TAT!
echo ========================================================
echo.
echo Da cai dat cac thu vien:
echo   - Pillow (xu ly anh, hien thi banner)
echo.
echo Chay chuong trinh bang lenh: python ten_file.py
echo.
pause