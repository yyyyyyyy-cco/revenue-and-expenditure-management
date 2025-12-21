@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: ============================================================
:: 收支管理系统 - “金刚不坏”一键部署与启动工具
:: ============================================================

set "SETUP_DIR=.setup"
set "BACKEND_DIR=backend"
set "FRONT_DIR=front"

:: 0. 编码与路径自检 (防闪退核心逻辑)
set "CHECK_STR=编码正常"
if not "!CHECK_STR!"=="编码正常" (
    echo [错误] 脚本文件编码识别异常！
    echo ------------------------------------------------------------
    echo 解决方法：请使用记事本“另存为”，并将编码选择为“UTF-8 ^(带 BOM^)”
    echo ------------------------------------------------------------
    pause
    exit /b 1
)

:: 检查路径是否包含中文 (友情提示)
echo "%~dp0" | findstr /R "[^ -~]" >nul
if %errorlevel% equ 0 (
    set "PATH_WARN=1"
)

echo ============================================================
echo.
echo   收支管理系统 - 终极一键启动工具 (小白与同行通用版)
echo.
if defined PATH_WARN (
    echo   [友情提示] 检测到项目路径包含中文，若启动失败请移动至纯英文路径。
    echo.
)
echo ============================================================
echo.

:: 0.1 检查是否在压缩包内运行
if "%~dp0"=="%TEMP%\" (
    echo [警告] 检测到您可能在压缩包内直接运行！
    echo 请先将整个文件夹“解压”出来后再运行此脚本。
    pause
    exit /b 1
)

:: 1. 环境检查
echo [步骤 1/5] 正在检查运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境！
    echo 请前往官网下载安装：https://nodejs.org/
    pause
    exit /b 1
)
echo [成功] Node.js 环境正常。

:: 检查端口占用
echo 正在检查端口占用情况...
for %%p in (3000 5173 5174) do (
    netstat -ano | findstr LISTENING | findstr :%%p >nul
    if !errorlevel! equ 0 (
        echo [提示] 端口 %%p 已被占用，系统将尝试自动处理或在启动时切换。
    )
)
echo.

:: 2. 镜像源检测与配置
echo [步骤 2/5] 正在优化下载速度...
set "NPM_REGISTRY=https://registry.npmmirror.com"
echo 建议使用国内镜像源以加快下载速度。
choice /c YN /m "是否使用淘宝镜像源 (推荐)?" /t 5 /d Y
if %errorlevel% equ 1 (
    set "INSTALL_CMD=npm install --registry=%NPM_REGISTRY% --no-audit --no-fund"
) else (
    set "INSTALL_CMD=npm install --no-audit --no-fund"
)
echo.

:: 3. 基础组件配置 (Clean Root)
echo [步骤 3/5] 正在配置核心组件...
if not exist "%SETUP_DIR%\node_modules\" (
    echo 正在安装核心组件，请稍候...
    pushd %SETUP_DIR%
    call %INSTALL_CMD%
    if !errorlevel! neq 0 (
        echo [错误] 核心组件安装失败，请检查网络。
        popd
        pause
        exit /b 1
    )
    popd
)
echo [成功] 核心组件已就绪。
echo.

:: 4. 后端环境配置
echo [步骤 4/5] 正在配置后端服务...
pushd %BACKEND_DIR%
if not exist "node_modules\" (
    echo 正在安装后端依赖...
    call %INSTALL_CMD%
)

:: 深度验证 sqlite3
echo 正在验证数据库驱动...
node -e "try { require('sqlite3') } catch (e) { process.exit(1) }" 2>nul
if %errorlevel% neq 0 (
    echo [提示] 正在自动修复数据库驱动兼容性...
    if exist "node_modules\sqlite3" rmdir /s /q "node_modules\sqlite3"
    call %INSTALL_CMD% sqlite3
)

:: 初始化数据库
if not exist "expense_manager.db" (
    echo 正在初始化数据库文件...
    node src/db/init.js
)
popd
echo [成功] 后端配置完成。
echo.

:: 5. 前端环境配置
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
echo   前端界面地址: http://localhost:5173 (或 5174)
echo ------------------------------------------------------------
echo.

:: 使用 .setup 目录下的 concurrently 启动
set "CONC=call .\%SETUP_DIR%\node_modules\.bin\concurrently"
%CONC% -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"

if %errorlevel% neq 0 (
    echo.
    echo [提示] 系统已停止运行。
    echo 如果是因为报错退出，请尝试删除所有 node_modules 文件夹后重试。
    pause
)