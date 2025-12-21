@echo off
setlocal enabledelayedexpansion
:: 强制使用 UTF-8 编码，解决中文乱码问题
chcp 65001 >nul

:: 定义核心目录
set "SETUP_DIR=.setup"
set "BACKEND_DIR=backend"
set "FRONT_DIR=front"

echo "============================================================"
echo "    收支管理系统 - “克隆即用”一键启动工具 (全自动版)"
echo "============================================================"
echo.

:: 1. 基础环境自检
echo "[1/5] 检查运行环境 (Node.js)..."
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo "[错误] 未检测到 Node.js，请先安装：https://nodejs.org/"
    pause
    exit /b 1
)
echo "[成功] 环境正常。"
echo.

:: 2. 配置国内高速镜像
set "NPM_REGISTRY=https://registry.npmmirror.com"
set "NPM_OPT=--registry=%NPM_REGISTRY% --no-audit --no-fund --loglevel=error"

:: 3. 核心依赖全自动安装逻辑
echo "[2/5] 正在检查后端依赖 (全自动安装/补全)..."
pushd %BACKEND_DIR%
:: 深度检测：不仅看文件夹，还看关键包 dayjs 是否存在
if not exist "node_modules\dayjs\" (
    echo "  [提示] 正在为您补全后端核心组件，请稍候..."
    call npm install %NPM_OPT%
)
popd

echo "[3/5] 正在配置启动器组件..."
pushd %SETUP_DIR%
if not exist "node_modules\concurrently\" (
    echo "  [提示] 正在安装启动器辅助工具..."
    call npm install %NPM_OPT%
)
popd

echo "[4/5] 正在检查前端依赖 (自动部署)..."
pushd %FRONT_DIR%
if not exist "node_modules\" (
    echo "  [提示] 正在为您自动安装前端环境..."
    call npm install %NPM_OPT%
)
popd
echo "[成功] 所有环境已准备就绪。"
echo.

:: 4. 启动系统
echo "[5/5] >>> 准备就绪！正在为您启动系统..."
echo "------------------------------------------------------------"
echo "  后端服务：http://localhost:3000"
echo "  前端界面：http://localhost:5173 (若占用将自动切换)"
echo "------------------------------------------------------------"
echo.

:: 使用 .setup 中的并发工具启动
set "CONC=call .\%SETUP_DIR%\node_modules\.bin\concurrently"
%CONC% -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"

if %errorlevel% neq 0 (
    echo.
    echo "[提示] 系统已停止运行。"
    echo "如果遇到启动报错，请尝试删除所有目录下的 node_modules 文件夹后重新运行此脚本。"
    pause
)
