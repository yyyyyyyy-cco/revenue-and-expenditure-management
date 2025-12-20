const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../expense_manager.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.all("PRAGMA table_info(bills)", (err, rows) => {
        if (err) {
            console.error('Error checking table info:', err.message);
            db.close();
            return;
        }

        const hasSource = rows.some(row => row.name === 'source');
        if (!hasSource) {
            db.run("ALTER TABLE bills ADD COLUMN source TEXT DEFAULT 'system'", (err) => {
                if (err) {
                    console.error('Error adding column:', err.message);
                } else {
                    console.log('Column "source" added successfully.');
                }
                db.close();
            });
        } else {
            console.log('Column "source" already exists.');
            db.close();
        }
    });
});
