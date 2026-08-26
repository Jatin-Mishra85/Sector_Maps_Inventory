import { createContext, useContext, useEffect, useState } from 'react';
import { ENV } from '../constants/env';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
                credentials: 'include',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setUser(data?.data || null);
        } catch (err) {
            console.error('Failed to fetch current user:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const loginWithGoogle = async (idToken) => {
        const res = await fetch(`${ENV.API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        if (data.success) {
            if (data.data?.token) localStorage.setItem('authToken', data.data.token);
            setUser(data.data);
        }
        return data;
    };

    // Naya — email/password login.
    const login = async (email, password) => {
        const res = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
            if (data.data?.token) localStorage.setItem('authToken', data.data.token);
            setUser(data.data);
        }
        return data;
    };

    // Naya — email/password signup.
    const signup = async (email, password, name) => {
        const res = await fetch(`${ENV.API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (data.success) {
            if (data.data?.token) localStorage.setItem('authToken', data.data.token);
            setUser(data.data);
        }
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${ENV.API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}