const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * 账单管理路由
 * 所有接口均受 JWT 保护，必须在 Header 中携带有效 Token
 */
router.use(authMiddleware);

// 获取账单列表 (支持分页、月份筛选、类型筛选、分类筛选)
router.get('/', billController.getAllBills);

// 添加新账单
router.post('/', billController.createBill);

// 更新指定 ID 的账单
router.put('/:id', billController.updateBill);

// 删除指定 ID 的账单
router.delete('/:id', billController.deleteBill);

module.exports = router;
