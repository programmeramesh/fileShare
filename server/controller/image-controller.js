import File from '../models/file.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const uploadImage = async (request, response) => {
    if (!request.file) {
        return response.status(400).json({ error: 'No file uploaded' });
    }

    const fileObj = {
        path: request.file.path,
        name: request.file.originalname,
    }
    
    try {
        const file = await File.create(fileObj);
        const baseUrl = process.env.BASE_URL || 'https://fileshare-fvrm.onrender.com';
        response.status(200).json({ path: `${baseUrl}/file/${file._id}`});
    } catch (error) {
        console.error('Error in uploadImage:', error);
        response.status(500).json({ error: 'Failed to process file upload' });
    }
}

export const getImage = async (request, response) => {
    try {   
        const file = await File.findById(request.params.fileId);
        
        if (!file) {
            return response.status(404).json({ error: 'File not found' });
        }

        // Check if file exists on disk
        if (!file.path || !path.existsSync(file.path)) {
            return response.status(404).json({ error: 'File not found on server' });
        }

        file.downloadCount++;
        await file.save();

        response.download(file.path, file.name);
    } catch (error) {
        console.error('Error in getImage:', error);
        if (error.name === 'CastError') {
            return response.status(400).json({ error: 'Invalid file ID' });
        }
        response.status(500).json({ error: 'Failed to process file download' });
    }
}