@echo off
setlocal
echo =======================================================
echo          HUNGO - ENCERRANDO SERVICOS
echo =======================================================
echo.
echo Finalizando processos nas portas 8080 e 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Encerrando processo Backend PID %%a...
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Encerrando processo Frontend PID %%a...
    taskkill /F /PID %%a 2>nul
)
echo.
echo =======================================================
echo Servicos finalizados!
echo =======================================================
pause
