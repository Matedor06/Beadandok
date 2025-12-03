import Database from "better-sqlite3";

const db = new Database('car.db');

db.exec('CREATE TABLE IF NOT EXISTS cars(id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL)');


const count = db.prepare('SELECT COUNT(*) as count FROM cars').get().count
if(count ===0){
    const insert = db.prepare('INSERT INTO cars (brand, model, year) VALUES (?,?,?)');
    insert.run('Bmw','320',1999);
}   

export default db
