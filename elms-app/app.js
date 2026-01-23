const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
});

// Health for ALB
app.get("/health",(req,res)=>res.json({status:"UP",service:"ELMS"}));

// Register
app.post("/register",(req,res)=>{
  const {username,email,password}=req.body;
  db.query("INSERT INTO users(username,email,password) VALUES(?,?,?)",
    [username,email,password],
    (err)=> err ? res.send("DB Error") : res.send("User Registered")
  );
});

// Login
app.post("/login",(req,res)=>{
  const {email,password}=req.body;
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email,password],
    (err,result)=>{
      if(err) return res.send("DB Error");
      if(result.length===0) return res.send("Invalid Credentials");
      res.send("Login Success");
    }
  );
});

app.listen(3000,()=>console.log("ELMS running 3000"));

