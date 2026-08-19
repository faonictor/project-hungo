@echo off
setlocal
cd /d "%~dp0"
set "ROOT=%~dp0"

echo =======================================================
echo          HUNGO - SISTEMA DE GESTAO E PDV
echo =======================================================
echo.
echo [1/3] Verificando dependencias necessarias...

where java >nul 2>nul
if errorlevel 1 goto NO_JAVA

where node >nul 2>nul
if errorlevel 1 goto NO_NODE

echo [OK] Java e Node.js detectados com sucesso.
echo.
echo [2/3] Iniciando o Backend (Spring Boot na porta 8080)...
start "Hungo - Backend" cmd /k "cd /d "%ROOT%hungo-spring" && echo ======================================== && echo   BACKEND SPRING BOOT (PORTA 8080) && echo ======================================== && mvnw.cmd spring-boot:run"

echo.
echo [3/3] Iniciando o Frontend (Vite / React)...
start "Hungo - Frontend" cmd /k "cd /d "%ROOT%hungo-front" && echo ======================================== && echo   FRONTEND VITE (REACT) && echo ======================================== && npm run dev -- --host --open"

echo.
echo =======================================================
echo   Sistema Hungo iniciado em janelas dedicadas!
echo =======================================================
echo.
echo   - Backend API : http://localhost:8080
echo   - Frontend UI : http://localhost:3000 (abrindo navegador...)
echo.
echo   Para parar o sistema, feche as janelas abertas ou
echo   execute o arquivo parar-hungo.bat
echo =======================================================
echo.
pause
exit /b 0

:NO_JAVA
echo [ERRO] Java nao foi encontrado no PATH do sistema.
echo Certifique-se de que o JDK 17 ou superior esta instalado.
echo.
pause
exit /b 1

:NO_NODE
echo [ERRO] Node.js nao foi encontrado no PATH do sistema.
echo Certifique-se de que o Node.js esta instalado.
echo.
pause
exit /b 1
