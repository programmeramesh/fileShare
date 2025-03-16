import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Add directConnection=true to avoid buffering timeouts
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rameshgprogrammer:010797@cluster0.ghh8iij.mongodb.net/fileshare?retryWrites=true&w=majority&directConnection=true';

const DBConnection = async () => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // Configure Mongoose settings globally
            mongoose.set('bufferCommands', false); // Disable buffering
            mongoose.set('bufferTimeoutMS', 30000);

            console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${maxRetries})...`);
            
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                dbName: 'fileshare',
                retryWrites: true,
                w: 'majority',
                directConnection: true, // Add direct connection
                autoCreate: true // Automatically create collections
            });

            // Add connection event listeners
            mongoose.connection.on('connected', () => {
                console.log('Database connected successfully');
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                if (err.name === 'MongooseServerSelectionError') {
                    console.error('Please ensure your IP is whitelisted in MongoDB Atlas');
                }
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Database disconnected');
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
                await db.createCollection('files', {
                    validator: {
                        $jsonSchema: {
                            bsonType: "object",
                            required: ["name", "contentType", "size", "data"],
                            properties: {
                                name: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                },
                                contentType: {
                                    bsonType: "string",
                                    description: "must be a string and is required"
                                },
                                size: {
                                    bsonType: "number",
                                    description: "must be a number and is required"
                                },
                                data: {
                                    bsonType: "binData",
                                    description: "must be a binary data and is required"
                                },
                                downloadCount: {
                                    bsonType: "number",
                                    description: "must be a number"
                                },
                                createdAt: {
                                    bsonType: "date",
                                    description: "must be a date"
                                }
                            }
                        }
                    }
                });
                console.log('Files collection created with schema validation');
            }

            // Successfully connected, break out of retry loop
            break;

        } catch (error) {
            console.error(`Error connecting to MongoDB (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
            
            if (error.name === 'MongooseServerSelectionError') {
                console.error('\nPossible solutions:');
                console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
                console.error('2. Verify your MongoDB connection string');
                console.error('3. Ensure MongoDB Atlas cluster is running');
            }

            retryCount++;
            if (retryCount === maxRetries) {
                throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default DBConnection;