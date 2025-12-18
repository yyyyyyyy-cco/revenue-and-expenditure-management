const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_dev';

exports.register = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ message: '数据库查询错误' });
        if (row) return res.status(409).json({ message: '用户已存在' });

        const hash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], function (err2) {
            if (err2) return res.status(500).json({ message: '用户创建失败' });
            return res.json({ message: '注册成功', userId: this.lastID });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ message: '数据库查询错误' });
        if (!row) return res.status(401).json({ message: '用户名或密码错误' });

        const match = bcrypt.compareSync(password, row.password_hash);
        if (!match) return res.status(401).json({ message: '用户名或密码错误' });

        const token = jwt.sign({ userId: row.id, username: row.username }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ message: '登录成功', token });
    });
};
