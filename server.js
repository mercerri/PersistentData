// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple health check route
app.get("/health", async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.command({ ping: 1 }); // confirm DB connection
    res.json({ status: "ok", message: "FosterTrack API is running" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Database not reachable" });
  }
});

// Get all logs
app.get("/logs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const logs = await db.collection("logs").find({}).toArray();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Create a new log
app.post("/logs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const newLog = req.body;
    const result = await db.collection("logs").insertOne(newLog);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create log" });
  }
});

async function startServer() {
  try {
    await connectToDatabase(); // 👈 this is what triggers the MongoDB connection on startup

    app.listen(PORT, () => {
      console.log(`🚀 FosterTrack API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server because MongoDB is not reachable:");
    console.error(err);
    process.exit(1);
  }
}

startServer();
