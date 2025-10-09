import db from './db.js';

db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        title TEXT,
        content TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`).run();


export default db;