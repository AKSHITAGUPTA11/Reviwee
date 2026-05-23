#!/usr/bin/env node
// ============================================================
// Admin Seed Script
// Creates the initial super admin user in MongoDB
// Runs automatically on API container startup
// ============================================================
 
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
 
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://reviwee_user:Reviwee@DB#2024@mongodb:27017/reviwee_db?authSource=reviwee_db";
 
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@reviwee.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Super Admin";
 
// ---- Minimal User Schema matching common Mongoose patterns ----
// Covers most standard field names used in Express/Mongoose projects
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "super_admin" },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    userType: { type: String, default: "super_admin" },
    type: { type: String, default: "super_admin" },
  },
  { timestamps: true }
);
 
async function seed() {
  console.log("🌱 Starting admin seed script...");
 
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log("✅ Connected to MongoDB");
 
    // Try to load the actual User model from the project
    let User;
    try {
      // Try common model paths used in Express projects
      const paths = [
        "../api/v1/model/User",
        "../api/v1/models/User",
        "../api/v1/Model/User",
        "../models/User",
        "../model/User",
        "../api/v1/model/user",
        "../api/v1/models/user",
      ];
 
      for (const p of paths) {
        try {
          User = require(p);
          if (User && User.findOne) {
            console.log(`✅ Loaded User model from: ${p}`);
            break;
          }
          // Handle ES module default export
          if (User && User.default && User.default.findOne) {
            User = User.default;
            console.log(`✅ Loaded User model (default) from: ${p}`);
            break;
          }
        } catch (e) {
          // try next path
        }
      }
    } catch (e) {
      console.log("ℹ️  Could not load project User model, using fallback schema");
    }
 
    // Fallback to generic model if project model not found
    if (!User || !User.findOne) {
      User = mongoose.models.User || mongoose.model("User", userSchema);
      console.log("ℹ️  Using fallback User schema");
    }
 
    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      await mongoose.disconnect();
      process.exit(0);
    }
 
    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
 
    // Create admin user with all common field variants
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
      isEmailVerified: true,
      isDeleted: false,
      status: "active",
      userType: "super_admin",
      type: "super_admin",
    });
 
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     super_admin`);
 
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    // Don't exit with error - allow API to start even if seed fails
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(0);
  }
}
 
seed();