require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('strictQuery', true);

let cachedConnection = null;

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not set. Set it in your environment variables.');
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 1,
            bufferCommands: false,
        });
        cachedConnection = conn;
        console.log('MongoDB connected:', conn.connection.host);
        return conn;
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        throw err;
    }
}

module.exports = { connectDB, mongoose };
