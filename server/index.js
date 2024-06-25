// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const http = require("http");
// const socketIo = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000", // Replace with your React app URL
//     methods: ["GET", "POST"],
//     credentials: true, // Allow credentials (cookies) to be sent
//   },
// });

// app.use(cors());
// app.use(express.json());

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "chat_app",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("MySQL Connected...");
// });

// // Create a User table
// const createUserTable = `
//   CREATE TABLE IF NOT EXISTS users (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255),
//     email VARCHAR(255),
//     phone VARCHAR(255),
//     role ENUM('Teacher', 'Student', 'Institute'),
//     password VARCHAR(255),
//     status ENUM('online', 'offline') DEFAULT 'offline'
//   )
// `;

// db.query(createUserTable, (err, result) => {
//   if (err) throw err;
//   console.log("User table created...");
// });

// // Register User
// app.post("/register", async (req, res) => {
//   const { name, email, phone, role, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const sql = `INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)`;
//   db.query(sql, [name, email, phone, role, hashedPassword], (err, result) => {
//     if (err) throw err;
//     res.send({ msg: "User registered" });
//   });
// });

// // Login User
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   const sql = `SELECT * FROM users WHERE email = ?`;
//   db.query(sql, [email], async (err, result) => {
//     if (err) throw err;
//     if (result.length === 0) {
//       return res.status(400).send({ msg: "User not found" });
//     }

//     const user = result[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).send({ msg: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
//     res.send({ token, user });
//   });
// });

// const verifyToken = (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({ msg: "No token, authorization denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, "secret");
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };

// // Get Users
// app.get("/users", verifyToken, (req, res) => {
//   const sql = `SELECT * FROM users`;
//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     res.send(result);
//   });
// });
// // Get Users
// app.get("/users/:id", verifyToken, (req, res) => {
//   const { id } = req.params;

//   const sql = `SELECT * FROM users where id= ${id}`;

//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     res.json(result);
//   });
// });

// // Update User
// app.put("/users/:id", verifyToken, (req, res) => {
//   const { id } = req.params;
//   console.log(id);
//   const { name, email, phone, role, status } = req.body;

//   const sql = `UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?`;
//   db.query(sql, [name, email, phone, role, status, id], (err, result) => {
//     if (err) throw err;
//     res.send({ msg: "User updated" });
//   });
// });

// // Delete User
// app.delete("/users/:id", verifyToken, (req, res) => {
//   const { id } = req.params;

//   const sql = `DELETE FROM users WHERE id = ?`;
//   db.query(sql, [id], (err, result) => {
//     if (err) throw err;
//     res.send({ msg: "User deleted" });
//   });
// });

// const PORT = 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.js

const express = require("express");
const http = require("http");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
// const http = require("http");
const socketIo = require("socket.io");
const { db } = require("./db/userQueries");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app URL
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (cookies) to be sent
  },
});
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.use("", userRoutes);

// Socket.io handlers

global.OnlineUsers = new Map();

const updateUserStatus = (userId, status) => {
  const sql = `UPDATE users SET status = ? WHERE id = ?`;
  db.query(sql, [status, userId], (err) => {
    if (err) throw err;
    console.log(`User ${userId} is now ${status}`);
  });
};

const broadcastOnlineUsers = () => {
  io.emit("online-users", {
    OnlineUsers: Array.from(OnlineUsers.keys()),
  });
};

io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log("Connection established:", socket.id);

  socket.on("add-user", (userId) => {
    OnlineUsers.set(userId, socket.id);
    updateUserStatus(userId, "online");
    broadcastOnlineUsers(); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    const userId = [...OnlineUsers.entries()].find(
      ([, socketId]) => socketId === socket.id
    )?.[0];

    if (userId) {
      OnlineUsers.delete(userId);
      updateUserStatus(userId, "offline");
      broadcastOnlineUsers(); // Broadcast to all clients
    }
  });

  socket.on("signout", (userId) => {
    OnlineUsers.delete(userId);
    updateUserStatus(userId, "offline");
    broadcastOnlineUsers(); // Broadcast to all clients
  });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
