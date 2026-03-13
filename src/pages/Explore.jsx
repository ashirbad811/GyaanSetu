import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, TrendingUp, UserPlus, Compass, User } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import api from '../services/api';

const Explore = () => {
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    
    const [posts, setPosts] = useState([]);
    const [trendingTags, setTrendingTags] = useState([]);
    const [suggestedWriters, setSuggestedWriters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [postsRes, tagsRes, writersRes] = await Promise.all([
                    api.get(`/posts?search=${search}&tag=${tag}`),
                    api.get('/posts/tags/trending').catch(err => ({ data: [] })),
                    api.get('/auth/authors/recommended').catch(err => ({ data: [] }))
                ]);
                setPosts(postsRes.data.posts || []);
                setTrendingTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
                setSuggestedWriters(Array.isArray(writersRes.data) ? writersRes.data : []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [search, tag]);

    return (
        <div className="flex gap-4 xl:gap-8 justify-center min-h-screen p-4 sm:p-8">
            {/* Left Column: Feed */}
            <div className="flex-grow max-w-[640px]">
                <header className="mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Compass className="w-8 h-8 text-substack-orange" />
                        <h1 className="text-3xl font-bold text-white font-serif italic">Explore</h1>
                    </div>
                    <form action="/explore" method="GET" className="relative group">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            className="w-full bg-[#1C1C1C] text-white px-12 py-4 rounded-2xl border border-white/5 focus:outline-none focus:border-substack-orange/30 transition-all font-sans"
                            placeholder="Search topics, writers, or stories..."
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-substack-orange transition-colors" />
                    </form>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-substack-orange mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {posts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}

                            {posts.length === 0 && (
                                <div className="text-center py-20 bg-[#1C1C1C] rounded-2xl border border-white/5">
                                    <p className="text-gray-500 font-serif italic text-lg">No content matches your search.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Column: Trending Topics */}
            <div className="hidden lg:block w-80 space-y-8 sticky top-8 h-fit">
                <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-8">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-substack-orange" />
                        Trending Tags
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {trendingTags.length > 0 ? (
                            trendingTags.map((tag, idx) => (
                                <Link 
                                    key={idx}
                                    to={`/explore?tag=${tag.name}`}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-sm hover:border-substack-orange/30 hover:text-white transition-all font-bold"
                                >
                                    #{tag.name}
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-600 text-sm font-serif italic">Discovering trending topics...</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-8">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 flex items-center gap-2">
                        Suggested Writers
                    </h3>
                    <div className="space-y-6">
                        {suggestedWriters.length > 0 ? (
                            suggestedWriters.map(writer => (
                                <div key={writer.id} className="flex items-center justify-between group">
                                    <Link to={`/profile/${writer.id}`} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/5 overflow-hidden">
                                            {writer.avatar ? (
                                                <img src={writer.avatar.startsWith('http') ? writer.avatar : `http://localhost:5000${writer.avatar}`} alt={writer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-700" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-substack-orange transition-colors">{writer.name}</div>
                                            <div className="text-[9px] text-gray-500 uppercase tracking-widest">{writer.total_views || 0} views</div>
                                        </div>
                                    </Link>
                                    <Link to={`/profile/${writer.id}`} className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-substack-orange transition-colors">
                                        <UserPlus className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Connect with writers...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;
