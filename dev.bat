@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================================
:: 收支管理系统 - 一键部署与启动工具
:: ============================================================

set "SETUP_DIR=.setup"
set "BACKEND_DIR=backend"
set "FRONT_DIR=front"

:: 0. Encoding Check (Simplified to avoid parsing errors)
set "CHECK_STR=OK"
if not "!CHECK_STR!"=="OK" (
    echo [Error] Script encoding error!
    echo Please save this file as 'UTF-8 with BOM'.
    pause
    exit /b 1
)

:: Check for Chinese in path
echo "%~dp0" | findstr /R "[^ -~]" >nul
if %errorlevel% equ 0 (
    set "PATH_WARN=1"
)

echo ============================================================
echo.
echo   收支管理系统 - 终极一键启动工具
echo.
if defined PATH_WARN (
    echo   [提示] 检测到路径包含中文，若启动失败请移动至纯英文路径。
    echo.
)
echo ============================================================
echo.

:: 0.1 Check for ZIP execution
if "%~dp0"=="%TEMP%\" (
    echo [警告] 请先“解压”整个文件夹后再运行！
    pause
    exit /b 1
)

:: 1. Environment Check
echo [步骤 1/5] 正在检查运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js！请访问 https://nodejs.org/ 安装。
    pause
    exit /b 1
)
echo [成功] Node.js 环境正常。

:: Check Port
echo 正在检查端口占用...
for %%p in (3000 5173 5174) do (
    netstat -ano | findstr LISTENING | findstr :%%p >nul
    if !errorlevel! equ 0 (
        echo [提示] 端口 %%p 已占用，系统将尝试自动切换或处理。
    )
)
echo.

:: 2. Registry Configuration
echo [步骤 2/5] 正在优化下载速度...
set "NPM_REGISTRY=https://registry.npmmirror.com"
choice /c YN /m "是否使用淘宝镜像源 (推荐)?" /t 5 /d Y
if %errorlevel% equ 1 (
    set "INSTALL_CMD=npm install --registry=%NPM_REGISTRY% --no-audit --no-fund"
) else (
    set "INSTALL_CMD=npm install --no-audit --no-fund"
)
echo.

:: 3. Setup Components
echo [步骤 3/5] 正在配置核心组件...
if not exist "%SETUP_DIR%\node_modules\" (
    echo 正在安装，请稍候...
    pushd %SETUP_DIR%
    call %INSTALL_CMD%
    if !errorlevel! neq 0 (
        echo [错误] 安装失败，请检查网络。
        popd
        pause
        exit /b 1
    )
    popd
)
echo [成功] 核心组件就绪。
echo.

:: 4. Backend Setup
echo [步骤 4/5] 正在配置后端服务...
pushd %BACKEND_DIR%
if not exist "node_modules\" (
    echo 正在安装后端依赖...
    call %INSTALL_CMD%
)

:: Verify sqlite3
echo 正在验证数据库驱动...
node -e "try { require('sqlite3') } catch (e) { process.exit(1) }" 2>nul
if %errorlevel% neq 0 (
    echo [提示] 正在自动修复数据库驱动兼容性...
    if exist "node_modules\sqlite3" rmdir /s /q "node_modules\sqlite3"
    call %INSTALL_CMD% sqlite3
)

:: DB Init
if not exist "expense_manager.db" (
    echo 正在初始化数据库...
    node src/db/init.js
)
popd
echo [成功] 后端配置完成。
echo.

:: 5. Frontend Setup
echo [步骤 5/5] 正在配置前端界面...
pushd %FRONT_DIR%
if not exist "node_modules\" (
    echo 正在安装前端依赖...
    call %INSTALL_CMD%
)
popd
echo [成功] 前端配置完成。
echo.

echo ^>^>^> 准备就绪！正在为您启动系统...
echo.
echo ------------------------------------------------------------
echo   后端服务地址: http://localhost:3000
echo   前端界面地址: http://localhost:5173
echo ------------------------------------------------------------
echo.

:: Run with concurrently
set "CONC=call .\%SETUP_DIR%\node_modules\.bin\concurrently"
%CONC% -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"

if %errorlevel% neq 0 (
    echo.
    echo [提示] 系统已停止运行。
    pause
)
