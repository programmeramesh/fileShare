import File from '../models/file.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://fileshare-fvrm.onrender.com';

export const uploadImage = async (request, response) => {
    if (!request.file) {
        return response.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Read the file content before saving to database
        const fileContent = fs.readFileSync(request.file.path);
        
        const fileObj = {
            name: request.file.originalname,
            contentType: request.file.mimetype,
            size: request.file.size,
            data: fileContent // Store file content directly in MongoDB
        }

        const file = await File.create(fileObj);
        
        // Delete the temporary file after storing in MongoDB
        fs.unlinkSync(request.file.path);

        response.status(200).json({ 
            path: `${BASE_URL}/file/${file._id}`,
            name: file.name,
            size: file.size
        });
    } catch (error) {
        console.error('Error while uploading file:', error);
        response.status(500).json({ error: error.message || 'Error while uploading file' });
    }
}

export const getImage = async (request, response) => {
    try {
        const file = await File.findById(request.params.fileId);
        
        if (!file) {
            return response.status(404).json({ error: 'File not found' });
        }

        // Set appropriate headers
        response.set({
            'Content-Type': file.contentType,
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': file.size
        });

        // Send file data directly from MongoDB
        response.send(file.data);

        // Update download count asynchronously
        file.downloadCount = (file.downloadCount || 0) + 1;
        await file.save();
    } catch (error) {
        console.error('Error while downloading file:', error);
        response.status(500).json({ error: error.message || 'Error while downloading file' });
    }
}