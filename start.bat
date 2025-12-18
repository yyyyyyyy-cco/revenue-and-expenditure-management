@echo off
echo ==========================================
echo   正在自动启动收支管理系统 (前后端)...
echo ==========================================

:: 启动后端
echo [1/2] 正在新的窗口启动后端服务...
start "后端服务 - Backend" cmd /c "cd backend && echo 正在检查依赖... && npm install && echo 启动服务... && npm run dev"

:: 启动前端
echo [2/2] 正在新的窗口启动前端服务...
start "前端服务 - Frontend" cmd /c "cd front && echo 正在检查依赖... && npm install && echo 启动服务... && npm run dev"

echo.
echo ==========================================
echo   启动指令已发送！请查看新弹出的窗口。
echo   后端：http://localhost:3000
echo   前端：http://localhost:5173
echo ==========================================
pause
