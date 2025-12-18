const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../expense_manager.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    // Split commands by semicolon to execute them one by one if needed, 
    // but sqlite3's exec can handle multiple statements usually.
    // However, it's safer to exec the whole block.
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema:', err.message);
        } else {
            console.log('Database initialized successfully.');
        }
        db.close();
    });
});
