const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");

const app = express();
const PORT = 3000;
const SECRET_KEY = "ed9c21b4a7989bafcea02091bc496e4a017b6f6b65d6506adac39715d020e43bc613567bf8d6cdcbea639476b5c1560cf95eab8eed9a8e1c1c3a20b7d09aa06b"; // Change this to a secure secret key

// Cassandra Client Setup
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1", 
  keyspace: "book_reviews",
});

app.use(bodyParser.json());
app.use(cors());

/* ----- User Registration ----- */
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.execute(
      "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, toTimestamp(now()))",
      [username, email, hashedPassword],
      { prepare: true }
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user." });
  }
});

/* ----- User Login ----- */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const result = await client.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
      { prepare: true }
    );

    if (result.rowLength === 0) {
      return res.status(400).json({ error: "User not found!" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in." });
  }
});

/* ----- Get User Profile ----- */
app.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const result = await client.execute(
      "SELECT username, email, created_at FROM users WHERE username = ?",
      [decoded.username],
      { prepare: true }
    );

    if (result.rowLength === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

/* ----- Start the Server ----- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
