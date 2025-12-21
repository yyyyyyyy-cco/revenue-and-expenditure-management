# revenue-and-expenditure-management

1. 登录（修改密码和用户名）
2. 账单管理
   * 添加账单：选择类型（收入/支出）、选择分类（餐饮、交通、工资等）、输入金额、日期、备注。
   * 删除和修改账单。
   * 查看账单：分页展示所有账单，支持按月份、类型（收/支）、分类进行筛选。
3. 统计功能
   * 本月可用余额，总支出，总收入，总结余。
   * 收支趋势图（最近6个月的收入与支出对比）。
   * 各项支出占比（分类饼图）。
4. 账单导入 (支付宝/微信 CSV) [已实现]
   * 支持批量导入、智能分类与自动去重。
5. 周期性收支管理 [已实现]
   * 支持自定义周期任务（工资、会员订阅等）。
   * 系统自动在到期时生成账单。

---

以下为拓展功能，看时间实现：

1. 语音输入收支管理，AI语音识别。
2. 定时扣款和收入。

---

需求分析

一、核心功能模块

1. 用户登录与账户管理

- 功能描述：实现用户登录、修改用户名和密码。
- 技术要点：
  - 前端：使用 Vue3 组建登录页面，包含表单验证。
  - 后端：Node.js 提供 /login 和 /update-profile 接口，处理用户身份验证与更新。
  - 数据库：SQLite 存储用户表 users（字段：id, username, password_hash, created_at）。
  - 安全：密码需加密存储（推荐 bcrypt）。

2. 账单管理

- 功能描述：支持添加、删除、修改账单，分页展示并提供筛选功能。
- 技术要点：
  - 前端：Vue3 实现账单表单、筛选控件与分页组件。
  - 后端：Node.js 提供以下接口：
    - POST /bills：添加账单
    - GET /bills：获取账单（支持分页、筛选参数）
    - PUT /bills/:id：更新账单
    - DELETE /bills/:id：删除账单
  - 数据库：SQLite 建立 bills 表（字段：id, type, category, amount, date, remark, user_id）。
  - 筛选支持：按月份、类型（收入/支出）、分类进行筛选。

3. 统计功能

- 功能描述：提供本月余额、总收入、总支出、总结余、趋势图表、支出占比。
- 技术要点：
  - 前端：Vue3 结合 ECharts 或 Chart.js 实现图表展示。
  - 后端：Node.js 提供统计接口：
    - GET /stats/monthly：获取当月统计
    - GET /stats/trend：获取趋势数据
    - GET /stats/category-ratio：获取分类占比
  - 数据库：通过 SQL 聚合函数计算统计值。

二、拓展功能模块

1. 支付宝/微信账单导入

- 功能描述：支持导入外部账单并自动去重、分类识别。
- 技术要点：
  - 前端：上传文件组件（支持 CSV/Excel）。
  - 后端：解析文件内容，使用规则或 NLP 模型识别分类，去重逻辑避免重复入库。
  - 数据库：在 bills 表中新增来源字段 source。


2. 定时扣款与收入

- 功能描述：设置周期性收支计划。
- 技术要点：
  - 前端：设置周期规则（如每月、每周）。
  - 后端：Node.js 实现定时任务（使用 node-cron 或 agenda），按规则自动生成账单。
  - 数据库：新增 recurring_bills 表管理周期规则。

三、技术栈与接口说明

- 前端：Vue3 + Vite + Axios + Element Plus
- 后端：Node.js + Express + SQLite
- 接口通信：Axios 负责前后端数据交互，RESTful API 设计

四、数据库设计简要

- users：用户信息表
- bills：账单主表
- categories：分类字典表（可选）
- recurring_bills：周期账单规则表（拓展）

五、后端依赖说明

- **express**: 核心 Web 框架，用于构建 RESTful API。
- **cors**: 处理跨域请求，允许前端应用访问后端接口。
- **sqlite3**: 数据库驱动，用于操作 SQLite 数据库文件。
- **bcryptjs**: 密码加密工具，用于将用户密码进行哈希存储，提高安全性。
- **jsonwebtoken (JWT)**: 身份验证工具，用于生成和验证用户登录令牌。
- **nodemon** (开发依赖): 自动重启工具，在代码修改后自动重新启动服务器，提高开发效率。

六、后端项目结构汇总

```text
backend/
├── src/
│   ├── app.js               # 后端入口文件，配置中间件和路由挂载
│   ├── controllers/         # 业务逻辑层
│   │   ├── authController.js # 用户认证与资料修改逻辑 [NEW]
│   │   ├── billController.js # 账单增删改查逻辑
│   │   ├── categoryController.js # 分类管理逻辑 [NEW]
│   │   └── statController.js # 统计分析逻辑 [NEW]
│   ├── middleware/          # 中间件层 [NEW]
│   │   └── authMiddleware.js # JWT 身份验证中间件 [NEW]
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
├── test_api_billRoutes.js   # API 测试脚本 (已更新支持 Auth)
└── package.json             # 项目依赖与脚本配置
```

七、后端 API 接口文档

所有接口基础路径为 `/api`。除登录和注册外，所有接口均需要 `Authorization: Bearer <token>` 请求头。

### 1. 用户认证 (Auth)

#### 注册
- **URL**: `/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **响应**: `200 OK`

#### 登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1..."
  }
  ```

#### 修改个人资料
- **URL**: `/auth/update-profile`
- **方法**: `PUT`
- **请求体**: (可选 username 或 password)
  ```json
  {
    "username": "newname",
    "password": "newpassword"
  }
  ```

---

### 2. 账单管理 (Bills)

#### 获取账单列表
- **URL**: `/bills`
- **方法**: `GET`
- **查询参数**:
  - `page`: 页码 (默认 1)
  - `limit`: 每页条数 (默认 10)
  - `month`: 月份筛选 (格式: YYYY-MM)
  - `type`: 类型筛选 (`income` 或 `expense`)
  - `category_id`: 分类 ID 筛选

#### 添加账单
- **URL**: `/bills`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "type": "expense",
    "amount": 100.0,
    "category_id": 4,
    "date": "2023-12-19",
    "remark": "晚餐"
  }
  ```

#### 更新账单
- **URL**: `/bills/:id`
- **方法**: `PUT`

#### 删除账单
- **URL**: `/bills/:id`
- **方法**: `DELETE`

---

### 3. 分类管理 (Categories)

#### 获取分类列表
- **URL**: `/categories`
- **方法**: `GET`

---

### 4. 统计功能 (Stats)

#### 获取当月统计
- **URL**: `/stats/monthly`
- **方法**: `GET`
- **响应**:
  ```json
  {
    "month": "2023-12",
    "total_income": 5000,
    "total_expense": 2000,
    "balance": 3000
  }
  ```

#### 获取收支趋势
- **URL**: `/stats/trend`
- **方法**: `GET`

#### 获取支出分类占比
- **URL**: `/stats/category-ratio`
- **方法**: `GET`
- **查询参数**: `month` (可选)
