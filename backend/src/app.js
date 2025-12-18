const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 测试接口
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

const authRoutes = require('./routes/authRoutes');
const billRoutes = require('./routes/billRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const statRoutes = require('./routes/statRoutes');

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statRoutes);

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
