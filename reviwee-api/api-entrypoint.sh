#!/bin/sh
# ============================================================
# API Startup Script
# 1. Wait for MongoDB to be ready
# 2. Wait for Redis to be ready
# 3. Run admin seed
# 4. Start the API server
# ============================================================
 
set -e
 
echo "🚀 Reviwee API starting..."
 
# ---- Wait for MongoDB ----
echo "⏳ Waiting for MongoDB..."
RETRIES=30
until node -e "
  const { MongoClient } = require('mongodb');
  MongoClient.connect('$MONGO_URI', { serverSelectionTimeoutMS: 3000 })
    .then(c => { c.close(); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo "❌ MongoDB not reachable after 30 attempts. Exiting."
    exit 1
  fi
  echo "   MongoDB not ready yet... ($RETRIES attempts left)"
  sleep 3
done
echo "✅ MongoDB is ready"
 
# ---- Wait for Redis ----
echo "⏳ Waiting for Redis..."
RETRIES=20
until node -e "
  const redis = require('redis');
  const client = redis.createClient({ url: '$REDIS_URL' });
  client.connect()
    .then(() => { client.quit(); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo "⚠️  Redis not reachable — continuing without Redis wait"
    break
  fi
  echo "   Redis not ready yet... ($RETRIES attempts left)"
  sleep 2
done
echo "✅ Redis check complete"
 
# ---- Run Admin Seed ----
echo "🌱 Running admin seed..."
node /app/scripts/seed-admin.js || echo "⚠️  Seed warning (non-fatal, continuing...)"
 
# ---- Start Server ----
echo "🚀 Starting Reviwee API on port $PORT..."
exec node server.js