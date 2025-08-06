// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { nid, name, email, password, role, contact } = req.body;

    // Validate input
    if (!password || password.length < 6) {
      return res.status(400).send('Password must be at least 6 characters');
    }

    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash); // Debug log

    pool.query(
      'INSERT INTO users (nid, name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
      [nid, name, email, hash, role, contact],
      (err, result) => {
        if (err) {
          console.error('Database error during signup:', err);
          return res.status(500).send('Error saving user: ' + err.message);
        }
        res.send('User registered successfully!');
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Server error during signup');
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt for email:', email); // Debug log

  pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).send('Error checking user: ' + err.message);
      }
      
      if (results.length === 0) {
        console.log('User not found for email:', email);
        return res.status(401).send('User not found');
      }

      const user = results[0];
      console.log('Found user:', user.email);
      console.log('Stored hash length:', user.password ? user.password.length : 'null');
      console.log('Input password length:', password ? password.length : 'null');

      // Check if password or hash is null/undefined
      if (!password || !user.password) {
        console.log('Missing password or hash');
        return res.status(400).send('Invalid login data');
      }

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          console.error('Bcrypt compare error:', err);
          console.error('Hash being compared:', user.password);
          console.error('Password being compared:', password);
          return res.status(500).send('Error comparing passwords: ' + err.message);
        }
        
        if (!match) {
          console.log('Password mismatch for user:', email);
          return res.status(401).send('Wrong password');
        }

        console.log('Login successful for user:', email);
        res.send('Login successful!');
      });
    }
  );
});

module.exports = router;