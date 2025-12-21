#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   收支管理系统 一键修复、安装与运行 (Mac/Linux)   ${NC}"
echo -e "${BLUE}==========================================${NC}"

# 1. 检查根目录
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[1/3] 正在安装根目录必要插件...${NC}"
    npm install
fi

# 2. 检查后端
echo -e "${YELLOW}[2/3] 检查并修复后端环境...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    (cd backend && npm install)
fi

# 修复 sqlite3 原生模块问题
node -e "try { require('./backend/node_modules/sqlite3') } catch (e) { process.exit(1) }" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[警告] 检测到数据库驱动不兼容，正在重新编译 sqlite3...${NC}"
    (cd backend && npm rebuild sqlite3)
fi

if [ ! -f "backend/expense_manager.db" ]; then
    echo "正在初始化数据库..."
    (cd backend && node src/db/init.js)
fi

# 3. 检查前端
echo -e "${YELLOW}[3/3] 检查前端环境并启动...${NC}"
if [ ! -d "front/node_modules" ]; then
    echo "正在安装前端依赖..."
    (cd front && npm install)
fi

echo -e "${GREEN}>>> 准备就绪，正在启动服务器...${NC}"
npx concurrently -k -n "后端,前端" -c "blue,green" \
    "cd backend && npm run dev" \
    "cd front && npm run dev"
