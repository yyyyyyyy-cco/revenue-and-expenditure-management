const db = require('../db/db');

/**
 * 获取所有预设分类
 * 
 * 返回系统定义的收入和支出分类列表，按类型和名称排序。
 */
exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY type, name';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '获取分类失败：' + err.message });
        }
        res.json(rows);
    });
};
