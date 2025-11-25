const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/checkout - Create order from cart
router.post('/', authenticateToken, (req, res) => {
  // Get cart items with product details
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

      if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Check stock for all items
      for (let item of items) {
        if (item.quantity > item.stock) {
          return res.status(400).json({ 
            error: 'Not enough stock',
            product: item.name,
            available: item.stock,
            requested: item.quantity
          });
        }
      }

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Create order
        db.run(
          'INSERT INTO orders (user_id, total) VALUES (?, ?)',
          [req.user.id, total],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to create order' });
            }

            const orderId = this.lastID;

            // Insert order items and update stock
            let completed = 0;
            let hasError = false;

            items.forEach(item => {
              if (hasError) return;

              // Insert order item
              db.run(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price],
                (err) => {
                  if (err) {
                    hasError = true;
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to save order items' });
                  }

                  // Update product stock
                  db.run(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.product_id],
                    (err) => {
                      if (err) {
                        hasError = true;
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to update stock' });
                      }

                      completed++;

                      // If all items processed
                      if (completed === items.length) {
                        // Clear cart
                        db.run(
                          'DELETE FROM cart_items WHERE user_id = ?',
                          [req.user.id],
                          (err) => {
                            if (err) {
                              db.run('ROLLBACK');
                              return res.status(500).json({ error: 'Failed to clear cart' });
                            }

                            db.run('COMMIT', (err) => {
                              if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Failed to commit transaction' });
                              }

                              res.json({
                                message: 'Order created successfully',
                                order_id: orderId,
                                total,
                                items: items.map(item => ({
                                  product_id: item.product_id,
                                  name: item.name,
                                  quantity: item.quantity,
                                  price: item.price,
                                  subtotal: item.subtotal
                                }))
                              });
                            });
                          }
                        );
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
    }
  );
});

// GET /api/checkout/orders - Get user's orders
router.get('/orders', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
      o.id,
      o.total,
      o.created_at,
      GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')', ', ') as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC`,
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(orders);
    }
  );
});

// GET /api/checkout/orders/:id - Get order details
router.get('/orders/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      db.all(
        `SELECT 
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name,
          (oi.quantity * oi.price) as subtotal
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [req.params.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            ...order,
            items
          });
        }
      );
    }
  );
});

module.exports = router;
