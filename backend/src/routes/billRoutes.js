const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file upload
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * 账单管理路由
 * 所有接口均受 JWT 保护，必须在 Header 中携带有效 Token
 */
router.use(authMiddleware);

// 导入账单
router.post('/import', upload.single('file'), billController.importBills);

// 获取账单列表 (支持分页、月份筛选、类型筛选、分类筛选)
router.get('/', billController.getAllBills);

// 添加新账单
router.post('/', billController.createBill);

// 更新指定 ID 的账单
router.put('/:id', billController.updateBill);

// 删除指定 ID 的账单
router.delete('/:id', billController.deleteBill);

module.exports = router;
