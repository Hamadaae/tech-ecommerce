import mongoose from 'mongoose';

// CRITICAL for Vercel/Serverless: Cache connection between function invocations
// Without this, each request tries to create a new connection, causing timeouts
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if(!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // If we have a cached connection and it's ready, reuse it
    if (cached.conn) {
        // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        if (mongoose.connection.readyState === 1) {
            return cached.conn;
        }
        // Connection is dead, reset it
        cached.conn = null;
    }

    // If we don't have a connection promise, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // CRITICAL: Disable buffering - fail fast if not connected
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log('✅ Connected to MongoDB');
            return mongoose;
        }).catch((error) => {
            cached.promise = null;
            console.error('❌ MongoDB connection error:', error);
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}