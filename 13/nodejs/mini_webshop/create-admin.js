const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'webshop.db');
const db = new sqlite3.Database(dbPath);

async function createAdminUser() {
  const email = 'admin@webshop.hu';
  const password = 'admin123';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT OR REPLACE INTO users (id, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
      [1, email, hashedPassword, 1],
      function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('✅ Admin user created successfully!');
          console.log('📧 Email: admin@webshop.hu');
          console.log('🔑 Password: admin123');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createAdminUser();
