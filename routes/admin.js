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
// Update complaint status (for assignment functionality) - FIXED VERSION
router.put('/complaints/:id/assign', (req, res) => {
    const { department, assignedStaff, priority, notes } = req.body;
    const complaintId = req.params.id;

    console.log('=== ADMIN COMPLAINT ASSIGNMENT ===');
    console.log(`Assigning complaint #${complaintId} to staff: ${assignedStaff} in department: ${department}`);
    
    // First, get the staff member's user_id
    const getStaffIdQuery = 'SELECT user_id FROM Users WHERE name = ? AND role = "staff"';
    
    pool.query(getStaffIdQuery, [assignedStaff], (err, staffResults) => {
        if (err) {
            console.error('Error finding staff member:', err);
            return res.status(500).json({ error: 'Error finding staff member: ' + err.message });
        }
        
        if (staffResults.length === 0) {
            console.error('Staff member not found:', assignedStaff);
            return res.status(404).json({ error: 'Staff member not found' });
        }
        
        const staffId = staffResults[0].user_id;
        
        // Check current workload before assignment
        const workloadCheckQuery = `
            SELECT COUNT(*) as active_count
            FROM Staff_Assignments 
            WHERE staff_id = ? AND status_update != 'Resolved'
        `;
        
        pool.query(workloadCheckQuery, [staffId], (err, workloadResult) => {
            if (err) {
                console.error('Error checking workload:', err);
                return res.status(500).json({ error: 'Error checking staff workload' });
            }
            
            const currentWorkload = workloadResult[0].active_count;
            console.log(`Staff ${assignedStaff} currently has ${currentWorkload} active assignments`);
            
            // Provide detailed response based on workload
            if (currentWorkload >= 3) {
                return res.status(409).json({ 
                    error: `Assignment Failed: Staff member "${assignedStaff}" has reached maximum capacity`,
                    workloadExceeded: true,
                    details: {
                        staffName: assignedStaff,
                        currentWorkload: currentWorkload,
                        maxCapacity: 3,
                        suggestion: 'Please select a different staff member or wait for them to resolve some cases'
                    }
                });
            }
            
            // Proceed with assignment if under capacity
            proceedWithAssignment();
        });
        
        function proceedWithAssignment() {
            // Update the complaint status and priority
            const updateComplaintQuery = `
                UPDATE Complaints 
                SET status = 'In Progress', priority = ?, updated_at = NOW()
                WHERE complaint_id = ?
            `;
            
            pool.query(updateComplaintQuery, [priority, complaintId], (err, updateResult) => {
                if (err) {
                    console.error('Error updating complaint status:', err);
                    return res.status(500).json({ error: 'Error updating complaint status: ' + err.message });
                }
                
                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ error: 'Complaint not found' });
                }
                
                // Check if assignment already exists
                const checkAssignmentQuery = 'SELECT * FROM Staff_Assignments WHERE complaint_id = ?';
                
                pool.query(checkAssignmentQuery, [complaintId], (err, existingAssignments) => {
                    if (err) {
                        console.error('Error checking existing assignments:', err);
                        return res.status(500).json({ error: 'Error checking assignments: ' + err.message });
                    }
                    
                    let assignmentQuery;
                    let queryParams;
                    
                    if (existingAssignments.length > 0) {
                        // Update existing assignment
                        assignmentQuery = `
                            UPDATE Staff_Assignments 
                            SET staff_id = ?, department = ?, assigned_at = NOW(), 
                                progress_notes = ?, status_update = 'In Progress'
                            WHERE complaint_id = ?
                        `;
                        queryParams = [staffId, department, notes || '', complaintId];
                    } else {
                        // Insert new assignment
                        assignmentQuery = `
                            INSERT INTO Staff_Assignments 
                            (complaint_id, staff_id, department, assigned_at, progress_notes, status_update) 
                            VALUES (?, ?, ?, NOW(), ?, 'In Progress')
                        `;
                        queryParams = [complaintId, staffId, department, notes || ''];
                    }
                    
                    pool.query(assignmentQuery, queryParams, (err, assignmentResult) => {
                        if (err) {
                            // Handle trigger error specifically
                            if (err.message && err.message.includes('maximum workload capacity')) {
                                return res.status(409).json({ 
                                    error: `Assignment blocked: ${assignedStaff} has reached maximum workload capacity`,
                                    workloadExceeded: true,
                                    details: {
                                        staffName: assignedStaff,
                                        reason: 'Database workload limit trigger activated',
                                        suggestion: 'Please select a different staff member'
                                    }
                                });
                            }
                            
                            console.error('Error with assignment operation:', err);
                            return res.status(500).json({ error: 'Error with assignment: ' + err.message });
                        }
                        
                        // Insert status history record
                        const statusHistoryQuery = `
                            INSERT INTO Complaint_Status_History 
                            (complaint_id, staff_id, status, updated_by, updated_at)
                            VALUES (?, ?, 'In Progress', ?, NOW())
                        `;
                        
                        pool.query(statusHistoryQuery, [complaintId, staffId, staffId], (err, historyResult) => {
                            if (err) {
                                console.error('Error inserting status history:', err);
                            }
                            
                            console.log('Complaint', complaintId, 'assigned successfully to', assignedStaff);
                            res.json({ 
                                success: true, 
                                message: `Complaint #${complaintId} assigned successfully to ${assignedStaff}`,
                                assignment: {
                                    complaintId,
                                    staffId,
                                    assignedStaff,
                                    department,
                                    priority,
                                    status: 'In Progress'
                                }
                            });
                        });
                    });
                });
            });
        }
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

// Get complaint summary view data
router.get('/reports/complaint-summary', (req, res) => {
    console.log('=== ADMIN COMPLAINT SUMMARY VIEW ===');
    const query = 'SELECT * FROM complaint_summary_view ORDER BY complaint_count DESC';
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching complaint summary view:', err);
            return res.status(500).json({ error: 'Failed to fetch complaint summary' });
        }
        
        console.log('Complaint summary data:', results);
        res.json(results);
    });
});

