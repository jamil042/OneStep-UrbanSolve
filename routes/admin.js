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

// Update complaint status (for assignment functionality)
router.put('/complaints/:id/assign', (req, res) => {
    // The department is now correctly received from the request body
    const { department, assignedStaff, priority, notes } = req.body;
    const complaintId = req.params.id;

    console.log('=== ADMIN COMPLAINT ASSIGNMENT ===');
    console.log(`Assigning complaint #${complaintId} to staff: ${assignedStaff} in department: ${department}`);
    
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ error: 'Database connection error: ' + err.message });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error beginning transaction:', err);
                return res.status(500).json({ error: 'Transaction error: ' + err.message });
            }

            const getStaffIdQuery = 'SELECT user_id FROM Users WHERE name = ? AND role = "staff"';
            connection.query(getStaffIdQuery, [assignedStaff], (err, staffResults) => {
                if (err || staffResults.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        const errorMessage = err ? 'Error finding staff member: ' + err.message : 'Staff member not found';
                        console.error(errorMessage);
                        res.status(err ? 500 : 404).json({ error: errorMessage });
                    });
                }
                
                const staffId = staffResults[0].user_id;

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

                    // --- FIX IS HERE ---
                    // 1. Added `department` to the query
                    const insertAssignmentQuery = `
                        INSERT INTO staff_assignments 
                        (complaint_id, staff_id, department, assigned_at, progress_notes, status_update) 
                        VALUES (?, ?, ?, NOW(), ?, 'In Progress')
                    `;
                    // 2. Added the `department` variable to the parameters
                    connection.query(insertAssignmentQuery, [complaintId, staffId, department, notes || ''], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error('Error inserting assignment:', err);
                                res.status(500).json({ error: 'Error inserting assignment: ' + err.message });
                            });
                        }
                        
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

// Add this new route to the end of your admin.js file, before `module.exports = router;`
router.get('/departments', (req, res) => {
    console.log('=== ADMIN DEPARTMENTS FETCH ===');
    const query = 'SELECT dept_id, name FROM Departments ORDER BY name';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ error: 'Failed to fetch departments' });
        }
        res.json(results);
    });
});

router.post('/departments', (req, res) => {
    console.log('=== ADMIN ADD DEPARTMENT ===');
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
    }

    const query = 'INSERT INTO Departments (name, description) VALUES (?, ?)';
    
    pool.query(query, [name, description || null], (err, result) => {
        if (err) {
            console.error('Error adding new department:', err);
            return res.status(500).json({ error: 'Failed to add new department' });
        }
        console.log('Department added successfully with ID:', result.insertId);
        // Send back the new department's data
        res.status(201).json({ 
            success: true, 
            message: 'Department added successfully', 
            department: { dept_id: result.insertId, name, description } 
        });
    });
});



module.exports = router;