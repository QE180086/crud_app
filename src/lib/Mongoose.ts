import mongoose from "mongoose";

const MONGO_URI= process.env.MONGODB_URI!;
if (!MONGO_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}