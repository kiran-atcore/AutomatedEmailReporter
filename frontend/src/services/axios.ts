import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the access token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle token refresh if a 401 is encountered
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh');
                if (refreshToken) {
                    const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    const newAccessToken = res.data.access;
                    localStorage.setItem('access', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, log out the user
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
