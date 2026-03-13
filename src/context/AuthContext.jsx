import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [following, setFollowing] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchFollowing = async () => {
        try {
            const res = await api.get('/followers/following');
            setFollowing(res.data);
        } catch (err) {
            console.error('Error fetching following:', err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/messages/unread');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
                fetchFollowing();
                fetchUnreadCount();
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Periodic polling for unread count
    useEffect(() => {
        if (user) {
            const interval = setInterval(fetchUnreadCount, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user);
        fetchFollowing();
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        setUser(res.data.user);
        fetchFollowing();
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setFollowing([]);
        }
    };

    const follow = async (authorId) => {
        try {
            await api.post('/followers/follow', { author_id: authorId });
            fetchFollowing();
            return true;
        } catch (err) {
            console.error('Follow error:', err);
            throw err;
        }
    };

    const unfollow = async (authorId) => {
        try {
            await api.post('/followers/unfollow', { author_id: authorId });
            fetchFollowing();
            return true;
        } catch (err) {
            console.error('Unfollow error:', err);
            throw err;
        }
    };

    const isFollowing = (authorId) => {
        if (!authorId || !following) return false;
        const targetId = Number(authorId);
        return following.some(f => {
            const fAuthorId = Number(f.author_id || f.author?.id);
            return fAuthorId === targetId;
        });
    };

    return (
        <AuthContext.Provider value={{ user, following, unreadCount, loading, login, register, logout, follow, unfollow, isFollowing, fetchFollowing, fetchUnreadCount }}>
            {children}
        </AuthContext.Provider>
    );
};
