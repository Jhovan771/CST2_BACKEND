const db = require("../config/db");
const jwt = require("jsonwebtoken");

exports.addStudent = (req, res) => {
  const {
    first_name,
    middle_initial,
    last_name,
    age,
    gender,
    contact_number,
    address,
  } = req.body;

  const teacher_id = req.user?.teacher_id;

  if (!first_name || !last_name || !age || !gender || !teacher_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `INSERT INTO student_record
                (first_name, middle_initial, last_name, age, gender, contact_number, address, teacher_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      first_name,
      middle_initial,
      last_name,
      age,
      gender,
      contact_number,
      address,
      teacher_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error during database query:", err);
        return res.status(500).json({
          message: "Database error occurred",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Student added successfully",
        studentId: result.insertId,
      });
    }
  );
};

// ============================================= >
exports.fetchStudentByTeacherId = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const teacher_id = decoded.teacher_id;

    const query = `SELECT * FROM student_record WHERE teacher_id = ?`;

    db.query(query, [teacher_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length > 0) {
        return res.status(200).json({ students: results });
      } else {
        return res
          .status(404)
          .json({ message: "No students found for this teacher" });
      }
    });
  });
};

// ============================================= >
exports.updateStudent = (req, res) => {
  const {
    first_name,
    middle_initial,
    last_name,
    age,
    gender,
    contact_number,
    address,
  } = req.body;

  const studentId = req.params.id;
  const teacher_id = req.user?.teacher_id;

  // console.log("Student ID to update:", studentId);
  // console.log("Teacher ID from token:", teacher_id);

  if (
    !studentId ||
    !first_name ||
    !last_name ||
    !age ||
    !gender ||
    !teacher_id
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `UPDATE student_record 
                SET first_name = ?, middle_initial = ?, last_name = ?, age = ?, gender = ?, 
                  contact_number = ?, address = ? 
                WHERE id = ? AND teacher_id = ?`;

  db.query(
    query,
    [
      first_name,
      middle_initial,
      last_name,
      age,
      gender,
      contact_number,
      address,
      studentId,
      teacher_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error during database query:", err);
        return res.status(500).json({
          message: "Database error occurred",
          error: err.message,
        });
      }

      // console.log("Query result:", result);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Student not found or unauthorized" });
      }

      return res.status(200).json({
        message: "Student updated successfully",
      });
    }
  );
};

// ============================================= >
exports.deleteStudent = (req, res) => {
  const studentId = req.params.id;
  const teacher_id = req.user?.teacher_id;

  if (!studentId || !teacher_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `DELETE FROM student_record WHERE id = ? AND teacher_id = ?`;

  db.query(query, [studentId, teacher_id], (err, result) => {
    if (err) {
      console.error("Error during database query:", err);
      return res.status(500).json({
        message: "Database error occured",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found or unauthorized to delete",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  });
};

// ============================================= >
exports.fetchStudentsWithoutActivityScore = (req, res) => {
  const { activity_id } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const teacher_id = decoded.teacher_id;

    const query = `
      SELECT s.* 
      FROM student_record s
      LEFT JOIN student_activity_record sar 
      ON s.id = sar.id
      AND sar.act_id = ? 
      WHERE s.teacher_id = ? 
      AND (sar.score IS NULL OR sar.completed = 0)
      `;

    db.query(query, [activity_id, teacher_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length > 0) {
        return res.status(200).json({ students: results });
      } else {
        return res.status(404).json({
          message: "No students found without scores for this activity",
        });
      }
    });
  });
};

// ============================================= >
exports.fetchNumberOfStudents = (req, res) => {
  const teacherId = req.user.teacher_id;

  const query = `
    SELECT COUNT(*) AS student_count
    FROM student_record
    WHERE teacher_id = ?;
  `;

  db.query(query, [teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json(results[0]);
  });
};
