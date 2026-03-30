import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Home, ArrowRight,
    Users, 
    MessageSquare, 
    Bell, 
    Compass, 
    User, 
    PlusCircle,
    Layout,
    LogOut,
    Search,
    Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout, following, unreadCount } = useAuth();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Compass, label: 'Explore', path: '/explore' },
        { icon: Bell, label: 'Activity', path: '/activity' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
        { icon: User, label: 'Profile', path: user ? `/profile/${user.id}` : '/login' },
    ];
    
    if (user && user.role === 'admin') {
        menuItems.push({ icon: Shield, label: 'Admin Panel', path: '/admin' });
    }

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`w-72 bg-[#0A0A0A] min-h-screen flex flex-col border-r border-white/[0.05] fixed left-0 top-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
            }`}>
            <div className="p-8">
                <Link to="/" className="flex items-center gap-3 mb-8 group">
                    <div className="w-10 h-10 bg-substack-orange rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,103,25,0.3)] group-hover:scale-110 transition-transform duration-500">
                        <Layout className="text-white w-6 h-6 fill-current" />
                    </div>
                    <span className="text-2xl font-bold font-serif text-white tracking-tight">Substack</span>
                </Link>

                <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={() => {
                                    if (window.innerWidth < 1280 && onClose) onClose();
                                }}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                                    isActive 
                                    ? 'bg-white/[0.05] text-white font-bold shadow-inner' 
                                    : 'text-gray-500 hover:bg-white/[0.03] hover:text-white'
                                }`}
                            >
                                <div className={`relative flex items-center justify-center ${isActive ? 'text-substack-orange' : 'text-current'}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    {isActive && <div className="absolute -left-4 w-1 h-5 bg-substack-orange rounded-r-full shadow-[0_0_10px_rgba(255,103,25,0.5)]" />}
                                    {item.label === 'Chat' && !isActive && unreadCount > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0A0A0A] px-1 animate-in zoom-in duration-300">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-sans tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {user && following.length > 0 && (
                    <div className="pt-10 mt-8 border-t border-white/[0.05]">
                        <Link to="/following" className="flex items-center justify-between px-4 group/head mb-6">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover/head:text-substack-orange transition-colors">Following</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover/head:translate-x-1 group-hover/head:text-substack-orange transition-all" />
                        </Link>
                        <div className="space-y-2">
                            {following.slice(0, 6).map((follow) => (
                                <Link
                                    key={follow.author?.id}
                                    to={`/profile/${follow.author?.id}`}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-gray-500 hover:bg-white/[0.03] hover:text-white transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#141414] border border-white/[0.05] flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-substack-orange/30 transition-colors">
                                        {follow.author?.avatar ? (
                                            <img src={follow.author.avatar.startsWith('http') ? follow.author.avatar : `http://localhost:5000${follow.author.avatar}`} alt={follow.author.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-3.5 h-3.5 text-substack-orange" />
                                        )}
                                    </div>
                                    <span className="text-xs font-sans truncate">{follow.author?.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto p-8 space-y-4">
                {user && (
                    <div className="space-y-3">
                        <Link 
                            to="/create-blog"
                            className="btn-substack w-full !py-3 shadow-lg"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>New Post</span>
                        </Link>
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-red-500/5 hover:text-red-400 transition-all font-bold text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
                
                {!user && (
                    <Link 
                        to="/login"
                        className="btn-substack w-full !py-3"
                    >
                        <span>Get Started</span>
                    </Link>
                )}
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
