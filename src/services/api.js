import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 300000, // 5 minutes
    withCredentials: true
});

export default api;
