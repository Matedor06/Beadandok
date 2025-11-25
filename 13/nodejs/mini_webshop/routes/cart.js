const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
      ci.product_id, 
      ci.quantity, 
      p.name, 
      p.price,
      p.stock,
      (ci.quantity * p.price) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?`,
    [req.user.id],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      res.json({
        items,
        total
      });
    }
  );
});

// POST /api/cart - Add item to cart
router.post('/', authenticateToken, (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid product_id and quantity required' });
  }

  // Check if product exists and has enough stock
  db.get(
    'SELECT stock FROM products WHERE id = ?',
    [product_id],
    (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check current cart quantity
      db.get(
        'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
        [req.user.id, product_id],
        (err, cartItem) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const currentQuantity = cartItem ? cartItem.quantity : 0;
          const newQuantity = currentQuantity + quantity;

          if (newQuantity > product.stock) {
            return res.status(400).json({ 
              error: 'Not enough stock',
              available: product.stock,
              requested: newQuantity
            });
          }

          // Insert or update cart item
          db.run(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON CONFLICT(user_id, product_id) 
             DO UPDATE SET quantity = quantity + ?`,
            [req.user.id, product_id, quantity, quantity],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({ 
                message: 'Item added to cart',
                product_id,
                quantity: newQuantity
              });
            }
          );
        }
      );
    }
  );
});

// PUT /api/cart/:product_id - Update cart item quantity
router.put('/:product_id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const product_id = req.params.product_id;

  if (quantity < 0) {
    return res.status(400).json({ error: 'Quantity must be non-negative' });
  }

  // If quantity is 0, delete the item
  if (quantity === 0) {
    db.run(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'Item removed from cart' });
      }
    );
    return;
  }

  // Check stock
  db.get(
    'SELECT stock FROM products WHERE id = ?',
    [product_id],
    (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({ 
          error: 'Not enough stock',
          available: product.stock
        });
      }

      db.run(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, req.user.id, product_id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Item not in cart' });
          }

          res.json({ 
            message: 'Cart updated',
            product_id,
            quantity
          });
        }
      );
    }
  );
});

// DELETE /api/cart/:product_id - Remove item from cart
router.delete('/:product_id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [req.user.id, req.params.product_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not in cart' });
      }

      res.json({ message: 'Item removed from cart' });
    }
  );
});

module.exports = router;
