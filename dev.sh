#!/bin/bash

# ============================================================
# 收支管理系统 - “金刚不坏”一键部署与启动工具 (Linux/macOS)
# ============================================================

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SETUP_DIR=".setup"
BACKEND_DIR="backend"
FRONT_DIR="front"

echo -e "${BLUE}============================================================${NC}"
echo -e ""
echo -e "  ${GREEN}收支管理系统 - 终极一键启动工具 (Unix 通用版)${NC}"
echo -e ""
echo -e "${BLUE}============================================================${NC}"
echo -e ""

# 0. 编码自检 (Unix 系统通常为 UTF-8，这里做个基本检查)
if [[ ! "$LANG" == *"UTF-8"* ]]; then
    echo -e "${YELLOW}[警告] 您的系统语言环境似乎不是 UTF-8，可能会出现中文乱码。${NC}"
fi

# 1. 环境检查
echo -e "[步骤 1/5] 正在检查运行环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Node.js 环境！${NC}"
    echo -e "请前往官网下载安装：https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi
echo -e "${GREEN}[成功] Node.js 环境正常。${NC}"

# 检查端口占用
echo "正在检查端口占用情况..."
for port in 3000 5173 5174; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}[提示] 端口 $port 已被占用，系统将尝试自动处理或在启动时切换。${NC}"
    fi
done
echo ""

# 2. 镜像源配置
echo -e "[步骤 2/5] 正在优化下载速度..."
NPM_REGISTRY="https://registry.npmmirror.com"
echo -e "建议使用国内镜像源以加快下载速度。"
read -p "是否使用淘宝镜像源 (推荐)? [Y/n] " use_mirror
use_mirror=${use_mirror:-Y}

if [[ "$use_mirror" =~ ^[Yy]$ ]]; then
    INSTALL_CMD="npm install --registry=$NPM_REGISTRY --no-audit --no-fund"
else
    INSTALL_CMD="npm install --no-audit --no-fund"
fi
echo ""

# 3. 基础组件配置 (Clean Root)
echo -e "[步骤 3/5] 正在配置核心组件..."
if [ ! -d "$SETUP_DIR/node_modules" ]; then
    echo "正在安装核心组件，请稍候..."
    cd "$SETUP_DIR" || exit 1
    $INSTALL_CMD
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 核心组件安装失败，请检查网络。${NC}"
        read -p "按回车键退出..."
        exit 1
    fi
    cd ..
fi
echo -e "${GREEN}[成功] 核心组件已就绪。${NC}"
echo ""

# 4. 后端环境配置
echo -e "[步骤 4/5] 正在配置后端服务..."
cd "$BACKEND_DIR" || exit 1
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    $INSTALL_CMD
fi

# 深度验证 sqlite3
echo "正在验证数据库驱动..."
node -e "try { require('sqlite3') } catch (e) { process.exit(1) }" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[提示] 正在自动修复数据库驱动兼容性...${NC}"
    rm -rf node_modules/sqlite3
    $INSTALL_CMD sqlite3
fi

# 初始化数据库
if [ ! -f "expense_manager.db" ]; then
    echo "正在初始化数据库文件..."
    node src/db/init.js
fi
cd ..
echo -e "${GREEN}[成功] 后端配置完成。${NC}"
echo ""

# 5. 前端环境配置
echo -e "[步骤 5/5] 正在配置前端界面..."
cd "$FRONT_DIR" || exit 1
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    $INSTALL_CMD
fi
cd ..
echo -e "${GREEN}[成功] 前端配置完成。${NC}"
echo ""

echo -e "${GREEN}>>> 准备就绪！正在为您启动系统...${NC}"
echo -e ""
echo -e "${BLUE}------------------------------------------------------------${NC}"
echo -e "  后端服务地址: ${BLUE}http://localhost:3000${NC}"
echo -e "  前端界面地址: ${BLUE}http://localhost:5173 (或 5174)${NC}"
echo -e "${BLUE}------------------------------------------------------------${NC}"
echo -e ""

# 使用 .setup 目录下的 concurrently 启动
CONC="./$SETUP_DIR/node_modules/.bin/concurrently"
if [ -f "$CONC" ]; then
    chmod +x "$CONC"
    "$CONC" -n "后端服务,前端界面" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"
else
    echo -e "${RED}[错误] 未能找到 concurrently 组件，请确保步骤 3 已成功完成。${NC}"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo -e ""
    echo -e "${YELLOW}[提示] 系统已停止运行。${NC}"
    echo -e "如果是因为报错退出，请尝试删除所有 node_modules 文件夹后重试。"
    read -p "按回车键退出..."
fi
