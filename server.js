const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const pool = require('./database'); // Changed from db to pool
const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enhanced debugging middleware
app.use((req, res, next) => {
    console.log(`\n=== ${new Date().toISOString()} ===`);
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('====================\n');
    next();
});

// Serve static files
app.use(express.static('public'));
app.use(express.static('.'));

// API routes
app.use('/api', authRoutes);
app.use('/api', complaintsRoutes);

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/citizen_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'citizen_dashboard.html'));
});

// API endpoints using callback style like auth.js
app.get('/api/locations', (req, res) => {
    pool.query('SELECT * FROM Locations', (err, results) => {
        if (err) {
            console.error('Location fetch error:', err);
            return res.status(500).json({ error: 'Failed to fetch locations' });
        }
        res.json(results);
    });
});

app.get('/api/problems', (req, res) => {
    pool.query('SELECT * FROM Problem', (err, results) => {
        if (err) {
            console.error('Problem fetch error:', err);
            return res.status(500).json({ error: 'Failed to fetch problems' });
        }
        res.json(results);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Route not found:', req.url);
    res.status(404).json({ error: 'Route not found: ' + req.url });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET  / (homepage)');
    console.log('- GET  /signin (signin page)');
    console.log('- GET  /signup (signup page)');
    console.log('- GET  /citizen_dashboard (citizen dashboard page)');
    console.log('- POST /api/signin');
    console.log('- POST /api/signup');
    console.log('- POST /api/complaints (submit complaint)');
    console.log('- GET  /api/complaints/:userId (get user complaints)');
    console.log('- GET  /api/locations');
    console.log('- GET  /api/problems');
});