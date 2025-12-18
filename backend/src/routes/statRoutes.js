const express = require('express');
const router = express.Router();

// 获取统计数据
router.get('/', (req, res) => {
    res.json({ message: 'Get Stats endpoint' });
});

module.exports = router;
