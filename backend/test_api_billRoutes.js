const http = require('http');

/**
 * 通用 HTTP 请求封装函数
 * @param {string} path 请求路径 (例如 /api/bills)
 * @param {string} method 请求方法 (GET, POST, PUT, DELETE)
 * @param {object} data 请求体数据 (仅 POST/PUT 需要)
 * @returns {Promise<object>} 返回包含 status 和 body 的响应对象
 */
function request(path, method, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            // 接收数据块
            res.on('data', (chunk) => body += chunk);
            // 接收结束
            res.on('end', () => {
                try {
                    // 尝试解析 JSON 响应
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    // 解析失败则返回原始文本
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        // 如果有数据体，写入请求
        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * 主测试流程
 */
async function runTests() {
    console.log('🚀 开始 API 接口自动化测试...\n');

    let createdBillId = null;

    // ==========================================
    // 1. 测试创建账单 (POST /api/bills)
    // ==========================================
    console.log('--- 1. 测试创建账单 (Create) ---');
    const billData = {
        type: 'expense',
        amount: 128.5,
        category_id: 4, // 假设 ID 4 是餐饮
        date: '2023-12-18',
        remark: '团队聚餐测试',
        user_id: 1
    };

    try {
        const createRes = await request('/api/bills', 'POST', billData);
        console.log(`[POST] 状态码: ${createRes.status}`);
        if (createRes.status === 201) {
            console.log('✅ 创建成功，返回数据:', createRes.body);
            createdBillId = createRes.body.id;
        } else {
            console.error('❌ 创建失败:', createRes.body);
            return; // 无法创建则终止后续测试
        }
    } catch (err) {
        console.error('❌ 请求异常:', err);
    }

    // ==========================================
    // 2. 测试获取账单列表 (GET /api/bills)
    // ==========================================
    console.log('\n--- 2. 测试获取账单列表 (Read & Pagination) ---');
    try {
        const getRes = await request('/api/bills?page=1&limit=5', 'GET');
        console.log(`[GET] 状态码: ${getRes.status}`);
        if (getRes.status === 200) {
            console.log(`✅ 获取成功，当前页数据条数: ${getRes.body.data.length}`);
            console.log(`   分页信息: 总条数 ${getRes.body.pagination.total}, 总页数 ${getRes.body.pagination.totalPages}`);
        } else {
            console.error('❌ 获取列表失败:', getRes.body);
        }
    } catch (err) { console.error(err); }

    // ==========================================
    // 3. 测试筛选功能 (GET /api/bills?type=expense)
    // ==========================================
    console.log('\n--- 3. 测试筛选功能 (Filter) ---');
    try {
        const filterRes = await request('/api/bills?type=expense&limit=2', 'GET');
        console.log(`[GET] 筛选 'expense' 状态码: ${filterRes.status}`);
        const isAllExpense = filterRes.body.data.every(item => item.type === 'expense');
        if (isAllExpense) {
            console.log('✅ 筛选验证通过: 返回的所有数据均为 expense 类型');
        } else {
            console.error('❌ 筛选验证失败: 返回数据包含其他类型');
        }
    } catch (err) { console.error(err); }

    // ==========================================
    // 4. 测试更新账单 (PUT /api/bills/:id)
    // ==========================================
    console.log('\n--- 4. 测试更新账单 (Update) ---');
    if (createdBillId) {
        const updateData = {
            ...billData,
            amount: 999.9, // 修改金额
            remark: '团队聚餐 (已修改)' // 修改备注
        };
        try {
            const updateRes = await request(`/api/bills/${createdBillId}`, 'PUT', updateData);
            console.log(`[PUT] 状态码: ${updateRes.status}`);
            if (updateRes.status === 200) {
                console.log('✅ 更新成功:', updateRes.body);
            } else {
                console.error('❌ 更新失败:', updateRes.body);
            }
        } catch (err) { console.error(err); }
    }

    // ==========================================
    // 5. 测试删除账单 (DELETE /api/bills/:id)
    // ==========================================
    console.log('\n--- 5. 测试删除账单 (Delete) ---');
    if (createdBillId) {
        try {
            const deleteRes = await request(`/api/bills/${createdBillId}`, 'DELETE');
            console.log(`[DELETE] 状态码: ${deleteRes.status}`);
            if (deleteRes.status === 200) {
                console.log('✅ 删除成功:', deleteRes.body);
            } else {
                console.error('❌ 删除失败:', deleteRes.body);
            }

            // 再次查询确认删除
            const checkRes = await request(`/api/bills?page=1&limit=10`, 'GET');
            const found = checkRes.body.data.find(b => b.id === createdBillId);
            if (!found) {
                console.log('✅ 二次验证通过: 列表中已找不到该 ID');
            } else {
                console.error('❌ 二次验证失败: 数据仍然存在');
            }

        } catch (err) { console.error(err); }
    }

    // ==========================================
    // 6. 测试异常情况 (例如必填项缺失)
    // ==========================================
    console.log('\n--- 6. 测试异常处理 (Error Handling) ---');
    const badData = { amount: 100 }; // 缺失 type, date 等字段
    try {
        const errRes = await request('/api/bills', 'POST', badData);
        console.log(`[POST Error] 状态码: ${errRes.status} (预期应为 400)`);
        if (errRes.status === 400) {
            console.log('✅ 异常捕捉验证通过:', errRes.body);
        } else {
            console.error('❌ 异常捕捉失败，服务端未拦截:', errRes.body);
        }
    } catch (err) { console.error(err); }

    console.log('\n🎉 测试结束');
}

runTests();
