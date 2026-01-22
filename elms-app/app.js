const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());

// Serve LMS Frontend
app.use(express.static(path.join(__dirname, "public")));

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ECS Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "ELMS" });
});

// Register User
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err) => {
      if (err) return res.status(500).send("DB Error");
      res.send("User Registered");
    }
  );
});

// Login User
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (results.length === 0)
        return res.status(404).send("Invalid Credentials");
      res.send("Login Success");
    }
  );
});

// Listen for ECS
app.listen(3000, () => console.log("ELMS running on port 3000"));

