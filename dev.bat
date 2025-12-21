@echo off
chcp 65001 >nul

echo ==========================================
echo   收支管理系统 一键修复、安装与运行 (Windows)
echo ==========================================

REM 1. 检查根目录依赖
if not exist "node_modules\" (
    echo [1/3] 正在安装根目录必要插件...
    call npm install
)

REM 2. 检查后端
echo [2/3] 检查并修复后端环境...
if not exist "backend\node_modules\" (
    echo 正在安装后端依赖...
    cd backend && call npm install && cd ..
)

REM 修复 sqlite3 原生模块问题
node -e "try { require('./backend/node_modules/sqlite3') } catch (e) { process.exit(1) }" 2>nul
if %errorlevel% neq 0 (
    echo [警告] 检测到数据库驱动不兼容，正在尝试重新安装 sqlite3...
    cd backend
    if exist "node_modules\sqlite3" (
        rmdir /s /q "node_modules\sqlite3"
    )
    call npm install sqlite3
    cd ..
)

if not exist "backend\expense_manager.db" (
    echo 正在初始化数据库...
    cd backend && node src/db/init.js && cd ..
)

REM 3. 检查前端
echo [3/3] 检查前端环境并启动...
if not exist "front\node_modules\" (
    echo 正在安装前端依赖...
    cd front && call npm install && cd ..
)

echo >>> 准备就绪，正在启动服务器...
call npx concurrently -n "后端,前端" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"