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
// Update complaint status (for assignment functionality)
// Update complaint status (for assignment functionality) - FIXED
// Update complaint status (for assignment functionality) - FIXED FOR DUPLICATES
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
            
            // 1. Update complaint status only
            const updateComplaintQuery = `
                UPDATE Complaints 
                SET status = 'In Progress', updated_at = NOW()
                WHERE complaint_id = ?
            `;
            
            pool.query(updateComplaintQuery, [complaintId], (err, updateResult) => {
                if (err) {
                    console.error('Error updating complaint:', err);
                    return res.status(500).json({ error: 'Error updating complaint: ' + err.message });
                }
                
                // 2. Check if assignment already exists
                const checkAssignmentQuery = `
                    SELECT * FROM Staff_Assignments 
                    WHERE complaint_id = ? AND staff_id = ?
                `;
                
                pool.query(checkAssignmentQuery, [complaintId, staffId], (err, assignmentResults) => {
                    if (err) {
                        console.error('Error checking assignment:', err);
                        return res.status(500).json({ error: 'Error checking assignment: ' + err.message });
                    }
                    
                    const assignmentNotes = `Priority: ${priority}\nAssigned on ${new Date().toLocaleString()}: ${notes || 'No notes provided'}`;
                    
                    if (assignmentResults.length > 0) {
                        // Update existing assignment
                        const updateAssignmentQuery = `
                            UPDATE Staff_Assignments 
                            SET progress_notes = CONCAT(COALESCE(progress_notes, ''), '\n\n--- REASSIGNED ---\n', ?),
                                status_update = 'Reassigned',
                                assigned_at = NOW()
                            WHERE complaint_id = ? AND staff_id = ?
                        `;
                        
                        pool.query(updateAssignmentQuery, [assignmentNotes, complaintId, staffId], (err, updateResult) => {
                            if (err) {
                                console.error('Error updating assignment:', err);
                                return res.status(500).json({ error: 'Error updating assignment: ' + err.message });
                            }
                            
                            console.log('Complaint', complaintId, 'reassigned to staff', staffId);
                            
                            res.json({ 
                                success: true,
                                message: 'Complaint reassigned successfully',
                                data: {
                                    complaintId: complaintId,
                                    staffId: staffId,
                                    staffName: assignedStaff,
                                    department: department,
                                    priority: priority,
                                    action: 'updated'
                                }
                            });
                        });
                    } else {
                        // Insert new assignment
                        const insertAssignmentQuery = `
                            INSERT INTO Staff_Assignments 
                            (complaint_id, staff_id, progress_notes, status_update, assigned_at)
                            VALUES (?, ?, ?, 'Assigned', NOW())
                        `;
                        
                        pool.query(insertAssignmentQuery, [complaintId, staffId, assignmentNotes], (err, insertResult) => {
                            if (err) {
                                console.error('Error creating staff assignment:', err);
                                return res.status(500).json({ error: 'Error creating assignment: ' + err.message });
                            }
                            
                            console.log('Complaint', complaintId, 'assigned successfully to staff', staffId);
                            
                            res.json({ 
                                success: true,
                                message: 'Complaint assigned successfully',
                                data: {
                                    complaintId: complaintId,
                                    staffId: staffId,
                                    staffName: assignedStaff,
                                    department: department,
                                    priority: priority,
                                    action: 'created'
                                }
                            });
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Admin complaint assignment error:', error);
        res.status(500).json({ error: 'Server error during complaint assignment: ' + error.message });
    }
});
module.exports = router;