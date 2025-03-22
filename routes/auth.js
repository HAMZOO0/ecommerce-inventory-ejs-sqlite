const express = require("express");
// const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const db = new sqlite3.Database("./products.db");

// Register Route
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, "seller"],
    (err) => {
      if (err) return res.send("Error registering user");
      res.redirect("/login");
    }
  );
});

// Login Route
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user || password !== user.password) {
      return res.redirect("/register");
    }
    req.session.user = user;
    res.redirect("/");
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
