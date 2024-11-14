const db = require("../config/db");
const jwt = require("jsonwebtoken");

exports.addExercise = (req, res) => {
  const { label, words } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const activity_teacher_id = decoded.teacher_id;

    if (!label || !words || !activity_teacher_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `INSERT INTO activity_record (label, words, activity_teacher_id) VALUES (?, ?, ?)`;

    db.query(
      query,
      [label, JSON.stringify(words), activity_teacher_id],
      (err, result) => {
        if (err) {
          console.error("Error during database query:", err);
          return res.status(500).json({
            message: "Database error occurred",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "Exercise added successfully",
          exerciseId: result.insertId,
        });
      }
    );
  });
};

// ============================================= >
exports.getAllActivities = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const activity_teacher_id = decoded.teacher_id;
    const query = `SELECT * FROM activity_record WHERE activity_teacher_id = ?`;

    db.query(query, [activity_teacher_id], (err, results) => {
      if (err) {
        console.error("Error fetching activities:", err);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      const sanitizedResults = results.map((activity) => {
        return {
          ...activity,
          words: activity.words.replace(/["[\]]/g, ""),
        };
      });

      return res.status(200).json({
        message: "Activities fetched successfully",
        activities: sanitizedResults,
      });
    });
  });
};

// ============================================= >
exports.submitActivityScore = (req, res) => {
  console.log("Received request body:", req.body); // Add this line
  const { id, activity_id, score, completed } = req.body;

  // Check for missing required fields and score value
  if (!id || !activity_id || score === undefined || completed === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Reject the request if the score is null or 0
  if (score === null || score === 0) {
    return res.status(400).json({ message: "Score cannot be null or zero" });
  }

  const query = `
        INSERT INTO student_activity_record (id, act_id, score, completed)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE score = ?, completed = ?`;

  db.query(
    query,
    [id, activity_id, score, completed, score, completed],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(200).json({ message: "Score submitted successfully" });
    }
  );
};

// ============================================= >
exports.discardStudentFromActivity = (req, res) => {
  const { student_id, activity_id } = req.body;

  if (!student_id || !activity_id) {
    return res.status(400).json({ message: "Missing Required Fields." });
  }

  const query = `
    INSERT INTO student_activity_record (id, act_id, score, completed)
    VALUES (?, ?, 30, 1)
    ON DUPLICATE KEY UPDATE completed = 1;
  `;

  db.query(query, [student_id, activity_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json({ message: "Student discarded successfully" });
  });
};

// ============================================= >
exports.fetchStudentScores = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const studentId = req.params.id;

    const query = `
      SELECT ar.label, sar.score
      FROM student_activity_record sar
      JOIN activity_record ar ON sar.act_id = ar.act_id
      WHERE sar.id = ?
    `;

    db.query(query, [studentId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length > 0) {
        return res.status(200).json({ scores: results });
      } else {
        return res
          .status(404)
          .json({ message: "No scores found for this student" });
      }
    });
  });
};

// ============================================= >
exports.fetchOverallScores = (req, res) => {
  const teacherId = req.user.teacher_id;
  const query = `
    SELECT ar.label, AVG(sar.score) AS average_score
    FROM student_activity_record sar
    JOIN activity_record ar ON sar.act_id = ar.act_id
    WHERE ar.activity_teacher_id = ?
    GROUP BY ar.act_id, ar.label
    ORDER BY ar.act_id;
  `;

  db.query(query, [teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json(results);
  });
};

// ============================================= >
exports.fetchOverallMaleScores = (req, res) => {
  const teacherId = req.user.teacher_id;

  const query = `
    SELECT ar.label, AVG(sar.score) AS average_score
    FROM student_activity_record sar
    JOIN activity_record ar ON sar.act_id = ar.act_id
    JOIN student_record sr ON sar.id = sr.id
    WHERE ar.activity_teacher_id = ? AND sr.gender = 'Male'
    GROUP BY ar.act_id, ar.label
    ORDER BY ar.act_id;
  `;

  db.query(query, [teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json(results);
  });
};

// ============================================= >
exports.fetchOverallFemaleScores = (req, res) => {
  const teacherId = req.user.teacher_id;

  const query = `
    SELECT ar.label, AVG(sar.score) AS average_score
    FROM student_activity_record sar
    JOIN activity_record ar ON sar.act_id = ar.act_id
    JOIN student_record sr ON sar.id = sr.id
    WHERE ar.activity_teacher_id = ? AND sr.gender = 'Female'
    GROUP BY ar.act_id, ar.label
    ORDER BY ar.act_id;
  `;

  db.query(query, [teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json(results);
  });
};

// ============================================= >
exports.deleteExercise = (req, res) => {
  const { act_id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    const activity_teacher_id = decoded.teacher_id;

    if (!act_id) {
      return res.status(400).json({ message: "Exercise ID is required" });
    }

    const query = `DELETE FROM activity_record WHERE act_id = ? AND activity_teacher_id = ?`;

    db.query(query, [act_id, activity_teacher_id], (err, result) => {
      if (err) {
        console.error("Error during database query:", err);
        return res.status(500).json({
          message: "Database error occurred",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      return res.status(200).json({ message: "Exercise deleted successfully" });
    });
  });
};
