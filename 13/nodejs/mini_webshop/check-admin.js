const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'webshop.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking admin user...\n');

db.all('SELECT id, email, is_admin FROM users', [], (err, users) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('All users:');
    console.table(users);
  }
  db.close();
});
