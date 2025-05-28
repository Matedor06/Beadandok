import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../data/database.sqlite'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert sample users if the table is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  insertUser.run('Kovács Anna', 'anna.kovacs@email.com');
  insertUser.run('Nagy Péter', 'peter.nagy@email.com');
  insertUser.run('Szabó Mária', 'maria.szabo@email.com');
    // Insert sample blog posts
  const insertPost = db.prepare(`
    INSERT INTO blog_posts (author_name, title, category, content, created_at, updated_at) 
    VALUES (?, ?, ?, ?, datetime('now', '-5 days'), datetime('now', '-2 days'))
  `);
  
  insertPost.run('Kovács Anna', 'Első blogbejegyzésem', 'Személyes', 'Ez az első blogbejegyzésem. Itt osztom meg gondolataimat a világot. Remélem tetszik!');
  insertPost.run('Kovács Anna', 'Webfejlesztési tippek', 'Technológia', 'Ma szeretnék megosztani néhány hasznos webfejlesztési tippet. A modern JavaScript eszközök...');
  
  insertPost.run('Nagy Péter', 'Utazási élmények', 'Utazás', 'A múlt héten Budapesten jártam. Csodálatos város volt, tele történelemmel és kultúrával.');
  insertPost.run('Nagy Péter', 'Könyv ajánlók', 'Kultúra', 'Mostanában sok jó könyvet olvastam. Itt van néhány ajánlatom mindenkinek...');
  
  insertPost.run('Szabó Mária', 'Főzési receptek', 'Gasztronómia', 'Ma egy finom magyar gulyás receptjét szeretném megosztani veletek. Ez egy családi recept...');
  insertPost.run('Szabó Mária', 'Egészséges életmód', 'Egészség', 'Az egészséges életmód fontossága napjainkban egyre inkább előtérbe kerül. Íme néhány tipp...');
}

export default db;