const express = require("express");
const router = express.Router();

const {
  addExercise,
  getAllActivities,
  submitActivityScore,
  discardStudentFromActivity,
  fetchStudentScores,
  fetchOverallScores,
  fetchOverallMaleScores,
  fetchOverallFemaleScores,
  deleteExercise,
} = require("../controllers/exerciseController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/new-exercise", authenticateToken, addExercise);
router.get("/fetch-act", authenticateToken, getAllActivities);
router.post("/submit-activity-score", authenticateToken, submitActivityScore);
router.post("/discard-student", authenticateToken, discardStudentFromActivity);
router.get("/fetch-scores/:id", authenticateToken, fetchStudentScores);
router.get("/fetch-overall-scores", authenticateToken, fetchOverallScores);
router.get(
  "/fetch-overall-male-scores",
  authenticateToken,
  fetchOverallMaleScores
);
router.get(
  "/fetch-overall-female-scores",
  authenticateToken,
  fetchOverallFemaleScores
);
router.delete("/delete-activity/:act_id", authenticateToken, deleteExercise);

module.exports = router;
