import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const page = parseInt(searchParams.get('page')) || 1;

    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [upNext, setUpNext] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch posts for the main feed
                const postsRes = await api.get(`/posts?search=${search}&tag=${tag}&page=${page}`);
                setPosts(postsRes.data.posts || []);
                setTotalPages(postsRes.data.pages || 1);

                // Fetch recommended posts separately to make it resilient
                try {
                    const upNextRes = await api.get('/posts?limit=5&sort=trending&type=article');
                    setUpNext(upNextRes.data.posts || []);
                } catch (err) {
                    console.error('Error fetching recommended posts:', err);
                }
            } catch (err) {
                console.error('Error fetching feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [search, tag, page]);

    return (
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-16 justify-center min-h-screen p-6 sm:p-10 max-w-[1400px] mx-auto">
            {/* Left Column: Feed */}
            <div className="flex-grow max-w-[680px] w-full">
                <header className="mb-12">
                    <form action="/" method="GET" className="relative group">
                        <div className="absolute inset-0 bg-substack-orange/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            className="relative w-full bg-[#141414]/80 backdrop-blur-xl text-white px-14 py-4.5 rounded-2xl border border-white/[0.05] focus:outline-none focus:border-substack-orange/40 focus:bg-[#1A1A1A] transition-all font-sans placeholder:text-gray-600 shadow-2xl"
                            placeholder="Search stories, writers, or tags..."
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-substack-orange transition-colors" />
                        {search && (
                            <Link to="/" className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Clear</Link>
                        )}
                    </form>
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                                <div className="absolute inset-0 border-t-2 border-substack-orange rounded-full animate-spin" />
                            </div>
                            <p className="text-gray-600 font-serif italic animate-pulse">Curating your feed...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-8">
                                {posts.map((post, idx) => (
                                    <div key={post.id} className="animate-in fade-in slide-in-from-bottom" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <BlogCard post={post} />
                                    </div>
                                ))}
                            </div>

                            {posts.length === 0 && (
                                <div className="text-center py-32 bg-[#141414]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/[0.03] shadow-2xl">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Empty Stack</h3>
                                    <p className="text-gray-500 font-serif italic">No stories match your current search.</p>
                                    <Link to="/" className="text-substack-orange hover:underline mt-6 inline-block font-bold text-xs uppercase tracking-widest">Back to Home</Link>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-16 py-10 border-t border-white/[0.05]">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Link
                                            key={i}
                                            to={`/?search=${search}&page=${i + 1}`}
                                            className={`flex items-center justify-center w-11 h-11 rounded-2xl font-bold transition-all duration-300 ${
                                                page === i + 1 
                                                ? 'bg-substack-orange text-white shadow-lg shadow-orange-500/20' 
                                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/[0.05]'
                                            }`}
                                        >
                                            {i + 1}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="hidden xl:block w-80 xl:w-96 space-y-10 sticky top-10 h-fit">
                {!user && (
                    <div className="relative overflow-hidden bg-[#141414]/60 backdrop-blur-2xl border border-white/[0.05] rounded-[2.5rem] p-8 text-center shadow-2xl group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-substack-orange/5 blur-3xl -mr-16 -mt-16 group-hover:bg-substack-orange/10 transition-all duration-700" />
                        <div className="w-14 h-14 bg-substack-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-substack-orange/20 shadow-inner">
                            <TrendingUp className="text-substack-orange w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 font-serif tracking-tight">The Modern Stack</h3>
                        <p className="text-gray-500 text-sm mb-8 font-serif leading-relaxed italic">Join a community of thousands for deep insights and daily updates.</p>
                        <div className="space-y-4">
                            <Link to="/register" className="btn-substack w-full !py-4 shadow-xl">Get Your Access</Link>
                            <Link to="/login" className="btn-secondary w-full !py-4">Sign In</Link>
                        </div>
                    </div>
                )}

                <div className="bg-[#141414]/40 backdrop-blur-2xl border border-white/[0.03] rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-substack-orange shadow-[0_0_8px_rgba(255,103,25,0.6)]"></div>
                        Trending Stories
                    </h3>
                    <div className="space-y-8">
                        {upNext.map(recPost => (
                            <Link key={recPost.id} to={`/post/${recPost.slug}`} className="flex gap-5 group/item">
                                <div className="flex-grow">
                                    <h4 className="text-[15px] font-bold leading-tight group-hover/item:text-substack-orange transition-colors line-clamp-2 tracking-tight">
                                        {recPost.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                            {recPost.author?.name}
                                        </span>
                                    </div>
                                </div>
                                {recPost.images && (
                                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.05] bg-[#0A0A0A] shadow-lg">
                                        <img 
                                            src={(() => {
                                                const img = typeof recPost.images === 'string' ? JSON.parse(recPost.images)[0] : recPost.images[0];
                                                if (!img) return '';
                                                return img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000${img}`;
                                            })()} 
                                            alt={recPost.title}
                                            className="w-full h-full object-cover grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-700"
                                        />
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                    <Link to="/explore" className="flex items-center justify-between mt-10 pt-8 border-t border-white/[0.05] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-substack-orange transition-colors group">
                        See All Discoveries <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                
                <div className="p-8 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    <div className="flex flex-wrap gap-5 mb-5 opacity-60">
                        <a href="#" className="hover:text-substack-orange transition-colors">About</a>
                        <a href="#" className="hover:text-substack-orange transition-colors">Terms</a>
                        <a href="#" className="hover:text-substack-orange transition-colors">Privacy</a>
                    </div>
                    <span className="opacity-40">© 2026 THE MODERN STACK — DESIGNED FOR DEPTH</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
