import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('taskflow_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('taskflow_token');
        if (token) {
            API.get('/auth/me')
                .then(res => {
                    setUser(res.data.user);
                    localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    localStorage.removeItem('taskflow_token');
                    localStorage.removeItem('taskflow_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('taskflow_token', res.data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const res = await API.post('/auth/register', { name, email, password });
        localStorage.setItem('taskflow_token', res.data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    }, []);

    const googleLogin = useCallback(async (token) => {
        const res = await API.post('/auth/google', { token });
        localStorage.setItem('taskflow_token', res.data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
