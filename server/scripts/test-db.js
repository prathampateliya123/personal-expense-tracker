/**
 * scripts/test-db.js
 * Run: npm run test:db
 */

import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;
const dbName = process.env.MONGO_DB || "expense-tracker";

if (!user || !password || password === "YOUR_DB_PASSWORD") {
  console.error("Set MONGO_PASSWORD in server/.env");
  process.exit(1);
}

const u = encodeURIComponent(user);
const p = encodeURIComponent(password);

const srvUri = `mongodb+srv://${u}:${p}@${cluster}/${dbName}?retryWrites=true&w=majority`;
const standardUri =
  process.env.MONGO_URI ||
  `mongodb://${u}:${p}@ac-h7ue0jf-shard-00-00.iiytvhd.mongodb.net:27017,ac-h7ue0jf-shard-00-01.iiytvhd.mongodb.net:27017,ac-h7ue0jf-shard-00-02.iiytvhd.mongodb.net:27017/${dbName}?ssl=true&replicaSet=atlas-r0ik83-shard-0&authSource=admin&retryWrites=true&w=majority`;

const tryConnect = async (uri, label) => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });
    console.log(`MongoDB connection OK (${label}):`, mongoose.connection.host);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`${label} failed:`, error.message);
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
    return false;
  }
};

if (await tryConnect(srvUri, "SRV")) {
  process.exit(0);
}

if (await tryConnect(standardUri, "standard URI")) {
  process.exit(0);
}

process.exit(1);
