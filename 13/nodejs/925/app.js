import express from "express";
import * as db from "./util/database.js";

const app = express();
const PORT = 3000; // Define the port number
app.use(express.json());

// GET all cars
app.get("/cars", (req, res) => {
  try {
    const cars = db.getCar();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// GET car by ID
app.get("/cars/:id", (req, res) => {
  try {
    const car = db.getCarByID(req.params.id);
    if (car) {
      res.status(200).json(car);
    } else {
      res.status(404).json({ error: "Car not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

// POST (add a new car)
app.post("/cars", (req, res) => {
  const { brand, model } = req.body;
  if (!brand || !model) {
    return res.status(400).json({ error: "Brand and model are required" });
  }
  try {
    db.saveCar(brand, model);
    res.status(201).json({ message: "Car added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add car" });
  }
});

// PUT (update a car)
app.put("/cars/:id", (req, res) => {
  const { brand, model } = req.body;
  const { id } = req.params;
  if (!brand || !model) {
    return res.status(400).json({ error: "Brand and model are required" });
  }
  try {
    const car = db.getCarByID(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    db.updateCar(id, brand, model);
    res.status(200).json({ message: "Car updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update car" });
  }
});

// DELETE (delete a car)
app.delete("/cars/:id", (req, res) => {
  const { id } = req.params;
  try {
    const car = db.getCarByID(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    db.deleteCar(id);
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
