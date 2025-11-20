// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

let client;
let db;

async function connectToDatabase() {
  // Reuse connection if already open
  if (db) return db;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // Extra logging so Render logs are helpful
    console.error("❌ MONGODB_URI is NOT defined.");
    console.error("Available env keys:", Object.keys(process.env));
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  console.log("🔌 Using Mongo URI:", uri.split("@")[1] || "(hidden)");

  client = new MongoClient(uri);
  await client.connect();

  // Use DB_NAME if set, otherwise default to FosterTrack
  const dbName = process.env.DB_NAME || "FosterTrack";
  db = client.db(dbName);

  console.log(`✅ Connected to MongoDB Atlas, DB: ${dbName}`);
  return db;
}

module.exports = { connectToDatabase };
