const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "airship@0000",
    database: "FarmSuite"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to the FarmSuite database ✅");
    }
});

// Signup Route (Without Hashing)
app.post("/signup", (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO users (name, username, password) VALUES (?, ?, ?)";
    db.query(sql, [name, username, password], (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "User registered successfully!" });
    });
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Check if the password matches (No hashing, direct comparison)
        const user = results[0];
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.status(200).json({ message: "Login successful!", user: { id: user.id, username: user.username } });
    });
});




// Route to record milk production
app.post("/api/milk-production", (req, res) => {
    const { cow_id, milk_liters } = req.body;

    // Validate input
    if (!cow_id || !milk_liters) {
        return res.status(400).json({ error: "Cow ID and milk production amount are required" });
    }

    // Ensure milk_liters is a valid number
    const milkAmount = parseFloat(milk_liters);
    if (isNaN(milkAmount)) {
        return res.status(400).json({ error: "Milk production must be a valid number" });
    }

    // Insert into the MilkProduction table
    const sql = "INSERT INTO MilkProduction (cow_id, milk_liters) VALUES (?, ?)";
    db.query(sql, [cow_id, milkAmount], (err, result) => {
        if (err) {
            console.error("Database error when recording milk production:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        res.status(201).json({ message: "Milk production recorded successfully!", record_id: result.insertId });
    });
});


// Route to fetch milk production records
app.get("/api/milk-production", (req, res) => {
    const sql = "SELECT * FROM MilkProduction ORDER BY record_date DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error when fetching milk records:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        res.status(200).json(results);
    });
});






// Start Server
app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
});