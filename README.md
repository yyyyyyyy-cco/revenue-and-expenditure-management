# revenue-and-expenditure-management

1.  登录（修改密码和用户名）
2.  账单管理
    *   添加账单：选择类型（收入/支出）、选择分类（餐饮、交通、工资等）、输入金额、日期、备注。
    *   删除和修改账单。
    *   查看账单：分页展示所有账单，支持按月份、类型（收/支）、分类进行筛选。
3.  统计功能
    *   本月可用余额，总支出，总收入，总结余。
    *   收支趋势。
    *   各项支出占比。

---

以下为拓展功能，看时间实现：
1.  支付宝，微信的账单导入和去重和识别。要考虑导出的格式。
2.  语音输入收支管理，AI语音识别。
3.  定时扣款和收入。


----

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

2. 语音输入收支管理
- 功能描述：通过语音输入账单信息。
- 技术要点：
  - 前端：Vue3 集成 Web Speech API 或调用第三方语音识别 SDK。
  - 后端：提供语音转文本接口（可选集成 ASR 服务）。

3. 定时扣款与收入
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


五、后端项目结构汇总

```text
backend/
├── src/
│   ├── app.js               # 后端入口文件，配置中间件和路由挂载
│   ├── controllers/         # 业务逻辑层 (大厨)
│   │   └── billController.js # 账单增删改查逻辑
│   ├── routes/              # 路由层 (服务员)
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
├── test_api_billRoutes.js   # API 测试脚本
└── package.json             # 项目依赖与脚本配置
```