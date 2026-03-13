import React, { useState, useEffect } from 'react';
import { Compass, Users, Loader2 } from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/BlogCard';

const Following = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowedPosts = async () => {
            try {
                const res = await api.get('/posts/following');
                setPosts(res.data || []);
            } catch (err) {
                console.error('Error fetching followed posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowedPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-substack-orange animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[640px] mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-substack-orange/10 rounded-2xl flex items-center justify-center border border-substack-orange/20">
                    <Users className="w-6 h-6 text-substack-orange" />
                </div>
                <h1 className="text-3xl font-bold text-white font-serif italic">Your Following</h1>
            </div>

            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <BlogCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="bg-[#1C1C1C] rounded-3xl border border-white/5 p-20 text-center">
                        <Compass className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-serif italic text-lg mb-2">Your feed is quiet...</p>
                        <p className="text-gray-600 text-sm">Follow some writers to see their latest stories here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Following;
