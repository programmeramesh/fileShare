import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rameshgprogrammer:010797@cluster0.ghh8iij.mongodb.net/fileshare?retryWrites=true&w=majority';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });

        console.log('Successfully connected to MongoDB!');
        console.log('Connection state:', mongoose.connection.readyState);
        
        // Test creating a collection
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\nExisting collections:', collections.map(c => c.name));
        
        if (!collections.some(c => c.name === 'files')) {
            await db.createCollection('files');
            console.log('Created files collection');
        }

        // Test inserting a document
        const testDoc = {
            name: 'test.txt',
            contentType: 'text/plain',
            size: 123,
            data: Buffer.from('test content'),
            createdAt: new Date()
        };

        const result = await db.collection('files').insertOne(testDoc);
        console.log('\nTest document inserted:', result.insertedId);
        
        // Clean up test document
        await db.collection('files').deleteOne({ _id: result.insertedId });
        console.log('Test document cleaned up');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnection closed');
    }
}

testConnection();
