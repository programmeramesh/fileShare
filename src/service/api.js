import axios from 'axios';

const API_URI = 'https://fileshare-fvrm.onrender.com';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URI,
    timeout: 60000, // 60 second timeout
    headers: {
        'Accept': 'application/json'
    }
});

// Health check function
export const checkServerHealth = async () => {
    try {
        const response = await axiosInstance.get('/health');
        return response.data;
    } catch (error) {
        console.error('Server health check failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

export const uploadFile = async (data) => {
    try {
        // For file uploads, we need to set the correct content type
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted);
            },
            // Increase timeout for large files
            timeout: 120000 // 2 minutes
        };

        // First check server health
        await axiosInstance.get('/health');

        const response = await axiosInstance.post('/upload', data, config);
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Upload timed out. Please try again with a smaller file or check your connection.');
        }
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}