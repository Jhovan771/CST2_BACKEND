const express = require("express");
const router = express.Router();
const {
  addStudent,
  fetchStudentByTeacherId,
  updateStudent,
  deleteStudent,
  fetchStudentsWithoutActivityScore,
} = require("../controllers/studentController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/add-student", authenticateToken, addStudent);
router.get("/students", authenticateToken, fetchStudentByTeacherId);
router.put("/student/:id", authenticateToken, updateStudent);
router.delete("/delete/:id", authenticateToken, deleteStudent);
router.get("/no-score", authenticateToken, fetchStudentsWithoutActivityScore);

module.exports = router;
