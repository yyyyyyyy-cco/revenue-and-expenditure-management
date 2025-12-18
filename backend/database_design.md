# 数据库表结构设计说明

本项目使用 **SQLite** 数据库，主要包含用户管理、收支分类和账单记录三个核心表。

## 1. 用户表 (`users`)

用于存储用户的基本信息和登录凭证。

| 字段名            | 类型     | 约束                       | 说明               |
| :---------------- | :------- | :------------------------- | :----------------- |
| `id`            | INTEGER  | PRIMARY KEY, AUTOINCREMENT | 用户唯一标识       |
| `username`      | TEXT     | NOT NULL, UNIQUE           | 用户名（用于登录） |
| `password_hash` | TEXT     | NOT NULL                   | 加密后的密码       |
| `created_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP  | 账号创建时间       |

---

## 2. 收支分类表 (`categories`)

预设或用户自定义的收支类别（如：餐饮、工资、交通）。

| 字段名         | 类型     | 约束                                 | 说明                                          |
| :------------- | :------- | :----------------------------------- | :-------------------------------------------- |
| `id`         | INTEGER  | PRIMARY KEY, AUTOINCREMENT           | 分类唯一标识                                  |
| `name`       | TEXT     | NOT NULL                             | 分类名称（如：餐饮、兼职）                    |
| `type`       | TEXT     | CHECK(type IN ('income', 'expense')) | 类型：`income` (收入) 或 `expense` (支出) |
| `icon`       | TEXT     | -                                    | 分类对应的图标标识                            |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP            | 创建时间                                      |

---

## 3. 账单主表 (`bills`)

核心业务数据表，记录每一笔收支明细。

| 字段名          | 类型     | 约束                                 | 说明                                          |
| :-------------- | :------- | :----------------------------------- | :-------------------------------------------- |
| `id`          | INTEGER  | PRIMARY KEY, AUTOINCREMENT           | 账单唯一标识                                  |
| `user_id`     | INTEGER  | NOT NULL, FOREIGN KEY                | 所属用户 ID                                   |
| `category_id` | INTEGER  | FOREIGN KEY                          | 所属分类 ID                                   |
| `type`        | TEXT     | CHECK(type IN ('income', 'expense')) | 类型：`income` (收入) 或 `expense` (支出) |
| `amount`      | REAL     | NOT NULL                             | 金额                                          |
| `date`        | DATETIME | NOT NULL                             | 发生日期                                      |
| `remark`      | TEXT     | -                                    | 备注说明                                      |
| `created_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP            | 记录录入时间                                  |

### 关系说明：

- `bills.user_id` 关联 `users.id`：确保每一条账单都属于特定的用户。
- `bills.category_id` 关联 `categories.id`：为账单提供详细的分类属性。

---

## 设计亮点

1. **类型约束**：在数据库层级通过 `CHECK` 约束确保 `type` 字段只能为 `income` 或 `expense`，增强数据一致性。
2. **自动时间戳**：通过 `DEFAULT CURRENT_TIMESTAMP` 自动记录创建时间。
3. **外键关联**：通过外键维护数据的引用完整性。
