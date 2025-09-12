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
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
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
    INSERT INTO blog_posts (user_id, title, category, content, created_at, updated_at) 
    VALUES (?, ?, ?, ?, datetime('now', '-5 days'), datetime('now', '-2 days'))
  `);
    insertPost.run(1, 'Első blogbejegyzésem', 'Személyes', 'Ez az első blogbejegyzésem. Itt osztom meg gondolataimat a világot. Remélem tetszik!');
  insertPost.run(1, 'Webfejlesztési tippek', 'Technológia', 'Ma szeretnék megosztani néhány hasznos webfejlesztési tippet. A modern JavaScript eszközök lehetővé teszik számunkra, hogy hatékonyabb és fenntarthatóbb kódot írjunk. A Node.js és az Express keretrendszer segítségével gyorsan létrehozhatunk robusztus webalkalmazásokat. Az adatbázis-kezelés területén az SQLite egy kiváló választás kisebb projektekhez, mivel könnyű telepíteni és használni. A better-sqlite3 könyvtár pedig nagyszerű teljesítményt nyújt a JavaScript ökoszisztémában. Fontos megjegyezni, hogy mindig használjunk prepared statement-eket az SQL injection támadások elkerülése érdekében.');
  
  insertPost.run(2, 'Utazási élmények', 'Utazás', 'A múlt héten Budapesten jártam. Csodálatos város volt, tele történelemmel és kultúrával.');
  insertPost.run(2, 'Könyv ajánlók', 'Kultúra', 'Mostanában sok jó könyvet olvastam. Itt van néhány ajánlatom mindenkinek...');
  
  insertPost.run(3, 'Főzési receptek', 'Gasztronómia', 'Ma egy finom magyar gulyás receptjét szeretném megosztani veletek. Ez egy családi recept, amit nagyanyámtól tanultam. A hozzávalók: 50 dkg marhahús, 2 nagy vöröshagyma, 3 evőkanál olaj, 2 evőkanál édes pirospaprika, 1 paradicsom, 2 paprika, 2 krumpli, só, bors, kömény. Az elkészítés: Először a hagymát dinszteljük meg, majd hozzáadjuk a húst és megpirítjuk. Ezután jön a paprika, a paradicsompüré, és fokozatosan öntjük fel vízzel. Sózzuk, borsozzuk, és adjunk hozzá egy csipet köményt. Lassú tűzön főzzük, amíg a hús megpuhul, majd hozzáadjuk a felkockázott zöldségeket.');
  insertPost.run(3, 'Egészséges életmód', 'Egészség', 'Az egészséges életmód fontossága napjainkban egyre inkább előtérbe kerül. Íme néhány tipp...');
}

// Prepared statements for blog posts
const getAllPostsStmt = db.prepare(`
  SELECT 
    p.id, 
    p.title, 
    p.category, 
    p.content, 
    p.created_at, 
    p.updated_at,
    p.user_id,
    u.name as author_name
  FROM blog_posts p
  JOIN users u ON p.user_id = u.id
  ORDER BY p.updated_at DESC
`);

const getPostByIdStmt = db.prepare(`
  SELECT 
    p.id, 
    p.title, 
    p.category, 
    p.content, 
    p.created_at, 
    p.updated_at,
    p.user_id,
    u.name as author_name
  FROM blog_posts p
  JOIN users u ON p.user_id = u.id
  WHERE p.id = ?
`);

const createPostStmt = db.prepare(`
  INSERT INTO blog_posts (user_id, title, category, content, created_at, updated_at)
  VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
`);

const updatePostStmt = db.prepare(`
  UPDATE blog_posts 
  SET user_id = ?, title = ?, category = ?, content = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const deletePostStmt = db.prepare('DELETE FROM blog_posts WHERE id = ?');

// Prepared statements for users
const getAllUsersStmt = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY name');

const createUserStmt = db.prepare(`
  INSERT INTO users (name, email, created_at)
  VALUES (?, ?, datetime('now'))
`);

const getUserByIdStmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');

// Blog post operations
export const blogPostOperations = {
  getAll: () => {
    try {
      return getAllPostsStmt.all();
    } catch (error) {
      throw new Error('Failed to fetch posts');
    }
  },

  getById: (id) => {
    try {
      return getPostByIdStmt.get(id);
    } catch (error) {
      throw new Error('Failed to fetch post');
    }
  },

  create: (user_id, title, category, content) => {
    try {
      const result = createPostStmt.run(user_id, title, category, content);
      return getPostByIdStmt.get(result.lastInsertRowid);
    } catch (error) {
      throw new Error('Failed to create post');
    }
  },

  update: (id, user_id, title, category, content) => {
    try {
      const result = updatePostStmt.run(user_id, title, category, content, id);
      if (result.changes === 0) {
        return null; // Post not found
      }
      return getPostByIdStmt.get(id);
    } catch (error) {
      throw new Error('Failed to update post');
    }
  },

  delete: (id) => {
    try {
      const result = deletePostStmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw new Error('Failed to delete post');
    }
  }
};

// User operations
export const userOperations = {
  getAll: () => {
    try {
      return getAllUsersStmt.all();
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  },

  getById: (id) => {
    try {
      return getUserByIdStmt.get(id);
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  },

  create: (name, email) => {
    try {
      const result = createUserStmt.run(name, email);
      return getUserByIdStmt.get(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const customError = new Error('Email already exists');
        customError.code = 'EMAIL_EXISTS';
        throw customError;
      }
      throw new Error('Failed to create user');
    }
  }
};

export default db;