import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Shield, ShieldAlert, Trash2, FileText, Eye,
    Loader2, ArrowLeft, Heart, MessageCircle, Edit2, Check, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const TABS = ['Users', 'Posts', 'Comments', 'Likes', 'Moderation', 'Activity'];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Users');
    const [stats, setStats] = useState(null);
    const [data, setData] = useState({ Users: [], Posts: [], Comments: [], Likes: [], Moderation: [], Activity: [] });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [editingComment, setEditingComment] = useState(null); // { id, text }

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, postsRes, commentsRes, likesRes, reportsRes, activityRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/posts'),
                api.get('/admin/comments'),
                api.get('/admin/likes'),
                api.get('/admin/reports'),
                api.get('/admin/activity'),
            ]);
            setStats(statsRes.data);
            setData({
                Users: usersRes.data,
                Posts: postsRes.data,
                Comments: commentsRes.data,
                Likes: likesRes.data,
                Moderation: reportsRes.data,
                Activity: activityRes.data,
            });
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const confirmAction = (title, text) =>
        Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff672d', cancelButtonColor: '#1C1C1C', confirmButtonText: 'Confirm' });

    const toast = (title, icon = 'success') =>
        Swal.fire({ title, icon, toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });

    // ---- User Actions ----
    const handleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        setActionLoading(userId + '-status');
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            setData(d => ({ ...d, Users: d.Users.map(u => u.id === userId ? { ...u, status: newStatus } : u) }));
            toast(`User ${newStatus}`);
        } catch { toast('Action failed', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleDeleteUser = async (userId) => {
        const res = await confirmAction('Delete User?', 'This will permanently delete the user and all their posts.');
        if (!res.isConfirmed) return;
        setActionLoading(userId + '-del');
        try {
            await api.delete(`/admin/users/${userId}`);
            setData(d => ({ ...d, Users: d.Users.filter(u => u.id !== userId) }));
            toast('User deleted');
        } catch { toast('Delete failed', 'error'); }
        finally { setActionLoading(null); }
    };

    // ---- Post Actions ----
    const handleDeletePost = async (postId) => {
        const res = await confirmAction('Delete Post?', 'This action cannot be undone.');
        if (!res.isConfirmed) return;
        setActionLoading(postId + '-post');
        try {
            await api.delete(`/admin/posts/${postId}`);
            setData(d => ({ ...d, Posts: d.Posts.filter(p => p.id !== postId) }));
            toast('Post deleted');
        } catch { toast('Delete failed', 'error'); }
        finally { setActionLoading(null); }
    };

    // ---- Comment Actions ----
    const handleSaveComment = async (commentId) => {
        setActionLoading(commentId + '-comment');
        try {
            await api.put(`/admin/comments/${commentId}`, { comment_text: editingComment.text });
            setData(d => ({ ...d, Comments: d.Comments.map(c => c.id === commentId ? { ...c, comment_text: editingComment.text } : c) }));
            setEditingComment(null);
            toast('Comment updated');
        } catch { toast('Update failed', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleDeleteComment = async (commentId) => {
        const res = await confirmAction('Delete Comment?', 'This will permanently remove this comment.');
        if (!res.isConfirmed) return;
        setActionLoading(commentId + '-comment-del');
        try {
            await api.delete(`/admin/comments/${commentId}`);
            setData(d => ({ ...d, Comments: d.Comments.filter(c => c.id !== commentId) }));
            toast('Comment deleted');
        } catch { toast('Delete failed', 'error'); }
        finally { setActionLoading(null); }
    };

    // ---- Like Actions ----
    const handleDeleteLike = async (likeId) => {
        const res = await confirmAction('Remove Like?', 'This will permanently remove this like.');
        if (!res.isConfirmed) return;
        setActionLoading(likeId + '-like');
        try {
            await api.delete(`/admin/likes/${likeId}`);
            setData(d => ({ ...d, Likes: d.Likes.filter(l => l.id !== likeId) }));
            toast('Like removed');
        } catch { toast('Remove failed', 'error'); }
        finally { setActionLoading(null); }
    };

    // ---- Report Actions ----
    const handleDeleteReport = async (reportId) => {
        setActionLoading(reportId + '-report');
        try {
            await api.delete(`/admin/reports/${reportId}`);
            setData(d => ({ ...d, Moderation: d.Moderation.filter(r => r.id !== reportId) }));
            toast('Report dismissed');
        } catch { toast('Action failed', 'error'); }
        finally { setActionLoading(null); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 text-substack-orange animate-spin" />
        </div>
    );

    const statCards = stats ? [
        { label: 'Users', value: stats.users, icon: Users, color: 'text-blue-400' },
        { label: 'Posts', value: stats.posts, icon: FileText, color: 'text-substack-orange' },
        { label: 'Comments', value: stats.comments, icon: MessageCircle, color: 'text-yellow-400' },
        { label: 'Reports', value: stats.reports, icon: ShieldAlert, color: 'text-rose-400' },
        { label: 'Views', value: Number(stats.total_views).toLocaleString(), icon: Eye, color: 'text-emerald-400' },
    ] : [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <header className="mb-10 flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif italic">Admin Panel</h1>
                    <p className="text-gray-500 text-sm font-serif italic">Manage your platform content and users.</p>
                </div>
                <button onClick={fetchAll} className="ml-auto px-5 py-2 rounded-xl border border-white/5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all">
                    Refresh
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-[#1C1C1C] border border-white/5 p-5 rounded-2xl shadow-lg">
                        <div className={`mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">{s.label}</p>
                        <h3 className="text-2xl font-bold text-white tabular-nums">{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/5 mb-8">
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-substack-orange' : 'text-gray-500 hover:text-white'}`}>
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-substack-orange" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-[#1C1C1C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {/* USERS TAB */}
                {activeTab === 'Users' && (
                    <table className="w-full text-left">
                        <thead><tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {data.Users.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#242424] border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center text-substack-orange">
                                                {u.avatar ? <img src={u.avatar.startsWith('http') ? u.avatar : `http://localhost:5000${u.avatar}`} className="w-full h-full object-cover" /> : <Users className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />{u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {u.role !== 'admin' && (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleUserStatus(u.id, u.status)} disabled={!!actionLoading}
                                                    className={`p-2 rounded-lg transition-all ${u.status === 'active' ? 'text-gray-500 hover:text-rose-400 hover:bg-rose-400/10' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10'}`}
                                                    title={u.status === 'active' ? 'Ban' : 'Unban'}>
                                                    {actionLoading === u.id + '-status' ? <Loader2 className="w-4 h-4 animate-spin" /> : (u.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />)}
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} disabled={!!actionLoading}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Delete">
                                                    {actionLoading === u.id + '-del' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* POSTS TAB */}
                {activeTab === 'Posts' && (
                    <table className="w-full text-left">
                        <thead><tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Post</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Author</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Stats</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {data.Posts.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <Link to={`/post/${p.slug}`} className="text-sm font-bold text-white hover:text-substack-orange transition-colors line-clamp-1">
                                            {p.title || <span className="italic text-gray-500">Note</span>}
                                        </Link>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${p.type === 'article' ? 'text-substack-orange bg-substack-orange/10' : 'text-gray-400 bg-white/5'}`}>{p.type}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-400">{p.author_name}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views}</span>
                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes_count}</span>
                                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {p.comments_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeletePost(p.id)} disabled={!!actionLoading}
                                                className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                {actionLoading === p.id + '-post' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* COMMENTS TAB */}
                {activeTab === 'Comments' && (
                    <table className="w-full text-left">
                        <thead><tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Comment</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">By</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">On Post</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {data.Comments.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5 max-w-xs">
                                        {editingComment?.id === c.id ? (
                                            <input
                                                value={editingComment.text}
                                                onChange={e => setEditingComment(ec => ({ ...ec, text: e.target.value }))}
                                                className="w-full bg-[#242424] border border-substack-orange/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-300 line-clamp-2 font-serif italic">{c.comment_text}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-400 whitespace-nowrap">{c.user_name}</td>
                                    <td className="px-6 py-5">
                                        <Link to={`/post/${c.post_id}`} className="text-xs text-gray-500 hover:text-substack-orange transition-colors line-clamp-1">{c.post_title}</Link>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingComment?.id === c.id ? (
                                                <>
                                                    <button onClick={() => handleSaveComment(c.id)} disabled={!!actionLoading}
                                                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">
                                                        {actionLoading === c.id + '-comment' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => setEditingComment(null)}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setEditingComment({ id: c.id, text: c.comment_text })}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteComment(c.id)} disabled={!!actionLoading}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                        {actionLoading === c.id + '-comment-del' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* LIKES TAB */}
                {activeTab === 'Likes' && (
                    <table className="w-full text-left">
                        <thead><tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Liked Post</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {data.Likes.map(l => (
                                <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5 text-sm font-bold text-white">{l.user_name}</td>
                                    <td className="px-6 py-5">
                                        <Link to={`/post/${l.post_id}`} className="text-sm text-gray-400 hover:text-substack-orange transition-colors line-clamp-1">{l.post_title}</Link>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteLike(l.id)} disabled={!!actionLoading}
                                                className="p-2 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                                {actionLoading === l.id + '-like' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* MODERATION TAB */}
                {activeTab === 'Moderation' && (
                    <table className="w-full text-left">
                        <thead><tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Report Reason</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Post</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Reporter</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {data.Moderation.map(r => (
                                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-gray-300 font-serif italic line-clamp-2">{r.reason}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Link to={`/post/${r.slug}`} className="text-sm text-gray-400 hover:text-substack-orange transition-colors font-bold line-clamp-1">{r.post_title}</Link>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-gray-500">{r.reporter_name}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeletePost(r.post_id)} title="Delete Reported Post"
                                                className="p-2 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-all">
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteReport(r.id)} disabled={!!actionLoading} title="Dismiss Report"
                                                className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all">
                                                {actionLoading === r.id + '-report' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === 'Activity' && (
                    <div className="p-6">
                        <div className="space-y-4">
                            {data.Activity.map((a, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className={`mt-1 p-2 rounded-xl ${
                                        a.type === 'post' ? 'bg-substack-orange/10 text-substack-orange' :
                                        a.type === 'comment' ? 'bg-blue-400/10 text-blue-400' :
                                        a.type === 'like' ? 'bg-rose-400/10 text-rose-400' :
                                        'bg-purple-400/10 text-purple-400'
                                    }`}>
                                        {a.type === 'post' ? <FileText className="w-4 h-4" /> :
                                         a.type === 'comment' ? <MessageCircle className="w-4 h-4" /> :
                                         a.type === 'like' ? <Heart className="w-4 h-4" /> :
                                         <ShieldAlert className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">{a.type}</span>
                                            <span className="text-[10px] text-gray-600 font-bold">{new Date(a.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            <span className="text-white font-bold">{a.user_name}</span>
                                            {a.type === 'post' && ` published a new story: `}
                                            {a.type === 'comment' && ` commented on a post: `}
                                            {a.type === 'like' && ` liked `}
                                            {a.type === 'report' && ` reported `}
                                            
                                            {a.type === 'post' && <Link to={`/post/${a.slug}`} className="text-substack-orange hover:underline">"{a.title}"</Link>}
                                            {a.post_title && <Link to={`/post/${a.slug || a.post_id}`} className="text-substack-orange hover:underline">"{a.post_title}"</Link>}
                                        </p>
                                        {a.content && <p className="mt-2 text-xs text-gray-500 font-serif italic border-l border-white/10 pl-3">"{a.content}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
