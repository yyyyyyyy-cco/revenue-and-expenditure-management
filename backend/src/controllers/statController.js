const db = require('../db/db');

/**
 * 获取当月统计 (总收入、总支出、结余)
 * 
 * 1. 自动识别当前月份 (YYYY-MM)
 * 2. 使用 SQL 聚合函数 SUM 分别计算收入和支出总额
 */
exports.getMonthlyStats = (req, res) => {
    const userId = req.userId;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const sql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM bills 
        WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `;

    db.get(sql, [userId, currentMonth], (err, row) => {
        if (err) return res.status(500).json({ error: '获取月度统计失败：' + err.message });

        const income = row.total_income || 0;
        const expense = row.total_expense || 0;
        res.json({
            month: currentMonth,
            total_income: income,
            total_expense: expense,
            balance: income - expense
        });
    });
};

/**
 * 获取收支趋势 (最近 6 个月)
 * 
 * 1. 按月份分组汇总收入和支出
 * 2. 仅返回最近 6 个月的数据
 * 3. 结果按时间正序排列，方便前端绘图
 */
exports.getTrendStats = (req, res) => {
    const userId = req.userId;

    const sql = `
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM bills 
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: '获取趋势数据失败：' + err.message });
        res.json(rows.reverse()); // 翻转数组，使其按时间顺序排列
    });
};

/**
 * 获取支出分类占比
 * 
 * 1. 统计指定月份（默认为当月）内各项支出的总额
 * 2. 关联分类表以获取分类名称
 */
exports.getCategoryRatioStats = (req, res) => {
    const userId = req.userId;
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const sql = `
        SELECT 
            c.name as category_name,
            SUM(b.amount) as value
        FROM bills b
        JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ? AND b.type = 'expense' AND strftime('%Y-%m', b.date) = ?
        GROUP BY c.name
    `;

    db.all(sql, [userId, targetMonth], (err, rows) => {
        if (err) return res.status(500).json({ error: '获取分类占比失败：' + err.message });
        res.json(rows);
    });
};
