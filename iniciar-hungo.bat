@echo off
chcp 65001 > nul
title Hungo - Inicializador do Sistema

echo =======================================================
echo          HUNGO - SISTEMA DE GESTAO E PDV
echo =======================================================
echo.
echo [1/3] Verificando dependencias necessarias...

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Java nao foi encontrado no PATH do sistema.
    echo Por favor, instale o Java (JDK 17 ou superior) para executar o backend.
    echo.
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no PATH do sistema.
    echo Por favor, instale o Node.js para executar o frontend.
    echo.
    pause
    exit /b 1
)

echo [OK] Java e Node.js detectados com sucesso.
echo.
echo [2/3] Iniciando o Backend (Spring Boot na porta 8080)...
start "Hungo - Backend (Spring Boot)" cmd /k "cd /d "%~dp0hungo-spring" && echo ======================================== && echo   INICIANDO BACKEND (PORTA 8080) && echo ======================================== && (mvnw.cmd spring-boot:run 2>nul || mvn spring-boot:run)"

echo.
echo [3/3] Iniciando o Frontend (Novo Front - hungo-front)...
start "Hungo - Frontend (Vite / React)" cmd /k "cd /d "%~dp0hungo-front" && echo ======================================== && echo   INICIANDO FRONTEND (NOVO FRONT) && echo ======================================== && npm run dev -- --open"

echo.
echo =======================================================
echo   Sistema Hungo iniciado em janelas dedicadas de terminal!
echo =======================================================
echo.
echo   - Backend API : http://localhost:8080
echo   - Frontend UI : http://localhost:3000 (ou porta indicada pelo Vite)
echo.
echo   Dica: Para parar a aplicacao, basta fechar as duas
echo   janelas de terminal do Backend e Frontend ou executar
echo   o script parar-hungo.bat.
echo =======================================================
echo.
pause
