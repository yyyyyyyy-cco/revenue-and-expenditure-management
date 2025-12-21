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
 * 获取收支趋势 (支持周、月、年)
 * 
 * @query granularity: 'week' | 'month' | 'year' (默认 month)
 */
exports.getTrendStats = (req, res) => {
    const userId = req.userId;
    const { granularity = 'month' } = req.query;

    let timeFormat;
    let limit;

    switch (granularity) {
        case 'week':
            // 本周 (周一至周日) 的每日统计
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday);
            monday.setHours(0, 0, 0, 0);
            const mondayStr = monday.toISOString().split('T')[0];

            const sqlWeek = `
                SELECT 
                    strftime('%Y-%m-%d', date) as date_str,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
                    CAST((strftime('%w', date) + 6) % 7 AS INTEGER) as weekday_index
                FROM bills 
                WHERE user_id = ? AND date >= ?
                GROUP BY date_str
                ORDER BY date_str ASC
            `;

            return db.all(sqlWeek, [userId, mondayStr], (err, rows) => {
                if (err) return res.status(500).json({ error: '获取周统计失败：' + err.message });

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                const sundayStr = sunday.toISOString().split('T')[0];

                const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                const result = weekDays.map((name, index) => {
                    const found = rows.find(r => r.weekday_index === index);
                    return {
                        period: name,
                        income: found ? found.income : 0,
                        expense: found ? found.expense : 0
                    };
                });
                res.json({
                    weekRange: `${mondayStr} ~ ${sundayStr}`,
                    data: result
                });
            });

        case 'year':
            timeFormat = '%Y';
            limit = 5; // 最近 5 年
            break;
        case 'month':
        default:
            timeFormat = '%Y-%m';
            limit = 6; // 最近 6 个月
            break;
    }

    const sql = `
        SELECT 
            strftime('${timeFormat}', date) as period,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM bills 
        WHERE user_id = ?
        GROUP BY period
        ORDER BY period DESC
        LIMIT ?
    `;

    db.all(sql, [userId, limit], (err, rows) => {
        if (err) return res.status(500).json({ error: '获取趋势数据失败：' + err.message });
        res.json(rows.reverse()); // 按时间正序返回
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
