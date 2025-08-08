// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { nid, name, email, password, role, phone } = req.body;

    // Validate input
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!nid || !name || !email || !role || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    pool.query(
      'SELECT * FROM users WHERE email = ? OR nid = ?',
      [email, nid],
      async (err, results) => {
        if (err) {
          console.error('Database error during signup check:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: 'User with this email or NID already exists' });
        }

        // Hash password and create user
        try {
          const hash = await bcrypt.hash(password, 10);
          console.log('Generated hash:', hash); // Debug log

          pool.query(
            'INSERT INTO users (nid, name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [nid, name, email, hash, role, phone], // Fixed: using 'phone' instead of 'contact'
            (err, result) => {
              if (err) {
                console.error('Database error during signup:', err);
                return res.status(500).json({ error: 'Error saving user: ' + err.message });
              }
              res.json({ success: true, message: 'User registered successfully!' });
            }
          );
        } catch (hashError) {
          console.error('Hashing error:', hashError);
          res.status(500).json({ error: 'Server error during signup' });
        }
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
router.post('/signin', (req, res) => {
  const { email, password, role } = req.body;

  console.log('Login attempt for email:', email, 'role:', role); // Debug log

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  pool.query(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, role],
    (err, results) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        console.log('User not found for email:', email, 'with role:', role);
        return res.status(401).json({ error: 'Invalid credentials or role' });
      }

      const user = results[0];
      console.log('Found user:', user.email);

      // Check if password or hash is null/undefined
      if (!password || !user.password) {
        console.log('Missing password or hash');
        return res.status(400).json({ error: 'Invalid login data' });
      }

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          console.error('Bcrypt compare error:', err);
          return res.status(500).json({ error: 'Authentication error' });
        }
        
        if (!match) {
          console.log('Password mismatch for user:', email);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);
        res.json({ 
          success: true, 
          message: 'Login successful!',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      });
    }
  );
});

module.exports = router;