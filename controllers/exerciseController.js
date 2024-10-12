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

      // Clean up the 'words' field before sending it to the frontend
      const sanitizedResults = results.map((activity) => {
        return {
          ...activity,
          words: activity.words.replace(/["[\]]/g, ""), // Removes quotes and brackets
        };
      });

      return res.status(200).json({
        message: "Activities fetched successfully",
        activities: sanitizedResults,
      });
    });
  });
};
