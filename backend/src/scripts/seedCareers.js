/**
 * seedCareers.js
 * ──────────────
 * Run this script to populate the careers collection in MongoDB.
 *
 * Usage (from backend/ directory):
 *   node src/scripts/seedCareers.js
 *
 * It will:
 *   1. Connect to MongoDB
 *   2. Clear any existing careers
 *   3. Insert all 15 careers from careers.json
 *   4. Print a summary and exit
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Career   = require("../models/Career");
const careers  = require("../data/careers.json");

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!\n");

    // Wipe existing careers
    const deleted = await Career.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing career(s)\n`);

    // Insert all careers
    const inserted = await Career.insertMany(careers);
    console.log(`🌱 Seeded ${inserted.length} careers:\n`);

    inserted.forEach((c) =>
      console.log(`   ${c.icon}  ${c.title.padEnd(28)} [${c.category}]  ${c.slug}`)
    );

    console.log("\n✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seed();
