const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { nid, name, email, password, role, phone } = req.body;

    // Validate input
    if (!password || password.length < 6) {
      console.log('Password validation failed');
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters' 
      });
    }

    if (!nid || !name || !email || !role || !phone) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format during signup');
      return res.status(400).json({ 
        success: false,
        error: 'Please enter a valid email address' 
      });
    }

    // Validate role
    const validRoles = ['user', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role during signup:', role);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role selected' 
      });
    }

    // Check if user already exists
    pool.query(
      'SELECT * FROM users WHERE email = ? OR nid = ?',
      [email, nid],
      async (err, results) => {
        if (err) {
          console.error('Database error during signup check:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Database error: ' + err.message 
          });
        }

        if (results.length > 0) {
          console.log('User already exists');
          return res.status(400).json({ 
            success: false,
            error: 'User with this email or NID already exists' 
          });
        }

        // Hash password and create user
        try {
          const hash = await bcrypt.hash(password, 10);
          console.log('Password hashed successfully');

          pool.query(
            'INSERT INTO users (nid, name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [nid, name, email, hash, role, phone],
            (err, result) => {
              if (err) {
                console.error('Database error during user insertion:', err);
                return res.status(500).json({ 
                  success: false,
                  error: 'Error saving user: ' + err.message 
                });
              }
              console.log('User created successfully with user_id:', result.insertId);
              res.json({ 
                success: true, 
                message: 'User registered successfully!',
                user_id: result.insertId 
              });
            }
          );
        } catch (hashError) {
          console.error('Hashing error:', hashError);
          res.status(500).json({ 
            success: false,
            error: 'Server error during password hashing' 
          });
        }
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during signup: ' + error.message 
    });
  }
});

// Improved Signin Route
router.post('/signin', (req, res) => {
  const { email, password, role } = req.body;

  console.log('Login attempt for email:', email, 'role:', role);

  // Validate required fields
  if (!email || !password || !role) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      success: false,
      error: 'Email, password, and role are required' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Invalid email format');
    return res.status(400).json({ 
      success: false,
      error: 'Please enter a valid email address' 
    });
  }

  // Validate role
  const validRoles = ['user', 'staff', 'admin'];
  if (!validRoles.includes(role)) {
    console.log('Invalid role during signin:', role);
    return res.status(400).json({ 
      success: false,
      error: 'Invalid role selected' 
    });
  }

  // Query database for user with matching email and role
  pool.query(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, role],
    (err, results) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Database error occurred. Please try again.' 
        });
      }
      
      if (results.length === 0) {
        console.log('User not found for email:', email, 'with role:', role);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid email, password, or role. Please check your credentials.' 
        });
      }

      const user = results[0];
      console.log('User found:', { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role 
      });

      // Compare password
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          console.error('Bcrypt compare error:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Authentication error occurred. Please try again.' 
          });
        }
        
        if (!match) {
          console.log('Password mismatch for user:', email);
          return res.status(401).json({ 
            success: false,
            error: 'Invalid email, password, or role. Please check your credentials.' 
          });
        }

        // Login successful
        console.log('Login successful for user:', email, 'with role:', user.role);
        
        // Return success response with user data (excluding password)
        res.json({ 
          success: true, 
          message: 'Login successful!',
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            nid: user.nid,
            contact: user.contact
          }
        });
      });
    }
  );
});

// Add a logout route (for future use with sessions)
router.post('/logout', (req, res) => {
  // This would clear session data when you implement sessions
  console.log('Logout request received');
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// User profile route (get current user info)
router.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  
  console.log('Profile request for user_id:', userId);
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      error: 'User ID is required' 
    });
  }

  pool.query(
    'SELECT user_id, nid, name, email, role, contact FROM users WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Database error during profile fetch:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Database error occurred' 
        });
      }
      
      if (results.length === 0) {
        console.log('User not found for user_id:', userId);
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      const user = results[0];
      console.log('User profile retrieved for:', user.email);
      
      res.json({ 
        success: true,
        user: user
      });
    }
  );
});

// Optional: Add a route to verify if user is logged in (for session management)
router.get('/verify', (req, res) => {
  // This would be used with session management
  // For now, just return a basic response
  res.json({ 
    success: true,
    message: 'Verification endpoint active' 
  });
});

module.exports = router;