const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (authDb) => {
  const router = express.Router();

  // Register route
  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
      authDb.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        authDb.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error creating user' });
            }
            
            res.json({ 
              message: 'Registration successful', 
              user: { name, email, role: 'user' } 
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Login route
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    authDb.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.json({ 
        message: 'Login successful', 
        user: { 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    });
  });

  return router;
};