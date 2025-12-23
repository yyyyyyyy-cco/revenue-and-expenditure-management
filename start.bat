@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================================
:: 收支管理系统 - 一键快速启动脚本
:: ============================================================

set "SETUP_DIR=.setup"
set "BACKEND_DIR=backend"
set "FRONT_DIR=front"
set "NPM_REGISTRY=https://registry.npmmirror.com"

:: Encoding sanity check
set "CHECK_STR=OK"
if not "%CHECK_STR%"=="OK" (
    echo [Error] 脚本编码异常，请使用 UTF-8 with BOM。
    pause
    exit /b 1
)

echo ============================================================
echo   收支管理系统 - 一键启动
echo ============================================================
echo [步骤 1/4] 正在检查运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装后再运行。
    pause
    exit /b 1
)
echo [成功] Node.js 环境就绪。

echo [步骤 2/4] 正在准备依赖组件...
choice /c YN /m "是否使用淘宝镜像源 (推荐)?" /t 5 /d Y >nul
if %errorlevel% equ 1 (
    set "INSTALL_CMD=npm install --registry=%NPM_REGISTRY% --no-audit --no-fund"
) else (
    set "INSTALL_CMD=npm install --no-audit --no-fund"
)
if not exist "%SETUP_DIR%\node_modules\" (
    echo 正在安装核心组件，请稍候...
    pushd "%SETUP_DIR%"
    call %INSTALL_CMD%
    if !errorlevel! neq 0 (
        echo [错误] 核心组件安装失败，请检查网络。
        popd
        pause
        exit /b 1
    )
    popd
)
if not exist "%SETUP_DIR%\node_modules\.bin\concurrently.cmd" (
    echo 正在补齐 concurrently 组件...
    pushd "%SETUP_DIR%"
    call %INSTALL_CMD% concurrently
    if !errorlevel! neq 0 (
        echo [错误] 无法安装 concurrently，请稍后重试。
        popd
        pause
        exit /b 1
    )
    popd
)
echo [成功] 核心组件已准备好。

echo [步骤 3/4] 正在检查项目依赖...
if not exist "%BACKEND_DIR%\node_modules\" (
    echo 正在安装后端依赖...
    pushd "%BACKEND_DIR%"
    call %INSTALL_CMD%
    if !errorlevel! neq 0 (
        echo [错误] 后端依赖安装失败。
        popd
        pause
        exit /b 1
    )
    popd
)
if not exist "%FRONT_DIR%\node_modules\" (
    echo 正在安装前端依赖...
    pushd "%FRONT_DIR%"
    call %INSTALL_CMD%
    if !errorlevel! neq 0 (
        echo [错误] 前端依赖安装失败。
        popd
        pause
        exit /b 1
    )
    popd
)
echo [成功] 项目依赖已校验。

echo [步骤 4/4] 正在启动服务...
set "CONC=%SETUP_DIR%\node_modules\.bin\concurrently"
if exist "%CONC%.cmd" (
    call "%CONC%.cmd" -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"
) else (
    echo [错误] 未找到 concurrently，可尝试重新运行本脚本。
    pause
    exit /b 1
)

if %errorlevel% neq 0 (
    echo.
    echo [提示] 系统已停止运行。
    pause
)
