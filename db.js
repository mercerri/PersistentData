// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

// Create one shared client
const client = new MongoClient(uri);
let db;

/**
 * Connect to MongoDB Atlas and return the FosterTrack database.
 * We reuse the same connection so it doesn't reconnect every time.
 */
async function connectToDatabase() {
  if (db) {
    return db; // already connected
  }

  try {
    await client.connect();
    db = client.db("FosterTrack"); // matches your Atlas DB name
    console.log("✅ Connected to MongoDB Atlas");
    return db;
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    throw err;
  }
}

module.exports = { connectToDatabase };
