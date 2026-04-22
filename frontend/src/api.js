import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
    console.error('[api] VITE_API_BASE_URL is not defined. Create a .env file based on .env.example');
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

const getCsrfToken = () => {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
};

api.interceptors.request.use((config) => {
    const token = getCsrfToken();
    if (token) {
        config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // optionally redirect to login could be handled by caller
        }
        return Promise.reject(error);
    }
);

// Auth API
export const login = (username, password) =>
    api.post('/auth/login', { username, password });

export const logout = () =>
    api.post('/auth/logout');

export const getCurrentUser = () =>
    api.get('/auth/me', {
        validateStatus: (status) => status === 200 || status === 401
    });

export const fetchCsrf = () => api.get('/auth/csrf');

// Medicine API
export const getAllMedicines = () =>
    api.get('/medicines');

export const getMedicineById = (id) =>
    api.get(`/medicines/${id}`);

export const addMedicine = (medicine) =>
    api.post('/medicines', medicine);

export const updateMedicine = (id, medicine) =>
    api.put(`/medicines/${id}`, medicine);

export const deleteMedicine = (id) =>
    api.delete(`/medicines/${id}`);

export const searchMedicines = (name) =>
    api.get(`/medicines/search?name=${name}`);

export const getLowStockMedicines = () =>
    api.get('/medicines/low-stock');

export const getExpiringSoonMedicines = () =>
    api.get('/medicines/expiring-soon');

// Sales API
export const processSale = (items) =>
    api.post('/sales', { items });

export const getAllSales = () =>
    api.get('/sales');

export default api;
