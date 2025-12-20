const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

function parseWeChatBill(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const bills = [];
    let headerFound = false;

    // Define expected columns and their indices
    const colMap = {};

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!headerFound) {
            // "交易时间" is a key column in WeChat bills
            const timeColIndex = row.indexOf('交易时间');
            if (timeColIndex !== -1) {
                headerFound = true;

                // Map columns
                row.forEach((col, index) => {
                    if (col === '交易时间') colMap.time = index;
                    if (col === '交易类型') colMap.type_desc = index;
                    if (col === '交易对方') colMap.counterparty = index;
                    if (col === '商品') colMap.product = index;
                    if (col === '收/支') colMap.direction = index;
                    if (col === '金额(元)') colMap.amount = index;
                    if (col === '备注') colMap.remark = index;
                });
            }
            continue;
        }

        // Process data rows
        if (row.length === 0) continue; // Skip empty rows

        const amountStr = row[colMap.amount];
        if (!amountStr) continue; // Skip invalid rows (e.g. summary or footer)

        // Parse Amount: "¥11.50" -> 11.50
        const amount = parseFloat(amountStr.replace('¥', '').trim());
        if (isNaN(amount)) continue;

        // Parse Type: "支出" -> "expense", "收入" -> "income"
        const direction = row[colMap.direction];
        if (direction !== '支出' && direction !== '收入') continue; // Skip validation/neutral
        const type = direction === '支出' ? 'expense' : 'income';

        // Parse Date
        let date = row[colMap.time];

        // Deal with remark fallback
        let remark = row[colMap.remark];
        if (!remark || remark === '/') {
            const typeDesc = row[colMap.type_desc] || '';
            const counterparty = row[colMap.counterparty] || '';
            remark = `${typeDesc} ${counterparty}`.trim();
        }

        const bill = {
            date: date,
            type: type,
            amount: amount,
            counterparty: row[colMap.counterparty],
            product: row[colMap.product],
            remark: remark,
            type_desc: row[colMap.type_desc], // Extracted for classification
            source: 'wechat'
        };

        bills.push(bill);
    }

    return bills;
}

function parseAlipayCSV(filePath) {
    const buffer = fs.readFileSync(filePath);
    const content = iconv.decode(buffer, 'gbk'); // Alipay uses GBK usually
    const lines = content.split(/\r?\n/);

    const bills = [];
    let headerFound = false;
    const colMap = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',').map(c => c.trim());

        if (!headerFound) {
            if (line.includes('交易时间') && line.includes('金额')) {
                headerFound = true;
                cols.forEach((col, index) => {
                    col = col.trim();
                    if (col === '交易时间') colMap.time = index;
                    if (col === '交易分类') colMap.category = index; // Map category column
                    if (col === '收/支') colMap.direction = index;
                    if (col === '金额') colMap.amount = index;
                    if (col === '交易对方') colMap.counterparty = index;
                    if (col === '商品说明') colMap.product = index;
                    if (col === '备注') colMap.remark = index;
                });
            }
            continue;
        }
        // Data processing
        if (colMap.time === undefined || colMap.amount === undefined) {
            // console.log('[Parser] Missing column mapping');
            continue;
        }

        const timeVal = cols[colMap.time];
        if (!timeVal) {
            continue;
        }

        const direction = cols[colMap.direction];
        if (direction !== '支出' && direction !== '收入') {
            continue;
        }

        const amountStr = cols[colMap.amount];
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
            continue;
        }
        const counterparty = cols[colMap.counterparty] || '';
        const product = cols[colMap.product] || '';
        const originalCategory = cols[colMap.category] || ''; // Extract category

        const generatedRemark = `${counterparty} ${product}`.trim();

        const bill = {
            date: timeVal,
            type: direction === '支出' ? 'expense' : 'income',
            amount: amount,
            counterparty: counterparty,
            product: product,
            remark: generatedRemark,
            original_category: originalCategory, // Extracted for classification
            source: 'alipay'
        };

        bills.push(bill);
    }
    return bills;
}

function parseBillFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
        return parseWeChatBill(filePath);
    } else if (ext === '.csv') {
        return parseAlipayCSV(filePath);
    } else {
        throw new Error('Unsupported file format: ' + ext);
    }
}

module.exports = { parseBillFile };
