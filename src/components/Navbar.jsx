import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, PenTool } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 font-sans">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-2xl font-bold text-black tracking-tight font-serif italic">
                            The Modern Stack
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/create-blog" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Write</Link>
                                <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Dashboard</Link>
                                <div className="relative group">
                                    <button className="flex items-center text-gray-900 hover:text-substack-orange font-bold text-xs uppercase tracking-widest">
                                        {user.name}
                                    </button>
                                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-sm shadow-xl border border-gray-100 hidden group-hover:block transition-all">
                                        <Link 
                                            to="/profile" 
                                            className="w-full block px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-6">
                                <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Sign In</Link>
                                <Link to="/register" className="btn-substack">Follow</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
