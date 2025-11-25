import express from "express";
import db from "../data/db.js";

const router = express.Router();

// Get all posts
router.get("/", (req, res) => {
  const response = db.prepare("SELECT * FROM posts").all();
  res.status(200).json(response);
});

// Get a post by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const response = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (response) {
    res.status(200).json(response);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// Delete a post by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  if (result.changes > 0) {
    res.status(200).json({ message: "Post deleted successfully" });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// Update a post by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const result = db
    .prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
    .run(title, content, id);
  if (result.changes > 0) {
    res.status(200).json({ message: "Post updated successfully" });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

router.post("/", (req, res) => {
    const { userId, title, content } = req.body;

    if (!userId || !title || !content) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const result = db.prepare("INSERT INTO posts (userId, title, content) VALUES (?, ?, ?)").run(userId, title, content);
    const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newPost);
});

export default router;
