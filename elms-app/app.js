const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();

app.use(express.json());

// Serve static LMS Frontend
app.use(express.static(path.join(__dirname, "public")));

// DB Connection (from ECS task env)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Health Check for ALB Target Group
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "UP", service: "ELMS-APP" });
});

// User Registration API
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ message: "DB Error" });
      }
      return res.status(201).json({ message: "User Registered Successfully" });
    }
  );
});

// User Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing login fields" });
  }

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).json({ message: "DB Error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }

      return res.status(200).json({
        message: "Login Success",
        user: results[0].username
      });
    }
  );
});

// ECS Listening Port
app.listen(3000, () => {
  console.log("ELMS Backend running on port 3000");
});

