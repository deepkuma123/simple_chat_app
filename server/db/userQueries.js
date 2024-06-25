// db/userQueries.js

const db = require("./db");

// Create User Table
const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(255),
    role ENUM('Teacher', 'Student', 'Institute'),
    password VARCHAR(255),
    status ENUM('online', 'offline') DEFAULT 'offline'
  )
`;

db.query(createUserTable, (err, result) => {
  if (err) throw err;
  console.log("User table created...");
});

// Other user-related queries here

module.exports = {
  db,
  // export other queries as needed
};
