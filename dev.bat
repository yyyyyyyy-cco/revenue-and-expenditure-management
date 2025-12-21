@echo off
chcp 65001 >nul

REM 一键启动前后端开发服务器
REM 使用方法:
REM 双击运行此批处理文件或在命令行中执行:
REM > dev.bat

echo ==========================================
echo   正在 VS Code 终端内启动收支管理系统...
echo ==========================================

echo [1/3] 检查后端环境...
if not exist "backend\node_modules\" (
    echo 正在安装后端依赖...
    cd backend && npm install && cd ..
)

if not exist "backend\expense_manager.db" (
    echo 正在初始化数据库...
    cd backend && node src/db/init.js && cd ..
)

echo [2/3] 检查前端环境...
if not exist "front\node_modules\" (
    echo 正在安装前端依赖...
    cd front && npm install && cd ..
)

echo [3/3] 正在启动开发服务器...
call npx concurrently -k -n "后端,前端" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"