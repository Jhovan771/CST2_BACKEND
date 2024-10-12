const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required." });
  }

  const query =
    "SELECT * FROM user_account WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", err });
    }

    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign(
        { teacher_id: user.teacher_id },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      return res.json({ token, message: "Login Successful." });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  });
};
