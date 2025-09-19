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
                c.priority,
                sa.department,
                u_citizen.name as citizenName,
                u_citizen.email as citizenEmail,
                u_staff.name as assignedStaff,
                l.zone,
                l.ward,
                l.area_name as areaName,
                p.problem_name as problemType,
                CONCAT(l.area_name, ', ', l.ward, ', ', l.zone) as location
            FROM Complaints c
            JOIN users u_citizen ON c.user_id = u_citizen.user_id
            LEFT JOIN staff_assignments sa ON c.complaint_id = sa.complaint_id
            LEFT JOIN users u_staff ON sa.staff_id = u_staff.user_id
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
                department: complaint.department,
                assignedStaff: complaint.assignedStaff,
                priority: complaint.priority,
                location: complaint.location,
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
// Get all staff members from database
router.get('/staff', (req, res) => {
    try {
        console.log('=== ADMIN STAFF FETCH ===');
        
        const query = `
            SELECT 
                user_id as id,
                name,
                email,
                contact as phone,
                'available' as status,
                (
                    SELECT COUNT(*) 
                    FROM Staff_Assignments sa 
                    WHERE sa.staff_id = users.user_id 
                    AND sa.status_update != 'Resolved'
                ) as active_assignments
            FROM users
            WHERE role = 'staff'
            ORDER BY name
        `;
        
        pool.query(query, (err, results) => {
            if (err) {
                console.error('Database error during staff fetch:', err);
                return res.status(500).json({ error: 'Error fetching staff: ' + err.message });
            }
            
            console.log('Returning', results.length, 'staff members from database');
            res.json(results);
        });
    } catch (error) {
        console.error('Admin staff fetch error:', error);
        res.status(500).json({ error: 'Server error during staff fetch: ' + error.message });
    }
});
// Get complaints by department for chart
router.get('/departments', (req, res) => {
    try {
        console.log('=== ADMIN DEPARTMENTS FETCH ===');
        
        // Fixed departments list
        const departments = [
            { id: 1, name: 'WATER', description: 'Water related issues' },
            { id: 2, name: 'ROADS', description: 'Road maintenance and infrastructure' },
            { id: 3, name: 'WASTE', description: 'Waste management and sanitation' },
            { id: 4, name: 'ELECTRICITY', description: 'Electrical and power related issues' },
            { id: 5, name: 'GENERAL', description: 'General municipal issues' }
        ];
        
        console.log('Returning fixed departments list');
        res.json(departments);
        
    } catch (error) {
        console.error('Admin departments fetch error:', error);
        res.status(500).json({ error: 'Server error during departments fetch: ' + error.message });
    }
});
// Update complaint status (for assignment functionality)
router.put('/complaints/:id/assign', (req, res) => {
    const { department, assignedStaff, priority, notes } = req.body;
    const complaintId = req.params.id;

    console.log('=== ADMIN COMPLAINT ASSIGNMENT ===');
    console.log(`Assigning complaint #${complaintId} to staff: ${assignedStaff} with priority: ${priority}`);
    
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ error: 'Database connection error: ' + err.message });
        }

        // Begin transaction
        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error beginning transaction:', err);
                return res.status(500).json({ error: 'Transaction error: ' + err.message });
            }

            // 1. Get staff ID from staff name
            const getStaffIdQuery = 'SELECT user_id FROM Users WHERE name = ? AND role = "staff"';
            connection.query(getStaffIdQuery, [assignedStaff], (err, staffResults) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error('Error finding staff member:', err);
                        res.status(500).json({ error: 'Error finding staff member: ' + err.message });
                    });
                }
                
                if (staffResults.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).json({ error: 'Staff member not found' });
                    });
                }
                
                const staffId = staffResults[0].user_id;

                // 2. Update complaint status and priority
                const updateComplaintQuery = `
                    UPDATE Complaints 
                    SET status = 'In Progress', priority = ?, updated_at = NOW()
                    WHERE complaint_id = ?
                `;
                connection.query(updateComplaintQuery, [priority, complaintId], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error('Error updating complaint status:', err);
                            res.status(500).json({ error: 'Error updating complaint status: ' + err.message });
                        });
                    }

                    // 3. Insert into staff_assignments table
                    const insertAssignmentQuery = `
                        INSERT INTO staff_assignments 
                        (complaint_id, staff_id, assigned_at, progress_notes, status_update) 
                        VALUES (?, ?, NOW(), ?, 'In Progress')
                    `;
                    connection.query(insertAssignmentQuery, [complaintId, staffId, notes || ''], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error('Error inserting assignment:', err);
                                res.status(500).json({ error: 'Error inserting assignment: ' + err.message });
                            });
                        }
                        
                        // 4. Add to status history
                        const statusHistoryQuery = `
                            INSERT INTO Complaint_Status_History 
                            (complaint_id, staff_id, status, updated_by)
                            VALUES (?, ?, 'In Progress', ?)
                        `;
                        connection.query(statusHistoryQuery, [complaintId, staffId, staffId], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Error inserting status history:', err);
                                    res.status(500).json({ error: 'Error inserting status history: ' + err.message });
                                });
                            }

                            // Commit transaction
                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error('Error committing transaction:', err);
                                        res.status(500).json({ error: 'Error committing transaction: ' + err.message });
                                    });
                                }

                                connection.release();
                                console.log('Complaint', complaintId, 'assigned successfully.');
                                res.json({ success: true, message: 'Complaint assigned successfully' });
                            });
                        });
                    });
                });
            });
        });
    });
});
module.exports = router;
