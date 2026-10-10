require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Set it in your environment variables.');
}

mongoose.set('strictQuery', true);

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            maxPoolSize: 10
        });
        console.log('MongoDB connected:', mongoose.connection.host);
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        throw err;
    }
}

module.exports = { connectDB, mongoose };
