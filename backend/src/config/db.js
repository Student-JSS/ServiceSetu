import mongoose from "mongoose";
import dns from "dns";
import { MongoMemoryServer } from "mongodb-memory-server";

// Fix Node.js DNS SRV resolution on local ISPs/Windows networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // fallback to system dns
}

let mongodInstance = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log("No MONGODB_URI provided. Starting embedded MongoMemoryServer...");
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      console.log(`Embedded MongoDB started at ${uri}`);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn("⚠️ Direct MongoDB connection failed. Falling back to embedded MongoMemoryServer...", error.message);
    try {
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Embedded MongoMemoryServer connected successfully at ${uri}`);
    } catch (innerError) {
      console.error("❌ Fatal Error: Could not start or connect to MongoDB:", innerError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
