// routes/userRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db/userQueries");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { name, email, phone, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, phone, role, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ msg: "Email already registered" });
        }
        return res.status(500).json({ msg: "Database error", error: err });
      }
      res.status(201).json({ msg: "User registered" });
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(400).json({ msg: "User not found" });
      }

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
      res.status(200).json({ token, user });
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get Users
router.get("/users", verifyToken, (req, res) => {
  try {
    const sql = `SELECT * FROM users`;
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Database error", error: err });
      }
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get User by ID
router.get("/users/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  try {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.status(200).json(result[0]);
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Update User
router.put("/users/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status } = req.body;

  try {
    const sql = `UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?`;
    db.query(sql, [name, email, phone, role, status, id], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ msg: "Email already in use" });
        }
        return res.status(500).json({ msg: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.status(200).json({ msg: "User updated" });
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Delete User
router.delete("/users/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.status(200).json({ msg: "User deleted" });
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;
