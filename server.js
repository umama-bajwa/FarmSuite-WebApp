const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to local MongoDB
mongoose.connect("mongodb://localhost:27017/farmsuite")
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "worker",
    enum: ['worker', 'manager', 'owner', 'vet', 'shopkeeper']
  }
});


const User = mongoose.model("User", userSchema);

// ✅ Login Route (restored)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login request:", req.body);

  try {
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    res.json({
      message: "Login successful!",
      role: user.role,
      userId: user._id
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});


// ✅ Signup Route with Validation
app.post("/signup", [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isAlpha('en-US', { ignore: ' ' }).withMessage("Name should only contain alphabets"),

  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .matches(/^[a-z0-9]+$/).withMessage("Username must only contain lowercase letters and digits"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .withMessage("Password contains invalid characters"),
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken." });
    }

    const newUser = new User({ name, username, password });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});







// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
