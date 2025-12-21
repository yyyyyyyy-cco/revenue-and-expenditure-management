@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo ============================================================
echo.
echo   收支管理系统 - 一键部署与启动工具 (小白专用版)
echo.
echo ============================================================
echo.

:: 1. 环境检查
echo [步骤 1/4] 正在检查运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境！
    echo 请先前往官网下载并安装：https://nodejs.org/
    echo 安装完成后，请重新运行此脚本。
    pause
    exit /b 1
)
echo [成功] Node.js 环境正常。
echo.

:: 2. 根目录依赖检查
echo [步骤 2/4] 正在检查基础组件...
if not exist "node_modules\" (
    echo 正在安装必要组件，请稍候...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 基础组件安装失败，请检查网络连接。
        pause
        exit /b 1
    )
)
echo [成功] 基础组件已就绪。
echo.

:: 3. 后端环境检查与修复
echo [步骤 3/4] 正在配置后端服务...
pushd backend
if not exist "node_modules\" (
    echo 正在安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败。
        popd
        pause
        exit /b 1
    )
)

:: 修复 sqlite3 驱动问题
echo 正在验证数据库驱动...
node -e "try { require('sqlite3') } catch (e) { process.exit(1) }" 2>nul
if %errorlevel% neq 0 (
    echo [提示] 正在自动修复数据库驱动兼容性...
    if exist "node_modules\sqlite3" rmdir /s /q "node_modules\sqlite3"
    call npm install sqlite3
)

:: 初始化数据库
if not exist "expense_manager.db" (
    echo 正在初始化数据库文件...
    node src/db/init.js
)
popd
echo [成功] 后端配置完成。
echo.

:: 4. 前端环境检查
echo [步骤 4/4] 正在配置前端界面...
pushd front
if not exist "node_modules\" (
    echo 正在安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败。
        popd
        pause
        exit /b 1
    )
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

:: 使用 npx concurrently 启动
call npx concurrently -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"

if %errorlevel% neq 0 (
    echo.
    echo [提示] 系统已停止运行。
    echo 如果是因为报错退出，请截图保留上方信息。
    pause
)