import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPostOperations, userOperations } from './util/database.js';

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
    const posts = blogPostOperations.getAll();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog post
app.get('/api/posts/:id', (req, res) => {
  try {
    const post = blogPostOperations.getById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new blog post
app.post('/api/posts', (req, res) => {
  try {
    const { user_id, title, category, content } = req.body;
    
    if (!user_id || !title || !category || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newPost = blogPostOperations.create(user_id, title, category, content);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update blog post
app.put('/api/posts/:id', (req, res) => {
  try {
    const { user_id, title, category, content } = req.body;
    const postId = req.params.id;
    
    if (!user_id || !title || !category || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const updatedPost = blogPostOperations.update(postId, user_id, title, category, content);
    
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete blog post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const success = blogPostOperations.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = userOperations.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
app.post('/api/users', (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const newUser = userOperations.create(name, email);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});