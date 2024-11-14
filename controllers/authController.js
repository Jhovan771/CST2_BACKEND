const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");

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

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otps = new Map();

exports.registerUser = (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const checkQuery =
    "SELECT * FROM user_account WHERE username = ? OR email = ?";
  db.query(checkQuery, [username, email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    // Generate and send OTP
    const otp = generateOTP();
    otps.set(email, otp);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending OTP", error });
      } else {
        return res.status(200).json({ message: "OTP sent to your email" });
      }
    });
  });
};

exports.verifyOTPAndCreateUser = (req, res) => {
  const { username, password, email, otp } = req.body;

  const storedOTP = otps.get(email);
  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  otps.delete(email);

  const createUserQuery =
    "INSERT INTO user_account (username, password, email) VALUES (?, ?, ?)";
  db.query(createUserQuery, [username, password, email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", err });
    }

    return res.status(201).json({ message: "Account created successfully" });
  });
};
