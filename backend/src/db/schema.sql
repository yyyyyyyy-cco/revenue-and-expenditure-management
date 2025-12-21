CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    amount REAL NOT NULL,
    date DATETIME NOT NULL,
    remark TEXT,
    source TEXT DEFAULT 'system',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 初始分类数据
INSERT OR IGNORE INTO categories (name, type, icon) VALUES 
-- 支出 (Expense)
('餐饮美食', 'expense', 'food-icon'),
('服饰装扮', 'expense', 'clothes-icon'),
('日用百货', 'expense', 'daily-icon'),
('家居家装', 'expense', 'home-icon'),
('数码电器', 'expense', 'digital-icon'),
('交通出行', 'expense', 'transport-icon'),
('住房物业', 'expense', 'housing-icon'),
('休闲娱乐', 'expense', 'entertainment-icon'),
('医疗教育', 'expense', 'medical-edu-icon'),
('生活服务', 'expense', 'service-icon'),
('商业保险', 'expense', 'insurance-icon'),
('金融信贷', 'expense', 'financial-icon'),
('充值缴费', 'expense', 'recharge-icon'),
('红包转账', 'expense', 'social-icon'),
('公益捐赠', 'expense', 'donate-icon'),
('其他支出', 'expense', 'other-icon'),

-- 收入 (Income)
('工资薪水', 'income', 'salary-icon'),
('投资理财', 'income', 'investment-icon'),
('红包转账', 'income', 'social-income-icon'),
('退款售后', 'income', 'refund-icon'),
('其他收入', 'income', 'other-income-icon');

CREATE TABLE IF NOT EXISTS recurring_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    amount REAL NOT NULL,
    period TEXT CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
    next_date DATE NOT NULL,
    remark TEXT,
    last_executed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
