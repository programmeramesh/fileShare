import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import DBConnection from './database/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: true,
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS']
}));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the File Sharing API' });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    const healthData = {
        status: mongoose.connection.readyState === 1 ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            connected: mongoose.connection.readyState === 1,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
        }
    };
    res.status(healthData.status === 'ok' ? 200 : 503).json(healthData);
});

// Routes
app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle MongoDB errors
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
        return res.status(503).json({ 
            error: 'Database error',
            details: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred'
        });
    }
    
    // Handle file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({ 
            error: 'File upload error',
            details: err.message
        });
    }

    // Handle payload too large
    if (err.name === 'PayloadTooLargeError') {
        return res.status(413).json({ 
            error: 'File too large',
            details: 'The uploaded file exceeds the size limit'
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation error',
            details: err.message
        });
    }

    // Default error
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

const PORT = process.env.PORT || 8000;

// Connect to database before starting server
const startServer = async () => {
    try {
        await DBConnection();
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`);
            console.log(`Health check available at: /health`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();