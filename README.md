# 收支管理系统 (Revenue and Expenditure Management)

本系统是一款基于 **Vue 3** 和 **Node.js** 的全栈财务管理工具，旨在帮助用户高效记录、导入和分析日常收支。

---

## 🚀 快速启动与脚本使用说明

项目提供了全自动化的启动脚本，会自动检查环境、安装依赖、修复数据库驱动并启动系统：

- **Mac/Linux 用户**: 
  ```bash
  chmod +x dev.sh
  ./dev.sh
  ```
- **Windows 用户**: 
  直接双击根目录下的 **`dev.bat`**。

### 脚本功能说明
* **自动安装依赖**：检测到 `node_modules` 缺失时自动运行 `npm install`。
* **数据库初始化**：自动检查并生成 `expense_manager.db`。
* **驱动自愈**：检测到 `sqlite3` 二进制不兼容（如跨平台部署）时自动运行 `npm rebuild`。
* **一键双开**：通过 `concurrently` 同时启动前端 (5173) 与后端 (3000)。即使其中一个进程由于环境问题退出，另一个进程也会保持运行，方便排查错误。

---

## 🛠️ 已开发功能 (Developed Features)

### 1. 核心功能模块
* **登录与账户管理**：支持用户注册、登录、修改用户名和密码。
* **账单管理**：支持添加、删除、修改账单，分页展示并提供按月份、类型、分类的深度筛选。
* **账单导入**：支持支付宝、微信导出的 CSV 账单批量导入，具备智能去重功能。
* **周期性收支**：支持自定义周期任务（如工资、会员订阅），系统自动到期生成账单。

### 2. 增强统计看板 (Smart Statistics)
* **多维度趋势分析**：支持“周”、“月”、“年”粒度动态切换。
  - **周视图**：精准展示周一至周日的日收支对比，并在标题提示具体日期范围。
  - **混合图表**：柱状图对比收支，折线图跟踪“净收益”变化。
* **交互式占比图**：支出分类采用环形图展示，支持悬浮查看具体金额与比例。
* **色彩自定义**：内置颜色选择器，可实时修改收入、支出及净收益的图表配色。
* **视觉优化**：调整了图例与坐标文字间距，使用渐变色美化 UI。

---

## ⚙️ 前后端环境配置 (Environment Setup)

### 1. 环境依赖
- **Node.js**: 建议使用 v18.x 或更高版本。
- **npm**: 随 Node.js 一同安装。
- **SQLite3**: 后端内置，无需安装独立数据库服务。

### 2. 首次手动配置 (备选方案)
如果您不使用一键脚本，请按以下步骤操作：

#### 后端 (Backend)
1. 进入目录：`cd backend`
2. 安装依赖：`npm install`
3. 初始化数据库：`node src/db/init.js`
4. 启动启动：`npm run dev`

#### 前端 (Frontend)
1. 进入目录：`cd front`
2. 安装依赖：`npm install`
3. 启动启动：`npm run dev`

---

## 📂 项目结构汇总 (Detailed Project Structure)

### 后端 (Backend)
```text
backend/
├── src/
│   ├── app.js               # 后端入口文件，配置中间件和路由挂载
│   ├── controllers/         # 业务逻辑层
│   │   ├── authController.js # 用户认证与资料修改逻辑
│   │   ├── billController.js # 账单增删改查逻辑
│   │   ├── categoryController.js # 分类管理逻辑
│   │   └── statController.js # 统计分析逻辑
│   ├── middleware/          # 中间件层
│   │   └── authMiddleware.js # JWT 身份验证中间件
│   ├── routes/              # 路由层
│   │   ├── authRoutes.js     # 用户认证路由
│   │   ├── billRoutes.js     # 账单管理路由
│   │   ├── categoryRoutes.js # 分类管理路由
│   │   └── statRoutes.js     # 统计分析路由
│   └── db/                  # 数据库配置层
│       ├── db.js            # 数据库连接池配置
│       ├── init.js          # 数据库初始化脚本
│       └── schema.sql       # 数据库建表 SQL
├── expense_manager.db       # SQLite 数据库文件
├── database_design.md       # 数据库设计说明文档
└── package.json             # 项目依赖与脚本配置
```

### 前端 (Frontend)
```text
front/
├── src/
│   ├── main.js             # 前端入口
│   ├── router/             # 路由配置
│   ├── components/         # UI 组件
│   │   ├── LoginView.vue   # 登录组件
│   │   ├── RegisterView.vue # 注册组件
│   │   └── AccountView.vue  # 核心记账与统计页面 (包含 ECharts 逻辑)
│   └── assets/             # 静态资源
├── index.html              # 页面模板
└── package.json            # 前端依赖配置
```

---

## 🔐 安全与 Git 使用建议
1. 请勿上传 `node_modules/` 目录。
2. 建议忽略 `*.db` 文件以保护个人隐私数据。
3. 请勿上传 `.vscode/` 个人配置。
4. 在搬运代码时，如遇原生模块编译错误，请在对应目录下执行 `npm rebuild`。

---

## 🔌 API 接口概览
*详细文档详见 `backend/API_DOCUMENTATION.md`*

* **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/update-profile`
* **Bills**: `GET /api/bills`, `POST /api/bills`, `DELETE /api/bills/:id`
* **Stats**: `GET /api/stats/monthly`, `GET /api/stats/trend`, `GET /api/stats/category-ratio`
