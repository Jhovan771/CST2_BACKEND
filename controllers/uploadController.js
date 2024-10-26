const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single("image");

const uploadImage = (req, res) => {
  //   console.log("Received file:", req.file);
  upload(req, res, (err) => {
    if (err) {
      //   console.error("Multer error:", err);
      return res.status(500).json({ message: "Upload failed", err });
    }

    const imageUrl = req.file.path;
    const studentId = req.body.studentId;

    const query = "UPDATE student_record SET profile_image = ? WHERE id = ?";
    db.query(query, [imageUrl, studentId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", err });
      }
      res.json({ message: "Image uploaded successfully", imageUrl });
    });
  });
};

module.exports = { uploadImage };
