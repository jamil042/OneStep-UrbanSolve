CREATE PROCEDURE get_staff_list()
BEGIN
  SELECT 
      user_id AS id,
      name,
      email,
      contact AS phone,
      'available' AS status,
      (
          SELECT COUNT(*) 
          FROM Staff_Assignments sa 
          WHERE sa.staff_id = u.user_id 
          AND sa.status_update != 'Resolved'
      ) AS active_assignments
  FROM users u
  WHERE role = 'staff'
  ORDER BY name;
END;
