import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from './api';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        preloadCsrf().then(checkAuth);
    }, []);

    const preloadCsrf = async () => {
        try {
            await api.get('/auth/csrf');
        } catch (e) {
            console.error('CSRF preload failed', e);
        }
    };

    const checkAuth = async () => {
        try {
            const response = await getCurrentUser();
            if (response.status === 200 && response.data?.username) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        await preloadCsrf();
        const response = await apiLogin(username, password);
        setUser(response.data);
        return response.data;
    };

    const logout = async () => {
        try {
            await apiLogout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
