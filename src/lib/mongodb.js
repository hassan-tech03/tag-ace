import mongoose from "mongoose";

// Cache the connection across hot reloads in dev and across invocations in
// serverless (e.g. Vercel). Each lambda invocation reuses the same client
// instead of opening a new connection per request.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Lazily throw so importing this file at build time doesn't crash. The
  // first call to dbConnect() during a request will surface the error.
  if (process.env.NODE_ENV !== "production") {
    console.warn("[mongodb] MONGODB_URI is not set. Admin features will fail at runtime.");
  }
}

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Add it to .env.local.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default dbConnect;
