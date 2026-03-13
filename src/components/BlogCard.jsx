import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, User, MoreHorizontal, TrendingUp, ArrowRight, Loader2, ShieldAlert, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import ShareModal from './ShareModal';

const BlogCard = ({ post }) => {
    const { user, isFollowing, follow, unfollow } = useAuth();
    const [followLoading, setFollowLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [likes, setLikes] = useState(post.likes_count ?? post.Likes?.length ?? 0);
    const [reaction, setReaction] = useState(post.user_reaction);
    const [showReactions, setShowReactions] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const moreMenuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMore(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReport = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        if (!user) return Swal.fire('Please login to report posts');

        const { value: reason } = await Swal.fire({
            title: 'Report Post',
            input: 'textarea',
            inputLabel: 'Why are you reporting this post?',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
                'aria-label': 'Type your reason here'
            },
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
            confirmButtonText: 'Report',
            customClass: {
                popup: 'bg-[#1A1A1A] border border-white/10 text-white rounded-[2rem]',
                title: 'text-2xl font-bold',
                input: 'bg-white/5 border-white/10 text-white rounded-xl'
            }
        });

        if (reason) {
            try {
                await api.post(`/posts/${post.id}/report`, { reason });
                Swal.fire({
                    title: 'Reported!',
                    text: 'Thank you for making our community safer.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'bg-[#1A1A1A] border border-white/10 text-white rounded-[2rem]'
                    }
                });
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to report post', 'error');
            }
        }
    };

    const handleBlock = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        if (!user) return Swal.fire('Please login to block users');

        const result = await Swal.fire({
            title: `Block ${post.author?.name}?`,
            text: "You won't see their posts in your feed anymore.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, block user',
            customClass: {
                popup: 'bg-[#1A1A1A] border border-white/10 text-white rounded-[2rem]',
                title: 'text-2xl font-bold'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.post('/posts/users/block', { userId: authorId });
                Swal.fire({
                    title: 'Blocked!',
                    text: 'User has been blocked.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'bg-[#1A1A1A] border border-white/10 text-white rounded-[2rem]'
                    }
                });
                // In a real app, you might want to hide this card or refresh the feed
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to block user', 'error');
            }
        }
    };

    const mainImage = post.images ? (typeof post.images === 'string' ? JSON.parse(post.images)[0] : post.images[0]) : null;
    const authorId = post.author_id || post.author?.id;
    const tags = post.keywords ? post.keywords.split(',').map(t => t.trim()).filter(t => t) : [];

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return Swal.fire('Please login to follow writers');
        setFollowLoading(true);
        try {
            if (isFollowing(authorId)) {
                await unfollow(authorId);
            } else {
                await follow(authorId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async (e, reactionType = '❤️') => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!user) return Swal.fire('Please login to like posts');
        setLikeLoading(true);
        try {
            const res = await api.post(`/posts/${post.id}/like`, { reaction: reactionType });
            if (res.data.msg === 'Post unliked') {
                setLikes(prev => prev - 1);
                setReaction(null);
            } else if (res.data.msg === 'Post liked') {
                setLikes(prev => prev + 1);
                setReaction(res.data.reaction);
            } else {
                // Reaction updated
                setReaction(res.data.reaction);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLikeLoading(false);
            setShowReactions(false);
        }
    };

    const reactions = ['👍', '❤️', '😊', '🤔', '🔥', '👏'];

    return (
        <div className="max-w-[720px] w-full mx-auto group/card relative bg-[#141414]/40 backdrop-blur-2xl border border-white/[0.03] rounded-[2rem] p-5 sm:p-8 mb-8 hover:bg-[#1A1A1A]/60 transition-all duration-700 overflow-hidden shadow-2xl hover:shadow-orange-500/[0.02] hover:-translate-y-1.5 hover:border-white/[0.08]">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-substack-orange/[0.02] blur-[100px] -mr-32 -mt-32 group-hover/card:bg-substack-orange/[0.05] transition-all duration-1000" />
            
            {/* Header: Author Info */}
            <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to={`/profile/${authorId}`} className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F1F1F] to-[#0A0A0A] flex items-center justify-center text-substack-orange border border-white/[0.05] overflow-hidden shadow-xl group-hover/card:scale-105 transition-transform duration-500">
                        {post.author?.avatar && post.author.avatar !== "" ? (
                            <img src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-substack-orange/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${authorId}`} className="font-bold text-white text-[15px] hover:text-substack-orange transition-colors tracking-tight">{post.author?.name}</Link>
                            <span className="text-white/10 text-[10px]">•</span>
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em]">
                                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex gap-2 mt-1.5">
                                {tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="text-[9px] text-substack-orange/80 font-bold uppercase tracking-widest bg-substack-orange/5 px-2.5 py-1 rounded-lg border border-substack-orange/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {user?.id !== authorId && (
                        <button 
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`text-[10px] font-bold uppercase tracking-widest transition-all py-2.5 px-5 rounded-xl border flex items-center gap-2 shadow-lg ${isFollowing(authorId) ? 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white' : 'bg-substack-orange text-white border-transparent hover:bg-white hover:text-black shadow-orange-500/10'}`}
                        >
                            {followLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isFollowing(authorId) ? 'Following' : 'Follow')}
                        </button>
                    )}
                    <div className="relative" ref={moreMenuRef}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(!showMore);
                            }}
                            className={`text-gray-600 hover:text-white transition-all p-2.5 rounded-xl hover:bg-white/5 ${showMore ? 'bg-white/5 text-white' : ''}`}
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {showMore && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl"
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Report Post</span>
                                </button>
                                {user?.id !== authorId && (
                                    <button
                                        onClick={handleBlock}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl"
                                    >
                                        <UserX className="w-4 h-4" />
                                        <span>Block User</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <Link to={`/post/${post.slug}`} className="relative block group mb-8">
                {post.type === 'article' && post.title && (
                    <div className="mb-4">
                        <h2 className={`text-2xl sm:text-3xl font-bold text-white font-serif leading-[1.2] group-hover:text-substack-orange/90 transition-all duration-300 tracking-tight break-words ${!post.subtitle ? 'line-clamp-2' : ''}`}>
                            {post.title}
                        </h2>
                        {post.subtitle ? (
                            <p className="text-gray-500 font-serif italic text-base sm:text-lg mt-3 leading-relaxed line-clamp-2 opacity-80 break-words">{post.subtitle}</p>
                        ) : (
                            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-500">
                                <span className="text-substack-orange text-[10px] font-bold uppercase tracking-[0.2em]">Read Article</span>
                                <ArrowRight className="w-3.5 h-3.5 text-substack-orange" />
                            </div>
                        )}
                    </div>
                )}
                <p className={`text-gray-400 font-serif leading-relaxed line-clamp-3 selection:bg-substack-orange/20 break-words ${
                    post.type === 'note' ? 'text-xl sm:text-2xl italic text-gray-200 leading-snug' : 'text-[15px] sm:text-[17px]'
                }`}>
                    {post.content.replace(/<[^>]*>?/gm, '').substring(0, 260)}...
                </p>
            </Link>

            {/* Main Media */}
            {mainImage && mainImage !== "" && (
                <Link to={`/post/${post.slug}`} className="block mb-8 rounded-3xl overflow-hidden border border-white/[0.03] shadow-2xl relative group/img aspect-[21/9] sm:aspect-[21/10] bg-[#0A0A0A] max-h-[200px] sm:max-h-[300px] md:max-h-[350px]">
                    <img 
                        src={mainImage.startsWith('http') || mainImage.startsWith('data:') ? mainImage : `http://localhost:5000${mainImage}`} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-all duration-[1.5s] group-hover/img:scale-105 group-hover/img:rotate-1 opacity-90 group-hover/img:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
                </Link>
            )}

            {/* Footer: Interactions */}
            <div className="relative flex items-center justify-between pt-8 border-t border-white/[0.05]">
                <div className="flex flex-wrap items-center gap-1 sm:gap-4 md:gap-6">
                    <div 
                        className="relative group/like-container"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {showReactions && (
                            <div className="absolute bottom-full left-0 z-50 pb-3">
                                <div className="bg-[#1A1A1A] border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-2 flex gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {reactions.map((emoji, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleLike(null, emoji);
                                            }}
                                            className="text-xl hover:scale-125 transition-transform p-1.5 hover:bg-white/5 rounded-xl grayscale-[0.5] hover:grayscale-0"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={(e) => handleLike(e, reaction || '❤️')}
                            disabled={likeLoading}
                            className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all group/btn relative z-10 ${likeLoading ? 'opacity-50' : reaction ? 'text-substack-orange bg-substack-orange/5' : 'text-gray-500 hover:text-red-500 hover:bg-red-500/5'}`}
                        >
                            {reaction ? (
                                <span className="text-lg leading-none transition-all group-active/btn:scale-125">{reaction}</span>
                            ) : (
                                <Heart className="w-5 h-5 transition-all group-active/btn:scale-125 group-hover/btn:fill-red-500" />
                            )}
                            <span className="text-sm font-bold tabular-nums tracking-tight">
                                {likes}
                            </span>
                        </button>
                    </div>
                    <Link 
                        to={`/post/${post.slug}#comments`}
                        className="flex items-center gap-3 px-4 py-2 rounded-2xl transition-all text-gray-500 hover:text-substack-orange hover:bg-substack-orange/5 group/btn relative z-10"
                    >
                        <MessageCircle className="w-5 h-5 transition-all group-active/btn:scale-125 group-hover/btn:fill-substack-orange/10" />
                        <span className="text-sm font-bold tabular-nums tracking-tight">
                            {post.comments_count ?? post.Comments?.length ?? 0}
                        </span>
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-2 text-gray-700 cursor-default">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-bold tabular-nums uppercase tracking-widest">{post.views || 0}</span>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsShareModalOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-2xl transition-all text-gray-500 hover:text-white hover:bg-white/5 group/btn relative z-10"
                >
                    <Share2 className="w-5 h-5 transition-all group-active/btn:scale-125" />
                    <span className="text-sm font-bold tabular-nums tracking-tight">
                        {post.shares_count ?? post.Shares?.length ?? 0}
                    </span>
                </button>
            </div>

            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                postId={post.id}
                postTitle={post.title || "Check out this story"}
                postUrl={`${window.location.origin}/post/${post.slug}`}
            />
        </div>
    );
};

export default BlogCard;
