const express = require('express');
const router = express.Router();

// 获取分类列表
router.get('/', (req, res) => {
    res.json({ message: 'Get Categories endpoint' });
});

module.exports = router;
