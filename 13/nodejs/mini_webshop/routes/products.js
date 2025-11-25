const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/products - Get all products
router.get('/', (req, res) => {
  db.all(
    'SELECT id, name, price, stock, description FROM products ORDER BY name',
    [],
    (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(products);
    }
  );
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  db.get(
    'SELECT id, name, price, stock, description FROM products WHERE id = ?',
    [req.params.id],
    (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    }
  );
});

module.exports = router;
