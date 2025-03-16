import axios from 'axios';

const API_URI = 'https://fileshare-fvrm.onrender.com';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URI,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 10000 // 10 second timeout
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
        // First check if server is healthy
        await checkServerHealth();

        // For file uploads, we need to set the correct content type
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted);
            }
        };

        const response = await axiosInstance.post('/upload', data, config);
        return response.data;
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}