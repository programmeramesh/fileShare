import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URI = 'https://fileshare-fvrm.onrender.com';
const LOCAL_URI = 'http://localhost:8000';

const testEndpoint = async (uri, endpoint, method = 'GET', data = null) => {
    try {
        console.log(`\nTesting ${method} ${uri}${endpoint}`);
        const config = {
            timeout: 30000, // 30 second timeout
            ...(data?.getHeaders ? { headers: data.getHeaders() } : {})
        };
        
        const response = method === 'GET' 
            ? await axios.get(`${uri}${endpoint}`, config)
            : await axios.post(`${uri}${endpoint}`, data, config);

        console.log('Status:', response.status);
        console.log('Response:', response.data);
        return true;
    } catch (error) {
        console.error(`Failed to connect to ${endpoint}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            error: error.response?.data?.error
        });
        return false;
    }
};

const testServer = async () => {
    console.log('Testing server connection...\n');
    console.log('Production Server:', API_URI);
    
    // Test root endpoint
    await testEndpoint(API_URI, '/');

    // Test health endpoint
    await testEndpoint(API_URI, '/health');
    
    // Create a test image file for upload test
    const testFilePath = path.join(__dirname, 'test.jpg');
    const imageData = Buffer.alloc(1024); // 1KB of data
    fs.writeFileSync(testFilePath, imageData);
    
    try {
        console.log('\nTesting file upload...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath), {
            filename: 'test.jpg',
            contentType: 'image/jpeg'
        });
        await testEndpoint(API_URI, '/upload', 'POST', formData);
    } finally {
        // Clean up test file
        fs.unlinkSync(testFilePath);
    }
};

testServer();