// Get staff performance view data
router.get('/reports/staff-performance', (req, res) => {
    console.log('=== ADMIN STAFF PERFORMANCE VIEW ===');
    const query = 'SELECT * FROM staff_workload_view ORDER BY total_assigned DESC';
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching staff performance view:', err);
            return res.status(500).json({ error: 'Failed to fetch staff performance data' });
        }
        
        console.log('Staff performance data:', results);
        res.json(results);
    });
});

// Get combined reports data

router.get('/reports/dashboard', async (req, res) => {
    console.log('=== ADMIN REPORTS FETCH ===');
    try {
        // Function to query the database using promises for async/await
        const queryPromise = (sql) => {
            return new Promise((resolve, reject) => {
                pool.query(sql, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        };

        // Run both view queries in parallel for better performance
        const [complaintSummary, staffPerformance] = await Promise.all([
            queryPromise('SELECT * FROM complaint_summary_view'),
            queryPromise('SELECT * FROM staff_workload_view')
        ]);

        console.log('Successfully fetched data from database views.');

        // Send both results back in a single JSON object
        res.json({
            complaintSummary,
            staffPerformance
        });

    } catch (err) {
        console.error('Database error during reports fetch:', err);
        res.status(500).json({ error: 'Error fetching reports data: ' + err.message });
    }
});


// Get staff workload details (to verify trigger is working)
router.get('/staff/:staffId/workload', (req, res) => {
    console.log('=== STAFF WORKLOAD CHECK ===');
    const staffId = req.params.staffId;
    
    const query = `
        SELECT 
            COUNT(*) as active_assignments,
            GROUP_CONCAT(c.complaint_id) as complaint_ids,
            GROUP_CONCAT(c.title SEPARATOR '; ') as complaint_titles
        FROM Staff_Assignments sa
        JOIN Complaints c ON sa.complaint_id = c.complaint_id
        WHERE sa.staff_id = ? AND sa.status_update != 'Resolved'
    `;
    
    pool.query(query, [staffId], (err, results) => {
        if (err) {
            console.error('Error checking staff workload:', err);
            return res.status(500).json({ error: 'Failed to check workload' });
        }
        
        const workload = results[0] || { active_assignments: 0 };
        console.log(`Staff ${staffId} has ${workload.active_assignments} active assignments`);
        
        res.json({
            staffId: staffId,
            activeAssignments: workload.active_assignments,
            isAtCapacity: workload.active_assignments >= 10,
            nearCapacity: workload.active_assignments >= 8,
            complaintIds: workload.complaint_ids ? workload.complaint_ids.split(',') : [],
            complaintTitles: workload.complaint_titles || 'No active assignments'
        });
    });
});

module.exports = router;