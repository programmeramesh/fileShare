import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amesh:amesh123@cluster0.wfwpbmw.mongodb.net/fileshare?retryWrites=true&w=majority';

const DBConnection = async () => {
    try {
        // Configure Mongoose settings globally
        mongoose.set('bufferCommands', true);
        mongoose.set('bufferTimeoutMS', 30000); // Increase buffer timeout to 30 seconds

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds timeout
            dbName: 'fileshare', // Explicitly specify database name
            connectTimeoutMS: 30000,
        });
        
        // Add connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('Database connected successfully');
            
            // Ensure indexes are created
            const db = mongoose.connection.db;
            db.collection('files').createIndex({ 'createdAt': 1 }, { background: true });
            db.collection('files').createIndex({ 'name': 1 }, { background: true });
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            // Attempt to reconnect
            setTimeout(() => {
                mongoose.connect(MONGODB_URI).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Database disconnected');
            // Attempt to reconnect
            setTimeout(() => {
                mongoose.connect(MONGODB_URI).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, 5000);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('Database connection closed due to app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        console.log('Database connected successfully');
        
        // Initialize collections if they don't exist
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        if (!collections.some(c => c.name === 'files')) {
            await db.createCollection('files');
            console.log('Files collection created');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error; // Rethrow to handle in server.js
    }
};

export default DBConnection;