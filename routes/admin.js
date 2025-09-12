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
    try {
        const complaintId = req.params.id;
        const { department, assignedStaff, priority, notes } = req.body;
        
        console.log('=== ADMIN COMPLAINT ASSIGNMENT ===');
        console.log('Assigning complaint', complaintId, 'to staff:', assignedStaff);
        console.log('Department:', department, 'Priority:', priority, 'Notes:', notes);
        
        // First, get the staff ID from the staff name
        const getStaffIdQuery = 'SELECT user_id FROM Users WHERE name = ? AND role = "staff"';
        
        pool.query(getStaffIdQuery, [assignedStaff], (err, staffResults) => {
            if (err) {
                console.error('Database error during staff lookup:', err);
                return res.status(500).json({ error: 'Error finding staff member: ' + err.message });
            }
            
            if (staffResults.length === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            
            const staffId = staffResults[0].user_id;
            
            // Get department ID
            const getDeptIdQuery = 'SELECT dept_id FROM Departments WHERE name = ?';
            
            pool.query(getDeptIdQuery, [department], (err, deptResults) => {
                if (err) {
                    console.error('Database error during department lookup:', err);
                    return res.status(500).json({ error: 'Error finding department: ' + err.message });
                }
                
                let deptId = null;
                if (deptResults.length > 0) {
                    deptId = deptResults[0].dept_id;
                }
                
                // Begin transaction
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.error('Error getting database connection:', err);
                        return res.status(500).json({ error: 'Database connection error' });
                    }
                    
                    connection.beginTransaction(async (err) => {
                        if (err) {
                            connection.release();
                            console.error('Error beginning transaction:', err);
                            return res.status(500).json({ error: 'Transaction error' });
                        }
                        
                        try {
                            try {
                            // 1. Insert into staff_assignments table
                            const insertAssignmentQuery = `
                                INSERT INTO staff_assignments 
                                (complaint_id, staff_id, assigned_at, progress_notes, status_update) 
                                VALUES (?, ?, NOW(), ?, 'In Progress')
                            `;
                            
                            connection.query(insertAssignmentQuery, 
                                [complaintId, staffId, notes || ''], 
                                (err, assignmentResult) => {
                                    if (err) {
                                        connection.rollback(() => {
                                            connection.release();
                                            console.error('Error inserting assignment:', err);
                                            res.status(500).json({ error: 'Failed to assign complaint: ' + err.message });
                                        });
                                        return;
                                    }

                                    // 2. Update complaint status
                                    const updateComplaintQuery = `
                                        UPDATE Complaints 
                                        SET status = 'In Progress', 
                                            updated_at = NOW() 
                                        WHERE complaint_id = ?
                                    `;

                                    connection.query(updateComplaintQuery, [complaintId], 
                                        (err, complaintResult) => {
                                            if (err) {
                                                connection.rollback(() => {
                                                    connection.release();
                                                    console.error('Error updating complaint:', err);
                                                    res.status(500).json({ error: 'Failed to update complaint: ' + err.message });
                                                });
                                                return;
                                            }

                                            // Commit transaction
                                            connection.commit((err) => {
                                                if (err) {
                                                    connection.rollback(() => {
                                                        connection.release();
                                                        console.error('Error committing transaction:', err);
                                                        res.status(500).json({ error: 'Failed to commit changes: ' + err.message });
                                                    });
                                                    return;
                                                }

                                                connection.release();
                                                res.json({ 
                                                    success: true, 
                                                    message: 'Complaint assigned successfully' 
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        } catch (error) {
                            connection.rollback(() => {
                                connection.release();
                                console.error('Error in assignment transaction:', error);
                                res.status(500).json({ error: 'Transaction failed: ' + error.message });
                            });
                        }
                            const updateComplaintQuery = `
                                UPDATE Complaints 
                                SET status = 'In Progress', priority = ?, updated_at = NOW()
                                WHERE complaint_id = ?
                            `;
                            
                            await connection.query(updateComplaintQuery, [priority, complaintId]);
                            
                            // 2. Insert or update staff assignment
                            const checkAssignmentQuery = `
                                SELECT * FROM Staff_Assignments 
                                WHERE complaint_id = ? AND staff_id = ?
                            `;
                            
                            const assignmentResults = await connection.query(checkAssignmentQuery, [complaintId, staffId]);
                            
                            if (assignmentResults.length > 0) {
                                // Update existing assignment
                                const updateAssignmentQuery = `
                                    UPDATE Staff_Assignments 
                                    SET progress_notes = CONCAT(IFNULL(progress_notes, ''), '\n', ?),
                                        status_update = 'Assigned',
                                        assigned_at = NOW()
                                    WHERE complaint_id = ? AND staff_id = ?
                                `;
                                await connection.query(updateAssignmentQuery, [
                                    `Reassigned on ${new Date().toISOString()}: ${notes || 'No notes provided'}`,
                                    complaintId,
                                    staffId
                                ]);
                            } else {
                                // Insert new assignment
                                const insertAssignmentQuery = `
                                    INSERT INTO Staff_Assignments 
                                    (complaint_id, staff_id, progress_notes, status_update, assigned_at)
                                    VALUES (?, ?, ?, 'Assigned', NOW())
                                `;
                                await connection.query(insertAssignmentQuery, [
                                    complaintId,
                                    staffId,
                                    `Assigned on ${new Date().toISOString()}: ${notes || 'No notes provided'}`
                                ]);
                            }
                            
                            // 3. Add to status history
                            const statusHistoryQuery = `
                                INSERT INTO Complaint_Status_History 
                                (complaint_id, staff_id, status, updated_by)
                                VALUES (?, ?, 'In Progress', ?)
                            `;
                            await connection.query(statusHistoryQuery, [complaintId, staffId, staffId]);
                            
                            // Commit transaction
                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error('Error committing transaction:', err);
                                        res.status(500).json({ error: 'Transaction commit error' });
                                    });
                                }
                                
                                connection.release();
                                console.log('Complaint', complaintId, 'assigned successfully to staff', staffId);
                                
                                res.json({ 
                                    success: true,
                                    message: 'Complaint assigned successfully',
                                    data: {
                                        complaintId: complaintId,
                                        staffId: staffId,
                                        staffName: assignedStaff,
                                        department: department,
                                        priority: priority
                                    }
                                });
                            });
                            
                        } catch (error) {
                            connection.rollback(() => {
                                connection.release();
                                console.error('Error during assignment transaction:', error);
                                res.status(500).json({ error: 'Assignment transaction error: ' + error.message });
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Admin complaint assignment error:', error);
        res.status(500).json({ error: 'Server error during complaint assignment: ' + error.message });
    }
});

module.exports = router;