#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   收支管理系统 一键启动脚本 (Mac/Linux)   ${NC}"
echo -e "${BLUE}==========================================${NC}"

# 1. 检查后端
echo -e "${YELLOW}[1/3] 检查后端环境...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    (cd backend && npm install)
fi

if [ ! -f "backend/expense_manager.db" ]; then
    echo "正在初始化数据库..."
    (cd backend && node src/db/init.js)
fi

# 2. 检查前端
echo -e "${YELLOW}[2/3] 检查前端环境...${NC}"
if [ ! -d "front/node_modules" ]; then
    echo "正在安装前端依赖..."
    (cd front && npm install)
fi

# 3. 启动
echo -e "${YELLOW}[3/3] 正在启动开发服务器...${NC}"
npx concurrently -k -n "后端,前端" -c "blue,green" \
    "cd backend && npm run dev" \
    "cd front && npm run dev"
