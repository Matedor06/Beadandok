import express from "express";
import db from "../data/db.js";

const router = express.Router();

// Get all users
router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.status(200).json(users);
});

// Get a user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const posts = db.prepare("SELECT * FROM posts WHERE userId = ?").all(userId);

  if (posts.length === 0) {
    return res.status(404).json({ error: "No posts found for this user" });
  }

  res.status(200).json(posts);
});

// Create a new user
router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  const result = db
    .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    .run(name, email, password);
  const newUser = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(newUser);
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
  if (result.changes > 0) {
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Update a user by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res
      .status(400)
      .json({ error: "Email, name, and password are required" });
  }

  const result = db
    .prepare("UPDATE users SET email = ?, name = ?, password = ? WHERE id = ?")
    .run(email, name, password, id);
  if (result.changes > 0) {
    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
