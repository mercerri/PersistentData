// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (our front-end) from /public
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Health check ---------- */
app.get("/health", async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });
    res.json({ status: "ok", message: "FosterTrack API is running" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Database not reachable" });
  }
});

/* ---------- CATS ---------- */

// Get all cats
app.get("/cats", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const cats = await db
      .collection("cats")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    res.json(cats);
  } catch (err) {
    console.error("Error fetching cats:", err);
    res.status(500).json({ error: "Failed to fetch cats" });
  }
});

// Create a new cat
app.post("/cats", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const catsCol = db.collection("cats");

    const {
      name,
      status,
      intakeDate,
      gender,
      notes,
      personality = [],
      photo = "",
    } = req.body;

    const newCat = {
      name: name || "",
      status: status || "In Foster",
      intakeDate: intakeDate || "",
      gender: gender || "Unknown",
      notes: notes || "",
      personality: Array.isArray(personality) ? personality : [],
      photo,
      createdAt: new Date(),
    };

    const result = await catsCol.insertOne(newCat);
    res.status(201).json({ ...newCat, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating cat:", err);
    res.status(500).json({ error: "Failed to create cat" });
  }
});

// Delete a cat + all its logs
app.delete("/cats/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const catsCol = db.collection("cats");
    const logsCol = db.collection("logs");

    const { id } = req.params;

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: "Invalid cat id" });
    }

    const catResult = await catsCol.deleteOne({ _id: objectId });
    await logsCol.deleteMany({ catId: id }); // logs reference catId as string

    res.json({ deletedCount: catResult.deletedCount });
  } catch (err) {
    console.error("Error deleting cat:", err);
    res.status(500).json({ error: "Failed to delete cat" });
  }
});

/* ---------- LOGS ---------- */

// Get logs for a single cat
app.get("/cats/:catId/logs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const logsCol = db.collection("logs");
    const { catId } = req.params;

    const logs = await logsCol
      .find({ catId })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Create a log for a cat
app.post("/cats/:catId/logs", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const logsCol = db.collection("logs");
    const { catId } = req.params;

    const {
      date,
      mood,
      medication,
      medicationDetails = "",
      notes = "",
    } = req.body;

    const newLog = {
      catId,
      date: date || "",
      mood: mood || "",
      medication: medication || "",
      medicationDetails,
      notes,
      createdAt: new Date(),
    };

    const result = await logsCol.insertOne(newLog);
    res.status(201).json({ ...newLog, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating log:", err);
    res.status(500).json({ error: "Failed to create log" });
  }
});

// Update an existing log
app.put("/logs/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const logsCol = db.collection("logs"); // <-- same collection name you used before

    const { id } = req.params;

    // Make sure the id is a valid ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return res.status(400).json({ error: "Invalid log id" });
    }

    const { date, mood, medication, medicationDetails, notes } = req.body;

    const result = await logsCol.updateOne(
      { _id: objectId },
      {
        $set: {
          date,
          mood,
          medication,
          medicationDetails,
          notes,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error updating log:", err);
    res.status(500).json({ error: "Failed to update log" });
  }
});


/* ---------- Start server ---------- */
async function startServer() {
  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB Atlas");
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
