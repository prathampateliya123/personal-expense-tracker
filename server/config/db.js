/**
 * config/db.js
 * MongoDB connection with retry.
 * Uses Google DNS to fix querySrv ECONNREFUSED on Windows, with standard URI fallback.
 */

import dns from "dns";
import mongoose from "mongoose";

// Windows default DNS often fails SRV lookups for mongodb+srv — use public DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

let retryTimer = null;
let placeholderWarned = false;
let useStandardUri = process.env.MONGO_USE_STANDARD === "true";

export const isDbConnected = () => mongoose.connection.readyState === 1;

const getCredentials = () => {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const cluster = process.env.MONGO_CLUSTER;
  const dbName = process.env.MONGO_DB || "expense-tracker";

  if (!user || !password || !cluster) return null;
  if (password === "YOUR_DB_PASSWORD") return null;

  return {
    user: encodeURIComponent(user),
    password: encodeURIComponent(password),
    cluster,
    dbName,
  };
};

const buildSrvUri = (creds) =>
  `mongodb+srv://${creds.user}:${creds.password}@${creds.cluster}/${creds.dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const buildStandardUri = (creds) => {
  const hosts =
    process.env.MONGO_HOSTS ||
    "ac-h7ue0jf-shard-00-00.iiytvhd.mongodb.net:27017,ac-h7ue0jf-shard-00-01.iiytvhd.mongodb.net:27017,ac-h7ue0jf-shard-00-02.iiytvhd.mongodb.net:27017";

  const replicaSet = process.env.MONGO_REPLICA_SET || "atlas-r0ik83-shard-0";

  return `mongodb://${creds.user}:${creds.password}@${hosts}/${creds.dbName}?ssl=true&replicaSet=${replicaSet}&authSource=admin&retryWrites=true&w=majority`;
};

const buildMongoUri = () => {
  if (process.env.MONGO_URI && !process.env.MONGO_URI.includes("YOUR_DB_PASSWORD")) {
    return process.env.MONGO_URI;
  }

  const creds = getCredentials();
  if (!creds) return null;

  if (useStandardUri || process.env.MONGO_USE_STANDARD === "true") {
    return buildStandardUri(creds);
  }

  return buildSrvUri(creds);
};

const warnPlaceholder = () => {
  if (placeholderWarned) return;
  placeholderWarned = true;

  console.error("\n========================================");
  console.error("  MongoDB NOT connected");
  console.error("  Set MONGO_PASSWORD in server/.env");
  console.error("  Then restart: npm run dev");
  console.error("========================================\n");
};

const scheduleRetry = () => {
  if (retryTimer) return;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectDB();
  }, 5000);
};

const connectWithUri = async (uri) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
};

const connectDB = async () => {
  const uri = buildMongoUri();

  if (!uri) {
    warnPlaceholder();
    scheduleRetry();
    return;
  }

  try {
    const conn = await connectWithUri(uri);
    placeholderWarned = false;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const isSrvError =
      error.message.includes("querySrv") ||
      error.message.includes("ECONNREFUSED");

    if (isSrvError && !useStandardUri) {
      console.warn("SRV DNS failed — switching to standard MongoDB URI...");
      useStandardUri = true;
      try {
        const creds = getCredentials();
        const standardUri = buildStandardUri(creds);
        const conn = await connectWithUri(standardUri);
        placeholderWarned = false;
        console.log(`MongoDB connected (standard URI): ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`Standard URI also failed: ${fallbackError.message}`);
      }
    }

    console.error(`MongoDB connection error: ${error.message}`);

    if (
      error.message.includes("bad auth") ||
      error.message.includes("Authentication failed")
    ) {
      console.error("Wrong password — check MONGO_PASSWORD in server/.env");
    }

    console.log("Retrying MongoDB in 5 seconds...");
    scheduleRetry();
  }
};

mongoose.connection.on("disconnected", () => {
  if (mongoose.connection.readyState === 0) return;
  console.warn("MongoDB disconnected — retrying...");
  scheduleRetry();
});

export default connectDB;
