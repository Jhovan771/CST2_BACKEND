const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/login", loginUser);

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You have accessed a protected route!", user: req.user });
});

module.exports = router;
