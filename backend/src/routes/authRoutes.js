const express = require('express');
const router = express.Router();

// 这里只是占位，后面会由 Controller 实现具体逻辑

// 注册
router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint' });
});

// 登录
router.post('/login', (req, res) => {
    res.json({ message: 'Login endpoint' });
});

module.exports = router;
