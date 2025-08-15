const express = require('express');
const router = express.Router();
const pool = require('../database'); // Using pool like in auth.js

// Submit new complaint
router.post('/complaints', (req, res) => {
    try {
        console.log('Complaint submission received:', req.body);
        const { title, description, problemType, zone, ward, areaName, userId } = req.body;

        // Validate required fields
        if (!title || !description || !problemType || !zone || !ward || !areaName) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

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
                    // Location exists, use existing ID
                    locationId = locationResults[0].location_id;
                    console.log('Using existing location ID:', locationId);
                    proceedWithComplaint(locationId);
                } else {
                    // Location doesn't exist, create new one
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
                    // 2. Get problem_id
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
                                // Create new problem type
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
                    // 3. Insert complaint
                    pool.query(
                        `INSERT INTO Complaints 
                         (user_id, problem_id, location_id, title, description, status, created_at)
                         VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
                        [userId || 1, problemId, locationId, title, description],
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
    // Convert dash-separated to space-separated and proper case
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
        console.log('Fetching complaints for user:', userId);

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
                c.updated_at as lastUpdated,
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
                res.json(results);
            }
        );
    } catch (error) {
        console.error('Complaints fetch error:', error);
        res.status(500).json({ error: 'Server error during complaints fetch: ' + error.message });
    }
});

module.exports = router;