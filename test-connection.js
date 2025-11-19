// test-connection.js
const { connectToDatabase } = require("./db");

async function run() {
  try {
    const db = await connectToDatabase();

    // List collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name));

    // Show sample logs from your "logs" collection
    const logs = await db.collection("logs").find({}).toArray();
    console.log("Sample logs:", logs);
  } catch (err) {
    console.error("Error during test:", err.message);
  } finally {
    process.exit(); // end script
  }
}

run();
