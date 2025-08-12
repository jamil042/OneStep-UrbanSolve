const express = require('express');
const router = express.Router();
const db = require('../database');

// Submit new complaint
router.post('/', async (req, res) => {
    try {
        const { title, description, problemType, zone, ward, areaName } = req.body;
        
        // 1. Insert or get location
        const [location] = await db.query(
            `INSERT INTO Locations (zone, ward, area_name) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE location_id=LAST_INSERT_ID(location_id)`,
            [zone, ward, areaName]
        );
        const locationId = location.insertId;

        // 2. Get problem_id
        const [problem] = await db.query(
            `SELECT problem_id FROM Problem WHERE problem_name = ?`,
            [problemType.replace('-', ' ')]
        );

        // 3. Insert complaint
        const [complaint] = await db.query(
            `INSERT INTO Complaints 
             (user_id, problem_id, location_id, title, description, status)
             VALUES (?, ?, ?, ?, ?, 'Pending')`,
            [req.user.id || 1, problem[0].problem_id, locationId, title, description]
        );

        res.json({ 
            success: true,
            complaint_id: complaint.insertId
        });
    } catch (err) {
        console.error('Complaint submission error:', err);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
});

// Get all complaints for user
router.get('/', async (req, res) => {
    try {
        const [complaints] = await db.query(`
            SELECT 
                c.complaint_id as id,
                c.title,
                c.status,
                d.name as dept,
                l.zone,
                l.ward,
                l.area_name as areaName,
                p.problem_name as problemType,
                c.description,
                c.lastUpdated,
                c.createdAt,
                c.priority
            FROM Complaints c
            JOIN Problem p ON c.problem_id = p.problem_id
            JOIN Locations l ON c.location_id = l.location_id
            JOIN Complaint_List cl ON p.problem_id = cl.problem_id
            JOIN Departments d ON cl.dept_id = d.dept_id
            WHERE c.user_id = ?`, 
            [req.user.id || 1] // Replace with actual user ID from auth
        );
        
        res.json(complaints);
    } catch (err) {
        console.error('Complaints fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

module.exports = router;