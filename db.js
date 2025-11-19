// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

// use MONGODB_URI here to match .env
const uri = process.env.MONGODB_URI;

// helpful safety check:
if (!uri) {
  console.error("❌ MONGODB_URI is not set. Check your .env file.");
  process.exit(1);
}

const client = new MongoClient(uri);
let dbInstance;

async function connectToDatabase() {
  if (!dbInstance) {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    dbInstance = client.db("FosterTrack"); // or your actual DB name
  }
  return dbInstance;
}

module.exports = { connectToDatabase };
