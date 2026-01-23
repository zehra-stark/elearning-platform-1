const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static LMS frontend (index.html)
app.use(express.static(path.join(__dirname, "public")));

// DB Connection (from ECS task ENV variables)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect and log DB state once
db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ Connected to RDS MySQL");
  }
});

// ALB Health Check Target
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "UP", service: "ELMS-APP" });
});

// REGISTER USER
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(query, [username, email, password], (err) => {
    if (err) {
      console.error("❌ DB Insert Error:", err);
      return res.status(500).json({ message: "DB Error" });
    }

    console.log(`👤 User registered: ${email}`);
    return res.status(201).json({ message: "User Registered Successfully" });
  });
});

// LOGIN USER
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return res.status(400).json({ message: "Missing login fields" });
  }

  const query = "SELECT username FROM users WHERE email=? AND password=?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("❌ DB Login Error:", err);
      return res.status(500).json({ message: "DB Error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    return res.status(200).json({
      message: "Login Success",
      user: results[0].username
    });
  });
});

// ECS Port Listener
app.listen(3000, () => {
  console.log("🚀 ELMS Backend running on port 3000");
});

