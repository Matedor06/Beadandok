const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'webshop.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting database migration...');

db.serialize(() => {
  // Add is_admin column to users table
  db.run('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0', (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ Column is_admin already exists');
      } else {
        console.error('❌ Error adding column:', err.message);
      }
    } else {
      console.log('✅ Column is_admin added successfully');
    }
    
    db.close(() => {
      console.log('Migration completed!');
    });
  });
});
