const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  verifyOTPAndCreateUser,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/login", loginUser);

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You have accessed a protected route!", user: req.user });
});

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTPAndCreateUser);

module.exports = router;
