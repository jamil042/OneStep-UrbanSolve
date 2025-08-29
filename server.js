const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/signup.html'));
});

// Dashboard routes for different user roles
app.get('/citizen_dashboard', (req, res) => {
    console.log('Citizen dashboard requested');
    
    // Check if citizen_dashboard.html exists in public folder first
    const citizenDashboardPath = path.join(__dirname, '/public/citizen_dashboard.html');
    
    if (fs.existsSync(citizenDashboardPath)) {
        console.log('Serving citizen_dashboard.html from public folder');
        res.sendFile(citizenDashboardPath);
    } else {
        // Check in root directory
        const rootCitizenDashboardPath = path.join(__dirname, 'citizen_dashboard.html');
        if (fs.existsSync(rootCitizenDashboardPath)) {
            console.log('Serving citizen_dashboard.html from root folder');
            res.sendFile(rootCitizenDashboardPath);
        } else {
            console.log('citizen_dashboard.html not found, serving temporary response');
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Citizen Dashboard - OneStep Urban Solve</title>
                </head>
                <body>
                    <div class="container">
                        <h1>🏙️ Citizen Dashboard</h1>
                        <div class="welcome">
                            <h2>Welcome, Citizen!</h2>
                            <p>You have successfully logged in to OneStep Urban Solve.</p>
                            <p>This is your citizen dashboard where you can report issues and track complaints.</p>
                        </div>

                        <div class="nav-links">
                            <a href="/signin" class="nav-link">← Back to Sign In</a>
                            <a href="/" class="nav-link">🏠 Home</a>
                        </div>

                        <div class="features">
                            <div class="feature">
                                <h3>📝 Submit Complaints</h3>
                                <p>Report urban issues in your area</p>
                            </div>
                            <div class="feature">
                                <h3>📊 Track Status</h3>
                                <p>Monitor your complaint progress</p>
                            </div>
                            <div class="feature">
                                <h3>🗺️ View Map</h3>
                                <p>See issues in your neighborhood</p>
                            </div>
                            <div class="feature">
                                <h3>📞 Contact Support</h3>
                                <p>Get help when you need it</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
    }
});

app.get('/staff_dashboard', (req, res) => {
    console.log('Staff dashboard requested');
    
    // Check if staff_dashboard.html exists, otherwise serve a placeholder or redirect
    const staffDashboardPath = path.join(__dirname, '/public/staff_dashboard.html');
    
    if (fs.existsSync(staffDashboardPath)) {
        res.sendFile(staffDashboardPath);
    } else {
        // If staff dashboard doesn't exist, serve a temporary page or redirect
        console.log('staff_dashboard.html not found, serving temporary response');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Staff Dashboard - OneStep Urban Solve</title>
            </head>
            <body>
                <div class="container">
                    <h1>🏢 Staff Dashboard</h1>
                    <div class="message">
                        <h2>Welcome, Staff Member!</h2>
                        <p>The staff dashboard is currently under development.</p>
                        <p>You have successfully logged in with staff privileges.</p>
                        <a href="/signin" class="nav-link">← Back to Sign In</a>
                        <a href="/" class="nav-link">🏠 Home</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

app.get('/admin_dashboard', (req, res) => {
    console.log('Admin dashboard requested');
    
    // Check if admin_dashboard.html exists, otherwise serve a placeholder or redirect
    const adminDashboardPath = path.join(__dirname, '/public/admin_dashboard.html');
    
    if (fs.existsSync(adminDashboardPath)) {
        res.sendFile(adminDashboardPath);
    } else {
        // If admin dashboard doesn't exist, serve a temporary page or redirect
        console.log('admin_dashboard.html not found, serving temporary response');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Dashboard - OneStep Urban Solve</title>
            </head>
            <body>
                
                    <h1>⚙️ Admin Dashboard</h1>
                 
                        <h2>Welcome, Administrator!</h2>
                        <p>The admin dashboard is currently under development.</p>
                        <a href="/signin" class="nav-link">← Back to Sign In</a>
                        <a href="/" class="nav-link">🏠 Home</a>
                  
            </body>
            </html>
        `);
    }
});

// API endpoints using callback style like auth.js
// Fetch all complaints for admin dashboard
app.get('/api/complaints', (req, res) => {
    pool.query('SELECT * FROM Complaints', (err, results) => {
        if (err) {
            console.error('Complaints fetch error:', err);
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }
        res.json(results);
    });
});

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
    console.log('- GET  /staff_dashboard (staff dashboard page)');
    console.log('- GET  /admin_dashboard (admin dashboard page)');
    console.log('- POST /api/signin');
    console.log('- POST /api/signup');
    console.log('- POST /api/complaints (submit complaint)');
    console.log('- GET  /api/complaints/:userId (get user complaints)');
    console.log('- GET  /api/locations');
    console.log('- GET  /api/problems');
});