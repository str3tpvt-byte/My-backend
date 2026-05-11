const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔥 In-memory database (for testing)
let users = [];

/**
 * HOME
 */
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API is running successfully",
    status: "OK",
  });
});

/**
 * GET all users
 */
app.get("/users", (req, res) => {
  res.json(users);
});

/**
 * CREATE user
 */
app.post("/users", (req, res) => {
  const user = req.body;

  if (!user.name) {
    return res.status(400).json({ error: "Name is required" });
  }

  user.id = users.length + 1;
  users.push(user);

  res.status(201).json({
    message: "User created successfully",
    user: user,
  });
});

/**
 * GET user by ID
 */
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

/**
 * DELETE user
 */
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  res.json({ message: "User deleted successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
