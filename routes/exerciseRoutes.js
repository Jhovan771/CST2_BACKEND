const express = require("express");
const router = express.Router();

const {
  addExercise,
  getAllActivities,
} = require("../controllers/exerciseController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/new-exercise", authenticateToken, addExercise);
router.get("/fetch-act", authenticateToken, getAllActivities);

module.exports = router;
