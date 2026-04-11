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

  users.push(user);

  res.status(201).json({
    message: "User added successfully",
    user,
  });
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
