const categoryClassifier = {
    /**
     * Load all categories from DB and return a map for quick lookup.
     * Returns: { 
     *   income: { 'name': id, ... }, 
     *   expense: { 'name': id, ... } 
     * }
     */
    loadCategories: async (db) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, name, type FROM categories", (err, rows) => {
                if (err) reject(err);
                else {
                    const map = { income: {}, expense: {} };
                    rows.forEach(row => {
                        if (map[row.type]) {
                            map[row.type][row.name] = row.id;
                        }
                    });
                    resolve(map);
                }
            });
        });
    },

    /**
     * Classify a single bill.
     * @param {Object} bill - The parsed bill object
     * @param {Object} categoryMap - The map returned by loadCategories
     * @returns {Integer|null} category_id
     */
    classifyBill: (bill, categoryMap) => {
        const { source, type, original_category, type_desc, counterparty, product } = bill;
        const typeMap = categoryMap[type] || {};

        // 1. Alipay Classification (Explicit Mapping)
        if (source === 'alipay' && original_category) {
            // Mapping from Alipay standard categories to our consolidated DB categories
            const mapping = {
                // Expense
                '餐饮美食': '餐饮美食',
                '服饰装扮': '服饰装扮',
                '日用百货': '日用百货',
                '家居家装': '家居家装',
                '数码电器': '数码电器',
                '运动户外': '休闲娱乐',
                '美容美发': '生活服务',
                '母婴亲子': '日用百货',
                '宠物': '生活服务',
                '交通出行': '交通出行',
                '爱车养车': '交通出行',
                '住房物业': '住房物业',
                '酒店旅游': '休闲娱乐',
                '文化休闲': '休闲娱乐',
                '教育培训': '医疗教育',
                '医疗健康': '医疗教育',
                '生活服务': '生活服务',
                '公共服务': '生活服务',
                '商业服务': '生活服务',
                '公益捐赠': '公益捐赠',
                '互助保障': '商业保险',
                '投资理财': '金融信贷', // Expense side
                '保险': '商业保险',
                '信用借还': '金融信贷',
                '充值缴费': '充值缴费',
                '转账红包': '红包转账',
                '亲友代付': '红包转账',
                '账户存取': '金融信贷',
                '其他': '其他支出',

                // Income
                '收入': '其他收入', // Or '工资薪水' if specifically salary, but generic is safer
                // '投资理财' (Income) handled below by name match if exists in map
                // '转账红包' (Income) handled
                // '退款' -> '退款售后'
                '退款': '退款售后'
            };

            const targetName = mapping[original_category];
            if (targetName && typeMap[targetName]) {
                return typeMap[targetName];
            }

            // Fallback: If exact name match exists (e.g. '投资理财' in income), use it
            if (typeMap[original_category]) {
                return typeMap[original_category];
            }
        }

        // 2. WeChat Classification (Keyword Matching)
        if (source === 'wechat') {
            const combinedText = `${type_desc || ''} ${counterparty || ''} ${product || ''}`;

            // Rules for "红包转账"
            if (combinedText.includes('微信红包') || combinedText.includes('转账')) {
                return typeMap['红包转账'] || null;
            }

            // Rules for "餐饮美食"
            if (/餐饮|美食|饿了么|美团|麦当劳|肯德基|星巴克|蜜雪冰城|瑞幸|喜茶|茶百道/.test(combinedText)) {
                return typeMap['餐饮美食'] || null;
            }

            // Rules for "交通出行"
            if (/出行|打车|滴滴|铁路|火车|地铁|高德|T3|曹操|哈啰/.test(combinedText)) {
                return typeMap['交通出行'] || null;
            }

            // Rules for "日用百货"
            if (/超市|便利店|7-11|全家|罗森|百货|得物|淘宝|京东|天猫/.test(combinedText)) {
                return typeMap['日用百货'] || null;
            }

            // Rules for "充值缴费"
            if (/充值|缴费|电费|水费|燃气/.test(combinedText)) {
                return typeMap['充值缴费'] || null;
            }
        }

        // 3. Fallback (Other)
        // If no match found, try to return '其他支出' or '其他收入'
        if (type === 'expense') {
            return typeMap['其他支出'] || typeMap['其他'] || null;
        } else if (type === 'income') {
            return typeMap['其他收入'] || typeMap['其他'] || null;
        }

        return null;
    }
};

module.exports = categoryClassifier;
