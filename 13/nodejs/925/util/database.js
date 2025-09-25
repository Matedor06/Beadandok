import Database from "better-sqlite3";

const db = new Database("./database/database.sqlite");

// Fixing the CREATE TABLE statement
db.prepare(
  "CREATE TABLE IF NOT EXISTS cars (id INTEGER PRIMARY KEY AUTOINCREMENT, brand STRING, model STRING)"
).run();

// Fixing the functions
export const getCar = () => db.prepare("SELECT * FROM cars").all();
export const getCarByID = (id) =>
  db.prepare("SELECT * FROM cars WHERE id = ?").get(id);
export const saveCar = (brand, model) =>
  db.prepare("INSERT INTO cars (brand, model) VALUES (?, ?)").run(brand, model);
export const updateCar = (id, brand, model) =>
  db
    .prepare("UPDATE cars SET brand = ?, model = ? WHERE id = ?")
    .run(brand, model, id);
export const deleteCar = (id) =>
  db.prepare("DELETE FROM cars WHERE id = ?").run(id);

// Fixing the initialization logic
const cars = getCar();
if (!cars.length) {
  saveCar("Toyota", "Corolla");
  saveCar("Ford", "Mustang");
  saveCar("Tesla", "Model S");
}
