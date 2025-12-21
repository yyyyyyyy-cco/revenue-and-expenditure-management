const db = require('../db/db');
const dayjs = require('dayjs');

/**
 * 获取所有周期性账单规则
 */
exports.getAllRecurringBills = (req, res) => {
    const userId = req.userId;
    const sql = `
        SELECT r.*, c.name as category_name 
        FROM recurring_bills r
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: '获取周期性账单失败：' + err.message });
        res.json(rows);
    });
};

/**
 * 创建新的周期性账单规则
 */
exports.createRecurringBill = (req, res) => {
    const userId = req.userId;
    const { amount, type, category_id, period, next_date, remark } = req.body;

    if (!amount || !type || !period || !next_date) {
        return res.status(400).json({ error: '参数缺失：金额、类型、周期和开始日期为必填项' });
    }

    const sql = `
        INSERT INTO recurring_bills (user_id, category_id, type, amount, period, next_date, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [userId, category_id, type, amount, period, next_date, remark], function (err) {
        if (err) return res.status(500).json({ error: '创建周期性账单失败：' + err.message });
        res.status(201).json({ id: this.lastID, ...req.body });
    });
};

/**
 * 删除周期性账单规则
 */
exports.deleteRecurringBill = (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    db.run(`DELETE FROM recurring_bills WHERE id = ? AND user_id = ?`, [id, userId], function (err) {
        if (err) return res.status(500).json({ error: '删除失败：' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: '规则不存在或无权操作' });
        res.json({ message: '周期性账单规则已删除' });
    });
};

/**
 * 核心逻辑：处理并生成到期的账单
 * 1. 查找所有 next_date <= 今天的规则
 * 2. 循环生成账单并更新 next_date
 * 3. 递归处理（以防一个周期内需要补多笔账单）
 */
exports.processRecurringBills = async (req, res) => {
    const userId = req.userId;
    const today = dayjs().format('YYYY-MM-DD');

    const fetchRules = () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM recurring_bills WHERE user_id = ? AND next_date <= ?`, [userId, today], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    const generateBill = (rule) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // 1. 插入到 bills 表
                const insertSql = `INSERT INTO bills (user_id, category_id, type, amount, date, remark, source) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.run(insertSql, [rule.user_id, rule.category_id, rule.type, rule.amount, rule.next_date, rule.remark, 'recurring'], function (err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    // 2. 计算下一个日期
                    let nextDate = dayjs(rule.next_date);
                    if (rule.period === 'daily') nextDate = nextDate.add(1, 'day');
                    else if (rule.period === 'weekly') nextDate = nextDate.add(1, 'week');
                    else if (rule.period === 'monthly') nextDate = nextDate.add(1, 'month');
                    else if (rule.period === 'yearly') nextDate = nextDate.add(1, 'year');

                    // 3. 更新规则表
                    const updateSql = `UPDATE recurring_bills SET next_date = ?, last_executed_at = CURRENT_TIMESTAMP WHERE id = ?`;
                    db.run(updateSql, [nextDate.format('YYYY-MM-DD'), rule.id], function (err) {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }
                        db.run("COMMIT");
                        resolve(true);
                    });
                });
            });
        });
    };

    try {
        let rows = await fetchRules();
        let totalGenerated = 0;

        // 持续处理直到没有到期的规则（防止漏补很久以前的账单）
        while (rows.length > 0) {
            for (const rule of rows) {
                await generateBill(rule);
                totalGenerated++;
            }
            rows = await fetchRules();
        }

        res.json({ message: '处理完成', generated: totalGenerated });
    } catch (err) {
        res.status(500).json({ error: '执行周期账单失败：' + err.message });
    }
};
