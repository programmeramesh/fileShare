import express from 'express';
import upload from '../utils/upload.js';
import { uploadImage, getImage } from '../controller/image-controller.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the File Sharing API' });
});

// Add error handling middleware for file upload
const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        next();
    });
};

router.post('/upload', uploadMiddleware, uploadImage);
router.get('/file/:fileId', getImage);

export default router;