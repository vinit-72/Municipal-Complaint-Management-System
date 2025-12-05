// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Basic env checks
if (!process.env.MONGO_URI) {
    console.warn('[WARN] MONGO_URI not set. Using default mongodb://localhost:27017/municipal_db');
}
if (!process.env.JWT_SECRET) {
    console.warn('[WARN] JWT_SECRET not set. Using development fallback secret. Set JWT_SECRET in your .env for production.');
}

// --- MONGODB CONNECTION ---
// Disable mongoose buffering to fail fast when DB is not available
mongoose.set('bufferCommands', false);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/municipal_db';
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    let uri = MONGO_URI;
    let mongodInstance;

    // If user didn't provide MONGO_URI, start an in-memory mongodb for dev
    if (!process.env.MONGO_URI) {
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongodInstance = await MongoMemoryServer.create();
            uri = mongodInstance.getUri();
            // Some URI versions include deprecated query options; strip query string to avoid MongoParseError
            if (uri.includes('?')) {
                uri = uri.split('?')[0];
            }
            console.log('[DEV] Started in-memory MongoDB at', uri);
        } catch (err) {
            console.error('[DEV] Failed to start in-memory MongoDB:', err);
            console.error('Either install mongodb-memory-server or provide a real MONGO_URI.');
            process.exit(1);
        }
    }

    try {
        console.log('[DB] connecting to', uri);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // Mount routes AFTER DB connected to avoid buffering errors
        const authRoutes = require('./routes/auth');
        const complaintRoutes = require('./routes/complaints');
        const notificationRoutes = require('./routes/notifications');

        app.use('/api/auth', authRoutes);
        app.use('/api/complaints', complaintRoutes);
        app.use('/api/notifications', notificationRoutes);

        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        const shutdown = async () => {
            console.log('Shutting down server...');
            server.close();
            try { await mongoose.disconnect(); } catch (e) { }
            if (mongodInstance) await mongodInstance.stop();
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (err) {
        console.error('[DB] connection error:', err);
        process.exit(1);
    }
};

startServer();
