REATE FUNCTION count_active_assignments(p_staff_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE activeCount INT;

  SELECT COUNT(*) 
  INTO activeCount
  FROM Staff_Assignments sa
  WHERE sa.staff_id = p_staff_id
    AND sa.status_update != 'Resolved';

  RETURN activeCount;
END;
