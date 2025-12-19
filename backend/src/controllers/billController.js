const db = require('../db/db');

/**
 * 获取所有账单（支持分页和筛选）
 * 
 * 1. 从查询参数中获取分页和筛选条件
 * 2. 强制限定 user_id 为当前登录用户，实现数据隔离
 * 3. 动态构建 SQL 语句进行多条件查询
 * 4. 返回数据列表及分页元信息
 */
exports.getAllBills = (req, res) => {
    const { page = 1, limit = 10, month, type, category_id } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.userId; // 从 authMiddleware 获取

    // 基础查询语句，关联分类表以获取分类名称和图标
    let sql = `SELECT b.*, c.name as category_name, c.icon as category_icon 
               FROM bills b 
               LEFT JOIN categories c ON b.category_id = c.id
               WHERE b.user_id = ?`;
    const params = [userId];

    // 条件筛选：按月份 (YYYY-MM)
    if (month) {
        sql += ` AND strftime('%Y-%m', b.date) = ?`;
        params.push(month);
    }
    // 条件筛选：按类型 (income/expense)
    if (type) {
        sql += ` AND b.type = ?`;
        params.push(type);
    }
    // 条件筛选：按分类 ID
    if (category_id) {
        sql += ` AND b.category_id = ?`;
        params.push(category_id);
    }

    // 默认排序：日期降序，同一天按创建时间降序
    sql += ` ORDER BY b.date DESC, b.created_at DESC`;

    // 分页限制
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    // 查询满足条件的总条数，用于前端计算总页数
    let countSql = `SELECT COUNT(*) as total FROM bills WHERE user_id = ?`;
    const countParams = [userId];
    if (month) {
        countSql += ` AND strftime('%Y-%m', date) = ?`;
        countParams.push(month);
    }
    if (type) {
        countSql += ` AND type = ?`;
        countParams.push(type);
    }
    if (category_id) {
        countSql += ` AND category_id = ?`;
        countParams.push(category_id);
    }

    db.get(countSql, countParams, (err, row) => {
        if (err) return res.status(500).json({ error: '获取账单总数失败：' + err.message });
        const total = row.total;

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: '获取账单列表失败：' + err.message });
            res.json({
                data: rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });
        });
    });
};

/**
 * 创建新账单
 * 
 * 1. 验证必填字段
 * 2. 自动关联当前登录用户的 userId
 * 3. 插入数据库并返回新生成的 ID
 */
exports.createBill = (req, res) => {
    const { amount, type, category_id, date, remark } = req.body;
    const userId = req.userId;

    if (!amount || !type || !date) {
        return res.status(400).json({ error: '参数缺失：金额(amount)、类型(type)和日期(date)为必填项' });
    }

    const sql = `INSERT INTO bills (user_id, category_id, type, amount, date, remark) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [userId, category_id, type, amount, date, remark];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: '创建账单失败：' + err.message });
        res.status(201).json({
            id: this.lastID,
            ...req.body,
            user_id: userId
        });
    });
};

/**
 * 更新账单
 * 
 * 1. 验证账单 ID 和用户权限（只能更新自己的账单）
 * 2. 执行更新操作
 */
exports.updateBill = (req, res) => {
    const { id } = req.params;
    const { amount, type, category_id, date, remark } = req.body;
    const userId = req.userId;

    const sql = `UPDATE bills SET amount = ?, type = ?, category_id = ?, date = ?, remark = ? WHERE id = ? AND user_id = ?`;
    const params = [amount, type, category_id, date, remark, id, userId];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: '更新账单失败：' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '未找到指定账单或无权操作' });
        res.json({ message: '账单更新成功', changes: this.changes });
    });
};

/**
 * 删除账单
 * 
 * 1. 验证账单 ID 和用户权限
 * 2. 执行物理删除
 */
exports.deleteBill = (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const sql = `DELETE FROM bills WHERE id = ? AND user_id = ?`;
    db.run(sql, [id, userId], function (err) {
        if (err) return res.status(500).json({ error: '删除账单失败：' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '未找到指定账单或无权操作' });
        res.json({ message: '账单删除成功' });
    });
};
