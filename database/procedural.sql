CREATE OR REPLACE PROCEDURE submit_complaint(
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_problem_type IN VARCHAR2,
    p_zone IN VARCHAR2,
    p_ward IN VARCHAR2,
    p_area_name IN VARCHAR2,
    p_user_id IN NUMBER,
    p_result OUT VARCHAR2
) AS
    v_location_id NUMBER;
    v_problem_id NUMBER;
    v_complaint_id NUMBER;
BEGIN
    -- Debug output (equivalent to console.log)
    DBMS_OUTPUT.PUT_LINE('=== COMPLAINT SUBMISSION DEBUG ===');
    DBMS_OUTPUT.PUT_LINE('Title: ' || p_title);
    DBMS_OUTPUT.PUT_LINE('User ID: ' || p_user_id);
    
    -- Validate required fields
    IF p_user_id IS NULL THEN
        p_result := '{"error": "User ID is required. Please login again.", "code": "MISSING_USER_ID"}';
        RETURN;
    END IF;
    
    IF p_title IS NULL OR p_description IS NULL OR p_problem_type IS NULL THEN
        p_result := '{"error": "All fields are required"}';
        RETURN;
    END IF;
    
    -- Check/Insert Location (simplified)
    BEGIN
        SELECT location_id INTO v_location_id 
        FROM Locations 
        WHERE zone = p_zone AND ward = p_ward AND area_name = p_area_name
        AND ROWNUM = 1;
        
        DBMS_OUTPUT.PUT_LINE('Using existing location ID: ' || v_location_id);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            INSERT INTO Locations (zone, ward, area_name)
            VALUES (p_zone, p_ward, p_area_name)
            RETURNING location_id INTO v_location_id;
            
            DBMS_OUTPUT.PUT_LINE('Created new location with ID: ' || v_location_id);
    END;
    
    -- Check/Insert Problem Type (simplified)
    BEGIN
        SELECT problem_id INTO v_problem_id 
        FROM Problem 
        WHERE LOWER(problem_name) = LOWER(format_problem_type(p_problem_type))
        AND ROWNUM = 1;
        
        DBMS_OUTPUT.PUT_LINE('Found problem ID: ' || v_problem_id);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            INSERT INTO Problem (problem_name, problem_description)
            VALUES (format_problem_type(p_problem_type), 'Problem related to ' || p_problem_type)
            RETURNING problem_id INTO v_problem_id;
            
            DBMS_OUTPUT.PUT_LINE('Created new problem type with ID: ' || v_problem_id);
    END;
    
    -- Insert Complaint
    INSERT INTO Complaints (user_id, problem_id, location_id, title, description, status, created_at, updated_at)
    VALUES (p_user_id, v_problem_id, v_location_id, p_title, p_description, 'Pending', SYSTIMESTAMP, SYSTIMESTAMP)
    RETURNING complaint_id INTO v_complaint_id;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Complaint created successfully with ID: ' || v_complaint_id);
    p_result := '{"success": true, "complaint_id": ' || v_complaint_id || ', "message": "Complaint submitted successfully!"}';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        p_result := '{"error": "Server error during complaint submission: ' || SQLERRM || '"}';
END;
/

-- 2. Helper Function (equivalent to formatProblemType)
CREATE OR REPLACE FUNCTION format_problem_type(p_problem_type IN VARCHAR2) 
RETURN VARCHAR2 AS
    v_result VARCHAR2(200);
BEGIN
    -- Simple formatting: replace hyphens with spaces and capitalize
    v_result := REPLACE(p_problem_type, '-', ' ');
    v_result := INITCAP(v_result);
    RETURN v_result;
END;
/

-- 3. Get User Complaints (equivalent to GET /complaints/:userId)
CREATE OR REPLACE PROCEDURE get_user_complaints(
    p_user_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
) AS
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== FETCHING COMPLAINTS DEBUG ===');
    DBMS_OUTPUT.PUT_LINE('Requested userId: ' || p_user_id);
    
    -- Validate userId
    IF p_user_id IS NULL THEN
        DBMS_OUTPUT.PUT_LINE('Invalid userId received: NULL');
        OPEN p_result FOR SELECT NULL FROM dual WHERE 1=0;
        RETURN;
    END IF;
    
    -- Fetch complaints with joins (similar to Node.js query)
    OPEN p_result FOR
        SELECT 
            c.complaint_id as id,
            c.title,
            c.status,
            l.zone,
            l.ward,
            l.area_name as areaName,
            p.problem_name as problemType,
            c.description,
            NVL(c.updated_at, c.created_at) as lastUpdated,
            c.created_at as createdAt,
            'Medium' as priority
        FROM Complaints c
        JOIN Problem p ON c.problem_id = p.problem_id
        JOIN Locations l ON c.location_id = l.location_id
        WHERE c.user_id = p_user_id
        ORDER BY c.created_at DESC;
        
    DBMS_OUTPUT.PUT_LINE('Complaints fetched successfully for user: ' || p_user_id);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error fetching complaints: ' || SQLERRM);
        OPEN p_result FOR SELECT NULL FROM dual WHERE 1=0;
END;
/

-- 4. Get Complaint Statistics (equivalent to GET /complaints/:userId/stats)
CREATE OR REPLACE PROCEDURE get_complaint_stats(
    p_user_id IN NUMBER,
    p_result OUT VARCHAR2
) AS
    v_total NUMBER := 0;
    v_pending NUMBER := 0;
    v_in_progress NUMBER := 0;
    v_resolved NUMBER := 0;
    v_resolution_rate NUMBER := 0;
BEGIN
    -- Validate userId
    IF p_user_id IS NULL THEN
        p_result := '{"error": "Invalid user ID", "code": "INVALID_USER_ID"}';
        RETURN;
    END IF;
    
    -- Get statistics (similar to Node.js query)
    SELECT 
        COUNT(*),
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END)
    INTO v_total, v_pending, v_in_progress, v_resolved
    FROM Complaints 
    WHERE user_id = p_user_id;
    
    -- Calculate resolution rate
    IF v_total > 0 THEN
        v_resolution_rate := ROUND((v_resolved / v_total) * 100);
    END IF;
    
    -- Return JSON-like result
    p_result := '{' ||
        '"total": ' || v_total || ', ' ||
        '"pending": ' || v_pending || ', ' ||
        '"inProgress": ' || v_in_progress || ', ' ||
        '"resolved": ' || v_resolved || ', ' ||
        '"resolutionRate": ' || v_resolution_rate ||
        '}';
        
    DBMS_OUTPUT.PUT_LINE('Stats calculated for user ' || p_user_id || ': ' || p_result);
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := '{"total": 0, "pending": 0, "inProgress": 0, "resolved": 0, "resolutionRate": 0}';
    WHEN OTHERS THEN
        p_result := '{"error": "Error fetching stats: ' || SQLERRM || '"}';
END;
/
