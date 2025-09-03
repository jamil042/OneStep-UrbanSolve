const express = require('express');
const router = express.Router();
const pool = require('../database');

// Get all complaints for admin dashboard
router.get('/complaints', (req, res) => {
    try {
        console.log('=== ADMIN COMPLAINTS FETCH ===');
        
        const query = `
            SELECT 
                c.complaint_id as id,
                c.title,
                c.description,
                c.status,
                c.created_at as reportedAt,
                c.updated_at,
                u.name as citizenName,
                u.email as citizenEmail,
                l.zone,
                l.ward,
                l.area_name as areaName,
                p.problem_name as problemType,
                CONCAT(l.area_name, ', ', l.ward, ', ', l.zone) as location
            FROM Complaints c
            JOIN users u ON c.user_id = u.user_id
            JOIN Locations l ON c.location_id = l.location_id
            JOIN Problem p ON c.problem_id = p.problem_id
            ORDER BY c.created_at DESC
        `;
        
        pool.query(query, (err, results) => {
            if (err) {
                console.error('Database error during admin complaints fetch:', err);
                return res.status(500).json({ error: 'Error fetching complaints: ' + err.message });
            }
            
            console.log('Found', results.length, 'complaints for admin');
            
            // Transform results to match frontend format
            const formattedComplaints = results.map(complaint => ({
                id: complaint.id,
                title: complaint.title,
                description: complaint.description,
                citizenName: complaint.citizenName,
                citizenEmail: complaint.citizenEmail,
                reportedAt: complaint.reportedAt,
                status: complaint.status,
                department: null, // Will be set when assignment functionality is added
                assignedStaff: null, // Will be set when assignment functionality is added
                priority: null, // Will be set when assignment functionality is added
                location: complaint.location,
                zone: complaint.zone,
                ward: complaint.ward,
                areaName: complaint.areaName,
                problemType: complaint.problemType
            }));
            
            res.json(formattedComplaints);
        });
    } catch (error) {
        console.error('Admin complaints fetch error:', error);
        res.status(500).json({ error: 'Server error during complaints fetch: ' + error.message });
    }
});

// Get dashboard statistics
router.get('/stats', (req, res) => {
    try {
        console.log('=== ADMIN STATS FETCH ===');
        
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
            FROM Complaints
        `;
        
        pool.query(query, (err, results) => {
            if (err) {
                console.error('Database error during admin stats fetch:', err);
                return res.status(500).json({ error: 'Error fetching stats: ' + err.message });
            }
            
            const stats = results[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 };
            const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
            
            console.log('Admin stats:', { ...stats, resolutionRate });
            
            res.json({
                ...stats,
                resolutionRate
            });
        });
    } catch (error) {
        console.error('Admin stats fetch error:', error);
        res.status(500).json({ error: 'Server error during stats fetch: ' + error.message });
    }
});

// Get all staff members
router.get('/staff', (req, res) => {
    try {
        console.log('=== ADMIN STAFF FETCH ===');
        
        // For now, return mock data since you might not have a staff table yet
        // You can create a staff table and update this query later
        const mockStaff = [
            {
                id: 101,
                name: 'John Smith',
                email: 'john.smith@city.gov',
                department: 'Road Maintenance',
                status: 'available',
                complaintsHandled: 0,
                performance: 4.5
            },
            {
                id: 102,
                name: 'Maria Garcia',
                email: 'maria.garcia@city.gov',
                department: 'Water Management',
                status: 'available',
                complaintsHandled: 0,
                performance: 4.8
            },
            {
                id: 103,
                name: 'Robert Johnson',
                email: 'robert.j@city.gov',
                department: 'Electrical',
                status: 'available',
                complaintsHandled: 0,
                performance: 4.2
            }
        ];
        
        console.log('Returning', mockStaff.length, 'staff members');
        res.json(mockStaff);
    } catch (error) {
        console.error('Admin staff fetch error:', error);
        res.status(500).json({ error: 'Server error during staff fetch: ' + error.message });
    }
});

// Get complaints by department for chart
router.get('/complaints/by-department', (req, res) => {
    try {
        console.log('=== ADMIN DEPARTMENT STATS FETCH ===');
        
        const query = `
            SELECT 
                p.problem_name as department,
                COUNT(*) as count
            FROM Complaints c
            JOIN Problem p ON c.problem_id = p.problem_id
            GROUP BY p.problem_name
            ORDER BY count DESC
        `;
        
        pool.query(query, (err, results) => {
            if (err) {
                console.error('Database error during department stats fetch:', err);
                return res.status(500).json({ error: 'Error fetching department stats: ' + err.message });
            }
            
            console.log('Department stats:', results);
            res.json(results);
        });
    } catch (error) {
        console.error('Admin department stats fetch error:', error);
        res.status(500).json({ error: 'Server error during department stats fetch: ' + error.message });
    }
});

// Update complaint status (for assignment functionality)
router.put('/complaints/:id/assign', (req, res) => {
    try {
        const complaintId = req.params.id;
        const { department, assignedStaff, priority, notes } = req.body;
        
        console.log('=== ADMIN COMPLAINT ASSIGNMENT ===');
        console.log('Assigning complaint', complaintId, 'to', assignedStaff);
        
        // For now, just update the status to 'In Progress'
        // You can extend this later to store assignment details in a separate table
        const query = `
            UPDATE Complaints 
            SET status = 'In Progress', updated_at = NOW()
            WHERE complaint_id = ?
        `;
        
        pool.query(query, [complaintId], (err, result) => {
            if (err) {
                console.error('Database error during complaint assignment:', err);
                return res.status(500).json({ error: 'Error assigning complaint: ' + err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Complaint not found' });
            }
            
            console.log('Complaint', complaintId, 'assigned successfully');
            res.json({ 
                success: true,
                message: 'Complaint assigned successfully'
            });
        });
    } catch (error) {
        console.error('Admin complaint assignment error:', error);
        res.status(500).json({ error: 'Server error during complaint assignment: ' + error.message });
    }
});

module.exports = router;