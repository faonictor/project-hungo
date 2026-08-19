@echo off
chcp 65001 > nul
title Hungo - Encerrar Sistema

echo =======================================================
echo          HUNGO - ENCERRANDO SERVICOS
echo =======================================================
echo.
echo Finalizando processos do Backend (porta 8080) e Frontend (porta 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Encerrando processo na porta 8080 (PID: %%a)...
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Encerrando processo na porta 3000 (PID: %%a)...
    taskkill /F /PID %%a 2>nul
)
echo.
echo =======================================================
echo Servicos finalizados com sucesso!
echo =======================================================
pause
