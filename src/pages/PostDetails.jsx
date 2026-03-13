import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, MessageCircle, Share2, TrendingUp, UserPlus, Send, Loader2, MoreHorizontal, ShieldAlert, UserX } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import ShareModal from '../components/ShareModal';

const PostDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isFollowing, follow, unfollow } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [reaction, setReaction] = useState(null);
    const [showReactions, setShowReactions] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
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

    const reactions = ['👍', '❤️', '😊', '🤔', '🔥', '👏'];

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${slug}`);
            setPost(res.data);
            setReaction(res.data.user_reaction);
        } catch (err) {
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [slug]);

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
                setReaction(null);
                setPost(prev => ({ ...prev, likes_count: Math.max(0, (prev.likes_count || 0) - 1) }));
            } else if (res.data.msg === 'Post liked') {
                setReaction(res.data.reaction);
                setPost(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
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

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return Swal.fire('Please login to comment');
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            await api.post(`/posts/${post.id}/comment`, { comment_text: commentText });
            setCommentText('');
            fetchPost();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleFollow = async () => {
        if (!user) return Swal.fire('Please login to follow writers');
        const authorId = post.author_id || post.author?.id;
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

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            Swal.fire({
                title: 'Link Copied!',
                text: 'The story link has been preserved in your clipboard.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#141414',
                color: '#fff',
                iconColor: '#FF6719'
            });
        } catch (err) {
            console.error('Failed to copy!', err);
            Swal.fire({
                title: 'Error',
                text: 'Could not copy link to clipboard.',
                icon: 'error',
                background: '#141414',
                color: '#fff'
            });
        }
    };

    const handleReport = async () => {
        setShowMore(false);
        if (!user) return Swal.fire('Please login to report posts');

        const { value: reason } = await Swal.fire({
            title: 'Report Post',
            input: 'textarea',
            inputLabel: 'Why are you reporting this post?',
            inputPlaceholder: 'Type your reason here...',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
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
                    text: 'Thank you for your feedback.',
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

    const handleBlock = async () => {
        setShowMore(false);
        if (!user) return Swal.fire('Please login to block users');

        const result = await Swal.fire({
            title: `Block ${post?.author?.name || 'this user'}?`,
            text: "You won't see their posts in your feed anymore.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
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
                navigate('/');
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to block user', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-substack-orange"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white">Post Not Found</h2>
                <Link to="/" className="text-substack-orange hover:underline mt-4 block">Back to Home</Link>
            </div>
        );
    }

    const authorId = post.author_id || post.author?.id;

    return (
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 xl:gap-20 px-6 sm:px-10 justify-center min-h-screen pb-32 pt-10">
            <div className="flex-grow max-w-[720px]">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-all font-bold text-xs uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Feed
                </Link>

                <article className="relative">
                    <header className="mb-16">
                        {post.type === "article" && post.title && (
                            <div className="mb-12">
                                <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-[1.15] font-serif tracking-tight selection:bg-substack-orange/30">
                                    {post.title}
                                </h1>
                                {post.subtitle && (
                                    <p className="text-xl sm:text-2xl text-gray-500 font-serif italic leading-relaxed opacity-80 border-l-2 border-white/5 pl-6">
                                        {post.subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between py-10 border-y border-white/[0.05]">
                            <div className="flex items-center space-x-5">
                                <Link to={`/profile/${authorId}`} className="relative w-14 h-14 rounded-2xl bg-[#141414] flex items-center justify-center text-substack-orange border border-white/[0.05] overflow-hidden shadow-2xl group">
                                    {post.author?.avatar && post.author.avatar !== "" ? (
                                        <img
                                            src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`}
                                            alt={post.author.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <User className="w-7 h-7" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-substack-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <div>
                                    <Link to={`/profile/${authorId}`} className="font-bold text-white text-base hover:text-substack-orange transition-colors tracking-tight block">
                                        {post.author?.name}
                                    </Link>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                        <span>{new Date(post.created_at).toLocaleDateString(undefined, {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}</span>
                                        <span className="text-white/10">•</span>
                                        <span className="text-substack-orange/60">4 min read</span>
                                    </p>
                                </div>
                            </div>
                            {user?.id !== authorId && (
                                <button 
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`!text-[10px] !px-8 !py-3.5 !rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl ${isFollowing(authorId) ? 'bg-white/5 text-gray-500 border border-white/10 hover:text-white' : 'btn-substack'}`}
                                >
                                    {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFollowing(authorId) ? 'Following' : 'Follow Writer')}
                                </button>
                            )}

                            <div className="relative" ref={moreMenuRef}>
                                <button 
                                    onClick={() => setShowMore(!showMore)}
                                    className={`p-3 rounded-2xl border border-white/[0.05] text-gray-500 hover:text-white hover:bg-white/5 transition-all ${showMore ? 'bg-white/5 text-white' : ''}`}
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>

                                {showMore && (
                                    <div className="absolute right-0 mt-3 w-64 bg-[#1A1A1A] border border-white/[0.08] backdrop-blur-2xl rounded-[2rem] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={handleReport}
                                            className="w-full flex items-center gap-4 px-5 py-4 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-2xl"
                                        >
                                            <ShieldAlert className="w-5 h-5" />
                                            <span>Report Post</span>
                                        </button>
                                        {user?.id !== authorId && (
                                            <button
                                                onClick={handleBlock}
                                                className="w-full flex items-center gap-4 px-5 py-4 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-2xl"
                                            >
                                                <UserX className="w-5 h-5" />
                                                <span>Block User</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div
                        className={`quill-content mb-20 !text-gray-300 !leading-[1.85] selection:bg-substack-orange/30 ${post.type === "note" ? "whitespace-pre-wrap text-2xl italic font-serif" : "text-[20px]"}`}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.images && (
                        <div className="space-y-12 mb-24">
                            {(typeof post.images === 'string' ? JSON.parse(post.images) : post.images).map((img, index) => (
                                <div
                                    key={index}
                                    className="rounded-3xl overflow-hidden border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0A0A0A] group"
                                >
                                    {img && img !== "" && (
                                        <img
                                            src={
                                                img.startsWith("http") || img.startsWith("data:")
                                                    ? img
                                                    : `http://localhost:5000${img}`
                                            }
                                            alt={`Gallery ${index}`}
                                            className="w-full max-h-[500px] object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <footer className="pt-12 border-t border-white/[0.05]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 sm:gap-10">
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
                                                        className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-white/5 rounded-xl grayscale-[0.5] hover:grayscale-0"
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
                                        className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all group ${likeLoading ? 'opacity-50' : reaction ? 'text-substack-orange bg-substack-orange/5' : 'text-gray-500 hover:text-red-500 hover:bg-red-500/5'}`}
                                    >
                                        {reaction ? (
                                            <span className="text-xl leading-none transition-all group-active:scale-125">{reaction}</span>
                                        ) : (
                                            <Heart className="w-6 h-6 transition-all group-active:scale-125 group-hover:fill-red-500" />
                                        )}
                                        <span className="font-bold text-sm tracking-tight tabular-nums">
                                            {post.likes_count ?? post.Likes?.length ?? 0}
                                        </span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl text-gray-500 hover:text-substack-orange hover:bg-substack-orange/5 transition-all group cursor-pointer">
                                    <MessageCircle className="w-6 h-6 transition-all group-hover:fill-substack-orange/10" />
                                    <span className="font-bold text-sm tracking-tight tabular-nums">
                                        {post.comments_count ?? post.Comments?.length ?? 0}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-4 px-6 py-3 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <Share2 className="w-6 h-6 transition-all" />
                                <span className="hidden sm:inline font-bold text-sm tracking-widest uppercase">
                                    Share ({post.shares_count ?? post.Shares?.length ?? 0})
                                </span>
                            </button>
                        </div>
                    </footer>
                </article>

                <ShareModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    postId={post.id}
                    postTitle={post.title || "Check out this story"}
                    postUrl={window.location.href}
                />

                <section id="comments" className="mt-32 pt-20 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-bold text-white font-serif tracking-tight">
                            Discussion <span className="text-gray-600 font-sans text-lg ml-2">{post.Comments?.length || 0}</span>
                        </h3>
                    </div>

                    {user ? (
                        <form onSubmit={handleComment} className="mb-16">
                            <div className="relative group p-1 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2rem] shadow-2xl">
                                <textarea 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write a thoughtful response..."
                                    className="w-full bg-[#141414] border border-white/[0.05] rounded-[1.9rem] p-8 text-white font-serif italic text-lg focus:outline-none focus:border-substack-orange/30 transition-all placeholder:text-gray-700 min-h-[160px] resize-none"
                                />
                                <button 
                                    type="submit"
                                    disabled={submittingComment || !commentText.trim()}
                                    className="absolute bottom-6 right-6 p-4 bg-substack-orange rounded-2xl text-white shadow-[0_10px_30px_rgba(255,103,25,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group/send"
                                >
                                    {submittingComment ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-12 bg-[#141414]/40 backdrop-blur-xl rounded-[2.5rem] mb-16 text-center border border-white/[0.03] shadow-2xl">
                            <p className="text-gray-500 mb-8 font-serif italic text-lg leading-relaxed">
                                Join the discussion with other readers.
                            </p>
                            <Link to="/login" className="btn-substack inline-flex !px-12 !py-4 shadow-xl">
                                Sign In to Comment
                            </Link>
                        </div>
                    )}

                    <div className="space-y-12">
                        {post.Comments?.map((comment) => (
                            <div key={comment.id} className="group relative pl-0 sm:pl-8">
                                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-substack-orange/30 to-transparent hidden sm:block" />
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] border border-white/[0.05] flex items-center justify-center text-xs text-substack-orange font-bold uppercase overflow-hidden shadow-xl">
                                            {comment.user?.avatar && comment.user.avatar !== "" ? (
                                                <img src={comment.user.avatar.startsWith('http') ? comment.user.avatar : `http://localhost:5000${comment.user.avatar}`} className="w-full h-full object-cover" />
                                            ) : (
                                                comment.user?.name?.[0] || "?"
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold text-white text-[15px] tracking-tight">
                                                {comment.user?.name || "Anonymous Reader"}
                                            </span>
                                            <span className="text-gray-600 text-[10px] ml-3 font-bold uppercase tracking-widest">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-[17px] leading-relaxed font-serif italic pl-14 opacity-90 group-hover:opacity-100 transition-opacity">
                                    {comment.comment_text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sticky Sidebar Right */}
            <div className="hidden lg:block w-80 space-y-10 sticky top-10 h-fit mt-24">
                <div className="bg-[#141414]/60 backdrop-blur-2xl border border-white/[0.05] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-substack-orange/[0.03] blur-3xl -mr-16 -mt-16 group-hover:bg-substack-orange/[0.08] transition-all duration-1000" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-10 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-substack-orange shadow-[0_0_8px_rgba(255,103,25,0.6)]"></div>
                        Author Info
                    </h3>
                    <div className="flex items-center gap-5 mb-8">
                        <Link to={`/profile/${authorId}`} className="relative w-20 h-20 rounded-3xl bg-[#0A0A0A] border border-white/[0.05] flex items-center justify-center text-substack-orange shadow-inner overflow-hidden group/author">
                            {post.author?.avatar && post.author.avatar !== "" ? (
                                <img
                                    src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`}
                                    alt={post.author.name}
                                    className="w-full h-full object-cover group-hover/author:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </Link>
                        <div>
                            <Link to={`/profile/${authorId}`} className="font-bold text-white text-lg mb-1 block hover:text-substack-orange transition-colors tracking-tight">{post.author?.name}</Link>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                                Independent Writer
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-serif italic mb-10 opacity-80">
                        {post.author?.bio || "Exploring the intersection of technology, culture, and humanity."}
                    </p>
                    {user?.id !== authorId && (
                        <button 
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`w-full !rounded-2xl !py-4.5 flex items-center justify-center gap-3 shadow-xl transition-all font-bold uppercase tracking-widest text-xs ${isFollowing(authorId) ? 'bg-white/5 text-gray-500 border border-white/10 hover:text-white' : 'btn-substack'}`}
                        >
                            {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFollowing(authorId) ? 'Following' : <><UserPlus className="w-4 h-4" /> Follow Writer</>)}
                        </button>
                    )}
                </div>

                <div className="p-10 bg-[#141414]/20 border border-white/[0.03] rounded-[2.5rem] text-center">
                    <TrendingUp className="w-8 h-8 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest italic leading-relaxed">
                        Join 2,400+ readers who receive exclusive updates from {post.author?.name}.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PostDetails;
