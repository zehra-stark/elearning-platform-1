const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static UI
app.use(express.static(path.join(__dirname, "public")));

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Health route for ALB
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "ELMS" });
});

// Signup API
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Missing fields");
  }

  db.query(
    "INSERT INTO users (username,email,password) VALUES (?,?,?)",
    [username, email, password],
    (err) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).send("DB Error");
      }
      res.status(201).send("User Registered Successfully");
    }
  );
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Missing login fields");
  }

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err) {
        console.log("DB Error:", err);
        return res.status(500).send("DB Error");
      }
      if (results.length === 0) {
        return res.status(401).send("Invalid Credentials");
      }
      res.send("Login Success");
    }
  );
});

// RUN
app.listen(3000, () => {
  console.log("ELMS running on port 3000");
});

