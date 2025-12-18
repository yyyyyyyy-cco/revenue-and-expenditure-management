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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 初始分类数据
INSERT OR IGNORE INTO categories (name, type, icon) VALUES 
('工资', 'income', 'salary-icon'),
('兼职', 'income', 'part-time-icon'),
('理财', 'income', 'investment-icon'),
('餐饮', 'expense', 'food-icon'),
('交通', 'expense', 'transport-icon'),
('购物', 'expense', 'shopping-icon'),
('居住', 'expense', 'housing-icon'),
('娱乐', 'expense', 'entertainment-icon'),
('医疗', 'expense', 'medical-icon'),
('教育', 'expense', 'education-icon');
