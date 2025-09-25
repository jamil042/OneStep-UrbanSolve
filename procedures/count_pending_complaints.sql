CREATE PROCEDURE count_pending_complaints()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE c_id INT;
  DECLARE total INT DEFAULT 0;

  -- cursor for all pending complaints
  DECLARE cur CURSOR FOR 
    SELECT complaint_id FROM Complaints WHERE status = 'Pending';

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO c_id;
    IF done = 1 THEN
      LEAVE read_loop;
    END IF;

    -- প্রতিবার complaint_id পড়লে কাউন্টার বাড়বে
    SET total = total + 1;
  END LOOP;
  CLOSE cur;

  -- শেষে result দেখানো
  SELECT total AS pending_count;
END;
