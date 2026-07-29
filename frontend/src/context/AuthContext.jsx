import { createContext, useContext, useEffect, useState } from 'react';
import { ENV } from '../constants/env';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const res = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
                credentials: 'include',
            });
            const data = await res.json();
            setUser(data?.data || null);
        } catch (err) {
            console.error('❌ Failed to fetch current user:', err);
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
            console.error('❌ Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
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