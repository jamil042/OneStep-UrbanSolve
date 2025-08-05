// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database');

const router = express.Router();

// Signup
router.post('/signup', (req, res) => {
  const { nid, name, email, password, role, contact } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send('Error hashing password');

    pool.query(
      'INSERT INTO users (nid, name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
      [nid, name, email, hash, role, contact],
      (err, result) => {
        if (err) return res.status(500).send('Error saving user');
        res.send('User registered successfully!');
      }
    );
  });
});

// Login
router.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return res.status(500).send('Error checking user');
      if (results.length === 0) return res.status(401).send('User not found');

      const user = results[0];

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return res.status(500).send('Error comparing passwords');
        if (!match) return res.status(401).send('Wrong password');

        res.send('Login successful!');
      });
    }
  );
});

module.exports = router;