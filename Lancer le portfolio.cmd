@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Lancer le portfolio.ps1"
if errorlevel 1 pause
