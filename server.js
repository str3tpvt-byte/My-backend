const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

app.use(cors());
app.use(express.json());

let users = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.json({
    message: "🚀 API is running successfully",
    status: "OK",
  });
});

app.post("/register", async (req, res) => {
  const { id, name, email, password } = req.body;

  if (!id || !name || !email || !password) {
    return res.status(400).json({ 
      error: "ID, name, email, and password are required" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: "Password must be at least 6 characters" 
    });
  }

  if (users.find(u => u.id === id)) {
    return res.status(409).json({ error: "ID already exists" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: id,
    name: name,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

app.post("/login", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ 
      error: "ID and password are required" 
    });
  }

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(401).json({ error: "Invalid ID or password" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid ID or password" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    message: "Login successful",
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.get("/users", (req, res) => {
  const publicUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt
  }));
  res.json(publicUsers);
});

app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  });
});

app.put("/users/:id", authenticateToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "You can only update your own account" });
  }

  const { name, email } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;

  res.json({
    message: "User updated successfully",
    user: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt
    }
  });
});

app.delete("/users/:id", authenticateToken, (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "You can only delete your own account" });
  }

  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  res.json({ message: "User deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
