const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// 获取账单列表 (支持分页、筛选)
router.get('/', billController.getAllBills);

// 添加账单
router.post('/', billController.createBill);

// 更新账单
router.put('/:id', billController.updateBill);

// 删除账单
router.delete('/:id', billController.deleteBill);

module.exports = router;
