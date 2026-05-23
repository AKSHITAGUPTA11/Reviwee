// ============================================================
// MongoDB Init Script — runs once on first container start
// Creates the app database user with proper permissions
// ============================================================
 
db = db.getSiblingDB("reviwee_db");
 
// Create app user with readWrite access on reviwee_db
db.createUser({
  user: "reviwee_user",
  pwd: "Reviwee@DB#2024",
  roles: [
    {
      role: "readWrite",
      db: "reviwee_db",
    },
  ],
});
 
// Create initial collections to initialize DB
db.createCollection("users");
db.createCollection("settings");
 
print("✅ MongoDB initialized: reviwee_db created with reviwee_user");
 