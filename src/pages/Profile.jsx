import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, Mail, FileText, TrendingUp, UserPlus, Loader2, Share2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import ShareModal from '../components/ShareModal';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, isFollowing, follow, unfollow } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('stories'); // 'stories' or 'edit'

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState(null); // base64 string
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [userRes, postsRes] = await Promise.all([
                    api.get(`/auth/user/${id}`),
                    api.get(`/posts?author=${id}`)
                ]);
                setProfileUser(userRes.data);
                setPosts(postsRes.data.posts || []);
                
                // Initialize edit form
                setEditName(userRes.data.name);
                setEditBio(userRes.data.bio || '');
                setAvatarPreview(userRes.data.avatar);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [id]);

    const following = isFollowing(id);
    const isOwnProfile = currentUser?.id && id && Number(currentUser.id) === Number(id);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (following) {
                await unfollow(id);
            } else {
                await follow(id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatar(reader.result);
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', {
                name: editName,
                bio: editBio,
                avatar: editAvatar || undefined
            });
            setProfileUser(res.data.user);
            setActiveTab('about');
            // Show success message
            api.get(`/auth/user/${id}`).then(res => setProfileUser(res.data));
        } catch (err) {
            console.error('Error updating profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-substack-orange animate-spin" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white font-serif italic">User Not Found</h2>
                <Link to="/" className="text-substack-orange hover:underline mt-4 block">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto min-h-screen p-6 sm:p-10 pb-32">
            {/* Profile Header */}
            <div className="relative mb-16 group/header">
                <div className="absolute inset-0 bg-gradient-to-r from-substack-orange/10 via-transparent to-substack-orange/5 blur-[120px] rounded-full opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-10 p-12 bg-[#141414]/40 backdrop-blur-2xl border border-white/[0.03] rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-substack-orange/[0.02] blur-3xl -mr-32 -mt-32" />
                    
                    <div className="relative group/avatar">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-[#1F1F1F] to-[#0A0A0A] flex items-center justify-center text-substack-orange border border-white/[0.05] overflow-hidden shadow-2xl transition-transform duration-700 group-hover/avatar:scale-[1.02]">
                            {profileUser?.avatar && profileUser.avatar !== "" ? (
                                <img
                                    src={profileUser.avatar.startsWith('http') ? profileUser.avatar : `http://localhost:5000${profileUser.avatar}`}
                                    alt={profileUser.name}
                                    className="w-full h-full object-cover opacity-90 group-hover/avatar:opacity-100 transition-opacity"
                                />
                            ) : (
                                <User className="w-16 h-16 opacity-40" />
                            )}
                        </div>
                        {isOwnProfile && (
                            <button onClick={() => setActiveTab('edit')} className="absolute -bottom-2 -right-2 p-3.5 bg-substack-orange rounded-2xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all border border-orange-400/20 group/edit">
                                <UserPlus className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                            </button>
                        )}
                    </div>

                    <div className="flex-grow text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif tracking-tight">{profileUser?.name}</h1>
                            <div className="flex items-center justify-center gap-3">
                                {profileUser?.is_admin && (
                                    <span className="bg-substack-orange/10 text-substack-orange px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-substack-orange/20">Admin</span>
                                )}
                                <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/[0.03]">Curator</span>
                            </div>
                        </div>
                        <p className="text-gray-500 font-serif italic text-lg max-w-xl leading-relaxed">
                            {profileUser?.bio || "Crafting thoughts at the intersection of bits and bytes."}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-8 pt-4">
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{posts.length}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-1">Stories</div>
                            </div>
                            <div className="w-[1px] h-10 bg-white/[0.05]" />
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{profileUser.followers_count || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-1">Followers</div>
                            </div>
                            <div className="w-[1px] h-10 bg-white/[0.05]" />
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{profileUser.following_count || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-1">Following</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        {!isOwnProfile && currentUser && (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`!w-full md:!w-48 !py-4.5 !rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl ${following ? 'bg-white/5 text-gray-500 border border-white/10 hover:text-white' : 'btn-substack'}`}
                            >
                                {followLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (following ? 'Following' : 'Follow Writer')}
                            </button>
                        )}
                        <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className="flex items-center justify-center gap-3 px-8 py-4.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl border border-white/[0.03] transition-all font-bold uppercase tracking-widest text-[10px]"
                        >
                            <Share2 className="w-4 h-4" /> Share Profile
                        </button>
                        {currentUser && !isOwnProfile && (
                            <Link 
                                to={`/chat?user=${id}`}
                                className="flex items-center justify-center gap-3 px-8 py-4.5 bg-substack-orange/10 hover:bg-substack-orange/20 text-substack-orange rounded-2xl border border-substack-orange/20 transition-all font-bold uppercase tracking-widest text-[10px]"
                            >
                                <MessageSquare className="w-4 h-4" /> Message
                            </Link>
                        )}
                    </div>
                </div>

                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    postId={null}
                    postTitle={`Check out ${profileUser?.name}'s profile on Modern Blog`}
                    postUrl={window.location.href}
                />
            </div>

            {/* Content Tabs */}
            <div className="space-y-12">
                <div className="flex items-center justify-center md:justify-start gap-1 sm:gap-4 p-2 bg-[#141414]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] w-fit mx-auto md:mx-0 shadow-2xl">
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'stories' ? 'bg-substack-orange text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'about' ? 'bg-substack-orange text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        About
                    </button>
                </div>

                <div className="mt-12">
                    {activeTab === 'stories' && (
                        <div className="grid gap-10">
                            {posts.map((post, idx) => (
                                <div key={post.id} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                    <BlogCard post={post} />
                                </div>
                            ))}
                            {posts.length === 0 && (
                                <div className="text-center py-32 bg-[#141414]/40 backdrop-blur-xl rounded-[3rem] border border-white/[0.03] shadow-2xl">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <TrendingUp className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-serif">No stories yet</h3>
                                    <p className="text-gray-500 font-serif italic text-lg leading-relaxed">The cursor is waiting for its first spark.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-2 space-y-10">
                                <div className="bg-[#141414]/40 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] p-12 shadow-2xl">
                                    <h3 className="text-2xl font-bold text-white mb-8 font-serif tracking-tight">Biography</h3>
                                    <p className="text-gray-400 text-lg leading-relaxed font-serif italic selection:bg-substack-orange/30">
                                        {profileUser?.bio || "This writer hasn't added a bio yet. They prefer to let their stories speak for themselves."}
                                    </p>
                                </div>
                                {isOwnProfile && (
                                    <div className="bg-[#141414]/40 backdrop-blur-xl border border-white/[0.03] rounded-[3rem] p-12 shadow-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-10 font-serif tracking-tight">Account Settings</h3>
                                        <form onSubmit={handleSaveProfile} className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-2xl p-5 text-white focus:outline-none focus:border-substack-orange/40 focus:bg-[#202020] transition-all font-sans shadow-inner"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Aura / Biography</label>
                                                <textarea
                                                    value={editBio}
                                                    onChange={(e) => setEditBio(e.target.value)}
                                                    className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-2xl p-6 text-white focus:outline-none focus:border-substack-orange/40 focus:bg-[#202020] transition-all font-serif italic text-lg leading-relaxed min-h-[160px] resize-none shadow-inner"
                                                    placeholder="What's your story?"
                                                />
                                            </div>
                                            <button type="submit" disabled={saving} className="btn-substack w-full !py-5 shadow-2xl mt-4">
                                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Preserve Changes'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-10">
                                <div className="bg-[#141414]/40 backdrop-blur-xl border border-white/[0.03] rounded-[2.5rem] p-10 shadow-2xl">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-8">Metadata</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Joined</span>
                                            <span className="text-white font-bold text-sm">{new Date(profileUser?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Aura</span>
                                            <span className="text-substack-orange font-bold text-sm">Visionary</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
