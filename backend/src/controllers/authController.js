const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_dev';

/**
 * 用户注册
 * 
 * 1. 检查用户名和密码是否提供
 * 2. 检查用户名是否已存在
 * 3. 对密码进行哈希加密
 * 4. 存入数据库
 */
exports.register = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    // 检查用户名是否重复
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ message: '数据库查询错误' });
        if (row) return res.status(409).json({ message: '该用户名已被占用' });

        // 密码加密存储
        const hash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function (err2) {
            if (err2) return res.status(500).json({ message: '用户创建失败' });
            return res.json({ message: '注册成功', userId: this.lastID });
        });
    });
};

/**
 * 用户登录
 * 
 * 1. 根据用户名查询用户
 * 2. 验证密码哈希
 * 3. 生成 JWT 令牌并返回
 */
exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ message: '数据库查询错误' });
        if (!row) return res.status(401).json({ message: '用户名或密码错误' });

        // 验证密码
        const match = bcrypt.compareSync(password, row.password_hash);
        if (!match) return res.status(401).json({ message: '用户名或密码错误' });

        // 生成 Token (有效期 7 天)
        const token = jwt.sign({ userId: row.id, username: row.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ message: '登录成功', token });
    });
};

/**
 * 修改个人资料 (用户名或密码)
 * 
 * 1. 验证是否提供了修改项
 * 2. 动态构建 SQL 更新语句
 * 3. 执行更新并处理唯一约束冲突
 */
exports.updateProfile = (req, res) => {
    const { username, password } = req.body;
    const userId = req.userId; // 从 authMiddleware 中获取

    if (!username && !password) {
        return res.status(400).json({ message: '请提供要修改的用户名或密码' });
    }

    let sql = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    // 如果提供了新用户名
    if (username) {
        updates.push('username = ?');
        params.push(username);
    }

    // 如果提供了新密码
    if (password) {
        const hash = bcrypt.hashSync(password, 10);
        updates.push('password_hash = ?');
        params.push(hash);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(userId);

    db.run(sql, params, function (err) {
        if (err) {
            // 处理用户名重复的情况
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: '用户名已存在' });
            }
            return res.status(500).json({ message: '更新失败：' + err.message });
        }
        res.json({ message: '个人资料更新成功' });
    });
};
