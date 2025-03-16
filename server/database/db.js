import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const DBConnection = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found in environment variables');
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error while connecting with the database:', error.message);
    }
}

export default DBConnection;