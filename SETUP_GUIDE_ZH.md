# 收支管理系统 - 环境配置与启动手册

本手册旨在指导您完成项目的环境配置、依赖安装及启动运行。

---

## 1. 环境依赖
在开始之前，请确保您的系统中已安装以下软件：
- **Node.js**: 推荐版本 v18.x 或更高。
- **npm**: 随 Node.js 一同安装。
- **SQLite3**: 后端内置，无需额外配置环境。

---

## 2. 项目结构
```text
revenue-and-expenditure-management/
├── backend/          # 后端代码 (Express + SQLite)
├── front/            # 前端代码 (Vue 3 + Vite)
├── .gitignore        # Git 忽略配置
└── README.md         # 项目文档
```

---

## 3. 首次配置 (环境初始化)

### 后端配置
1. 进入后端目录：`cd backend`
2. 安装依赖：`npm install`
3. 数据库初始化（如果 `expense_manager.db` 不存在）：
   ```bash
   node src/db/init.js
   ```

### 前端配置
1. 进入前端目录：`cd front`
2. 安装依赖：`npm install`

---

## 4. 启动项目

### 推荐：一键启动 (前后端同时运行)
在**项目根目录**运行以下命令：
```bash
npx concurrently -k -n "后端,前端" -c "blue,green" "cd backend && npm run dev" "cd front && npm run dev"
```
> [!TIP]
> 如果前端提示找不到 `echarts` 等依赖，请尝试在命令末尾添加 `-- --force` 强制刷新缓存。

### 选项：分开手动启动

**终端 1 (后端)**:
```bash
cd backend
npm run dev
```

**终端 2 (前端)**:
```bash
cd front
npm run dev
```

---

## 5. 功能测试与验证
1. **访问前端**: `http://localhost:5173`
2. **账号测试**:
   - 访问 `http://localhost:5173/register` 注册新账号。
   - 登录后进入 `/account` 页面。
3. **API 验证**: 访问 `http://localhost:3000/api/bills` 应返回 JSON 数据（需带 Token）。

---

## 6. Git 使用建议
建议不要将以下文件上传至仓库（已在 `.gitignore` 中配置）：
- `node_modules/`: 依赖库，体积巨大。
- `*.db`: 本地数据库文件，包含个人测试数据。
- `.vscode/`: 个人编辑器配置。
- `uploads/`: 用户上传的临时 CSV 文件。
