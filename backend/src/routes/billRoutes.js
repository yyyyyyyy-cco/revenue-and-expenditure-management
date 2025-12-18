const express = require('express');
const router = express.Router();

// 获取账单列表
router.get('/', (req, res) => {
    res.json({ message: 'Get Bills endpoint' });
});

// 添加账单
router.post('/', (req, res) => {
    res.json({ message: 'Add Bill endpoint' });
});

module.exports = router;
