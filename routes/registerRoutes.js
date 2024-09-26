// This is our register routes
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const db = require("../model/db");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/registration", (req, res) => {
  res.render("signup");
});

router.post("/registration", upload.single("profile_picture"), (req, res) => {
  const { name, email, location, sex, phone, password, confirm_password } =
    req.body;

  if (password !== confirm_password) {
    return res.send("Passwords do not match");
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error occurred while hashing password:", err);
      return res.send("Error occurred while hashing password");
    }

    const profilePicture = req.file ? req.file.buffer : null;
    const emailValue = email ? email : null; // Use null if email is not provided

    db.run(
      "INSERT INTO users(name, location, sex, profile_picture) VALUES (?,?,?,?)",
      [name, location, sex, profilePicture],
      function (err) {
        if (err) {
          console.error("Error occurred while saving user data:", err);
          return res.send("Error occurred while saving user data");
        }
        const userId = this.lastID;
        db.run(
          `INSERT INTO auth (email, phone, password, user_id) VALUES (?, ?, ?, ?)`,
          [emailValue, phone, hashedPassword, userId],  // Use emailValue here
          function (err) {
            if (err) {
              console.error("Error occurred while saving auth data:", err);
              return res.send("Error occurred while saving auth data");
            }
            res.redirect("/login");
          }
        );
      }
    );
  });
});

module.exports = router;
