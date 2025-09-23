import Database from "better-sqlite3";

const db = new Database("./data/database.sqlite");

// Fixing the CREATE TABLE statement
db.prepare('CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title STRING, author STRING)').run();

// Fixing the functions
export const getBook = () => db.prepare('SELECT * FROM books').all();
export const getBookByID = (id) => db.prepare('SELECT * FROM books WHERE id = ?').get(id);
export const saveBook = (title, author) => db.prepare('INSERT INTO books (title, author) VALUES (?, ?)').run(title, author);
export const updateBook = (id, title, author) => db.prepare('UPDATE books SET title = ?, author = ? WHERE id = ?').run(title, author, id);
export const deleteBook = (id) => db.prepare('DELETE FROM books WHERE id = ?').run(id);

// Fixing the initialization logic
const books = getBook();
if (!books.length) {
    saveBook("Bible", "God");
    saveBook("1984", "G. Orwell");
    saveBook("To Kill a Mockingbird", "Harper Lee"); // Replacing controversial content
}