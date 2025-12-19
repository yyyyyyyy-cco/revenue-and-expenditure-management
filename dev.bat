@echo off
chcp 65001 >nul

REM 一键启动前后端开发服务器
REM 使用方法:
REM 双击运行此批处理文件或在命令行中执行:
REM > dev.bat

echo ==========================================
echo   正在 VS Code 终端内启动收支管理系统...
echo ==========================================

call npx -y concurrently -k -n "后端,前端" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"