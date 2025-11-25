const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/admin/products - Add new product
router.post('/products', (req, res) => {
  const { name, price, stock, description } = req.body;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock are required' });
  }

  db.run(
    'INSERT INTO products (name, price, stock, description) VALUES (?, ?, ?, ?)',
    [name, price, stock, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'Product created successfully',
        product: {
          id: this.lastID,
          name,
          price,
          stock,
          description
        }
      });
    }
  );
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', (req, res) => {
  const { name, price, stock, description } = req.body;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock are required' });
  }

  db.run(
    'UPDATE products SET name = ?, price = ?, stock = ?, description = ? WHERE id = ?',
    [name, price, stock, description || '', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Product updated successfully',
        product: {
          id: req.params.id,
          name,
          price,
          stock,
          description
        }
      });
    }
  );
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', (req, res) => {
  db.run(
    'DELETE FROM products WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    }
  );
});

// GET /api/admin/stats - Get statistics
router.get('/stats', (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COALESCE(SUM(total), 0) FROM orders) as total_revenue
    `,
    [],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(stats);
    }
  );
});

module.exports = router;
