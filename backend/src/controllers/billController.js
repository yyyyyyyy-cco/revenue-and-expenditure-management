const db = require('../db/db');

// 获取所有账单（支持分页和筛选）
exports.getAllBills = (req, res) => {
    const { page = 1, limit = 10, month, type, category_id } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT b.*, c.name as category_name, c.icon as category_icon 
               FROM bills b 
               LEFT JOIN categories c ON b.category_id = c.id
               WHERE 1=1`;
    const params = [];

    // 条件筛选
    if (month) {
        // SQLite strftime 格式化日期，匹配 YYYY-MM
        sql += ` AND strftime('%Y-%m', b.date) = ?`;
        params.push(month);
    }
    if (type) {
        sql += ` AND b.type = ?`;
        params.push(type);
    }
    if (category_id) {
        sql += ` AND b.category_id = ?`;
        params.push(category_id);
    }

    // 默认排序：按日期降序，同一天按创建时间降序
    sql += ` ORDER BY b.date DESC, b.created_at DESC`;

    // 分页处理
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // 查询总条数用于分页元数据
    let countSql = `SELECT COUNT(*) as total FROM bills b WHERE 1=1`;
    const countParams = [];
    if (month) {
        countSql += ` AND strftime('%Y-%m', b.date) = ?`;
        countParams.push(month);
    }
    if (type) {
        countSql += ` AND b.type = ?`;
        countParams.push(type);
    }
    if (category_id) {
        countSql += ` AND b.category_id = ?`;
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

// 创建新账单
exports.createBill = (req, res) => {
    const { amount, type, category_id, date, remark, user_id } = req.body;

    // 基础验证
    if (!amount || !type || !date) {
        return res.status(400).json({ error: '参数缺失：金额(amount)、类型(type)和日期(date)为必填项' });
    }

    // 临时逻辑：如果未提供 user_id，默认设为 1（后续集成认证后通过 token 获取）
    const finalUserId = user_id || 1;

    const sql = `INSERT INTO bills (user_id, category_id, type, amount, date, remark) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [finalUserId, category_id, type, amount, date, remark];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: '创建账单失败：' + err.message });
        res.status(201).json({
            id: this.lastID,
            ...req.body,
            user_id: finalUserId
        });
    });
};

// 更新账单
exports.updateBill = (req, res) => {
    const { id } = req.params;
    const { amount, type, category_id, date, remark } = req.body;

    const sql = `UPDATE bills SET amount = ?, type = ?, category_id = ?, date = ?, remark = ? WHERE id = ?`;
    const params = [amount, type, category_id, date, remark, id];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: '更新账单失败：' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '未找到指定账单' });
        res.json({ message: '账单更新成功', changes: this.changes });
    });
};

// 删除账单
exports.deleteBill = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM bills WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) return res.status(500).json({ error: '删除账单失败：' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '未找到指定账单' });
        res.json({ message: '账单删除成功' });
    });
};
