import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './util/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// Get all blog posts with author information
app.get('/api/posts', (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT 
        id, 
        title, 
        category, 
        content, 
        created_at, 
        updated_at,
        author_name
      FROM blog_posts
      ORDER BY updated_at DESC
    `).all();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single blog post
app.get('/api/posts/:id', (req, res) => {
  try {
    const post = db.prepare(`
      SELECT 
        id, 
        title, 
        category, 
        content, 
        created_at, 
        updated_at,
        author_name
      FROM blog_posts
      WHERE id = ?
    `).get(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new blog post
app.post('/api/posts', (req, res) => {
  try {
    const { author_name, title, category, content } = req.body;
    
    if (!author_name || !title || !category || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const result = db.prepare(`
      INSERT INTO blog_posts (author_name, title, category, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(author_name, title, category, content);
    
    const newPost = db.prepare(`
      SELECT 
        id, 
        title, 
        category, 
        content, 
        created_at, 
        updated_at,
        author_name
      FROM blog_posts
      WHERE id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update blog post
app.put('/api/posts/:id', (req, res) => {
  try {
    const { author_name, title, category, content } = req.body;
    const postId = req.params.id;
    
    if (!author_name || !title || !category || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const result = db.prepare(`
      UPDATE blog_posts 
      SET author_name = ?, title = ?, category = ?, content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(author_name, title, category, content, postId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const updatedPost = db.prepare(`
      SELECT 
        id, 
        title, 
        category, 
        content, 
        created_at, 
        updated_at,
        author_name
      FROM blog_posts
      WHERE id = ?
    `).get(postId);
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete blog post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email FROM users ORDER BY name').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});