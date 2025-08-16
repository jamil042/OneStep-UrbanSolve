// Updated complaints.js backend with better error handling

const express = require('express');
const router = express.Router();
const pool = require('../database');

// Submit new complaint
router.post('/complaints', (req, res) => {
    try {
        console.log('=== COMPLAINT SUBMISSION DEBUG ===');
        console.log('Full request body:', req.body);
        console.log('Headers:', req.headers);
        
        const { title, description, problemType, zone, ward, areaName, userId } = req.body;

        // IMPROVED: Better validation for userId
        if (!userId) {
            console.error('ERROR: userId is missing from request');
            return res.status(400).json({ 
                error: 'User ID is required. Please login again.',
                code: 'MISSING_USER_ID'
            });
        }

        // Validate other required fields
        if (!title || !description || !problemType || !zone || !ward || !areaName) {
            console.log('ERROR: Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

        console.log('Processing complaint for user ID:', userId);

        // 1. First, check if location exists
        pool.query(
            `SELECT location_id FROM Locations WHERE zone = ? AND ward = ? AND area_name = ?`,
            [zone, ward, areaName],
            (err, locationResults) => {
                if (err) {
                    console.error('Database error during location check:', err);
                    return res.status(500).json({ error: 'Error checking location: ' + err.message });
                }

                let locationId;

                if (locationResults.length > 0) {
                    locationId = locationResults[0].location_id;
                    console.log('Using existing location ID:', locationId);
                    proceedWithComplaint(locationId);
                } else {
                    pool.query(
                        `INSERT INTO Locations (zone, ward, area_name) VALUES (?, ?, ?)`,
                        [zone, ward, areaName],
                        (err, insertResult) => {
                            if (err) {
                                console.error('Database error during location insertion:', err);
                                return res.status(500).json({ error: 'Error saving location: ' + err.message });
                            }

                            locationId = insertResult.insertId;
                            console.log('Created new location with ID:', locationId);
                            proceedWithComplaint(locationId);
                        }
                    );
                }

                function proceedWithComplaint(locationId) {
                    const problemName = formatProblemType(problemType);
                    console.log('Looking for problem type:', problemName);
                    
                    pool.query(
                        `SELECT problem_id FROM Problem WHERE LOWER(problem_name) = LOWER(?)`,
                        [problemName],
                        (err, problemResults) => {
                            if (err) {
                                console.error('Database error during problem lookup:', err);
                                return res.status(500).json({ error: 'Error finding problem type: ' + err.message });
                            }

                            if (problemResults.length === 0) {
                                console.log('Problem type not found, creating new one:', problemName);
                                pool.query(
                                    `INSERT INTO Problem (problem_name, problem_description) VALUES (?, ?)`,
                                    [problemName, `Problem related to ${problemName}`],
                                    (err, insertProblemResult) => {
                                        if (err) {
                                            console.error('Error inserting problem type:', err);
                                            return res.status(400).json({ error: 'Invalid problem type and could not create: ' + err.message });
                                        }
                                        
                                        const problemId = insertProblemResult.insertId;
                                        console.log('Created new problem type with ID:', problemId);
                                        insertComplaint(problemId, locationId);
                                    }
                                );
                                return;
                            }

                            const problemId = problemResults[0].problem_id;
                            console.log('Found problem ID:', problemId);
                            insertComplaint(problemId, locationId);
                        }
                    );
                }

                function insertComplaint(problemId, locationId) {
                    console.log('Inserting complaint with:', {
                        userId: userId,
                        problemId: problemId,
                        locationId: locationId,
                        title: title,
                        description: description
                    });
                    
                    pool.query(
                        `INSERT INTO Complaints 
                         (user_id, problem_id, location_id, title, description, status, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
                        [userId, problemId, locationId, title, description],
                        (err, complaintResult) => {
                            if (err) {
                                console.error('Database error during complaint insertion:', err);
                                return res.status(500).json({ error: 'Error saving complaint: ' + err.message });
                            }

                            console.log('Complaint created successfully with ID:', complaintResult.insertId);
                            res.json({ 
                                success: true,
                                complaint_id: complaintResult.insertId,
                                message: 'Complaint submitted successfully!'
                            });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Complaint submission error:', error);
        res.status(500).json({ error: 'Server error during complaint submission: ' + error.message });
    }
});

// Helper function to format problem type
function formatProblemType(problemType) {
    return problemType
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Get all complaints for user
router.get('/complaints/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('=== FETCHING COMPLAINTS DEBUG ===');
        console.log('Requested userId:', userId);
        console.log('UserId type:', typeof userId);

        // IMPROVED: Check for valid userId
        if (!userId || userId === 'undefined' || userId === 'null') {
            console.error('Invalid userId received:', userId);
            return res.status(400).json({ 
                error: 'Invalid user ID. Please login again.',
                code: 'INVALID_USER_ID'
            });
        }

        pool.query(`
            SELECT 
                c.complaint_id as id,
                c.title,
                c.status,
                l.zone,
                l.ward,
                l.area_name as areaName,
                p.problem_name as problemType,
                c.description,
                COALESCE(c.updated_at, c.created_at) as lastUpdated,
                c.created_at as createdAt,
                'Medium' as priority
            FROM Complaints c
            JOIN Problem p ON c.problem_id = p.problem_id
            JOIN Locations l ON c.location_id = l.location_id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC`, 
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Database error during complaints fetch:', err);
                    return res.status(500).json({ error: 'Error fetching complaints: ' + err.message });
                }

                console.log('Found', results.length, 'complaints for user', userId);
                console.log('Raw results:', results);
                
                // Format the results to ensure consistent data structure
                const formattedResults = results.map(complaint => ({
                    id: complaint.id,
                    title: complaint.title,
                    status: complaint.status,
                    zone: complaint.zone,
                    ward: complaint.ward,
                    areaName: complaint.areaName,
                    problemType: complaint.problemType,
                    description: complaint.description,
                    lastUpdated: complaint.lastUpdated,
                    createdAt: complaint.createdAt,
                    priority: complaint.priority
                }));
                
                console.log('Formatted results:', formattedResults);
                res.json(formattedResults);
            }
        );
    } catch (error) {
        console.error('Complaints fetch error:', error);
        res.status(500).json({ error: 'Server error during complaints fetch: ' + error.message });
    }
});

// Get complaint statistics for user
router.get('/complaints/:userId/stats', (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({ 
                error: 'Invalid user ID',
                code: 'INVALID_USER_ID'
            });
        }

        pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
            FROM Complaints 
            WHERE user_id = ?`, 
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Database error during stats fetch:', err);
                    return res.status(500).json({ error: 'Error fetching stats: ' + err.message });
                }

                const stats = results[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 };
                const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                
                res.json({
                    ...stats,
                    resolutionRate
                });
            }
        );
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Server error during stats fetch: ' + error.message });
    }
});

module.exports = router;