@echo off
echo Starting Pharmacy Management System Backend...
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause

