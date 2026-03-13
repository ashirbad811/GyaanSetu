import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Layout, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(name, email, password);
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                text: 'Welcome to The Modern Stack.',
                background: '#1C1C1C',
                color: '#fff',
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: err.response?.data?.message || 'Something went wrong',
                background: '#1C1C1C',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-substack-orange/10 blur-[120px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-substack-orange/5 blur-[100px] rounded-full animate-pulse-slow delay-700" />

            <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-[#141414]/60 backdrop-blur-2xl border border-white/[0.05] p-10 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-substack-orange/[0.02] to-transparent pointer-events-none" />

                    <div className="text-center mb-10 relative">
                        <div className="w-20 h-20 bg-substack-orange/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-substack-orange/20 group-hover:scale-110 transition-transform duration-700">
                            <UserPlus className="w-10 h-10 text-substack-orange" />
                        </div>
                        <h1 className="text-4xl font-bold text-white font-serif tracking-tight mb-3">Join the Fold</h1>
                        <p className="text-gray-500 font-serif italic text-lg leading-relaxed">Begin your narrative journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-4">Full Identity</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#1A1A1A]/50 border border-white/[0.05] rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-substack-orange/40 focus:bg-[#1A1A1A] transition-all font-sans shadow-inner placeholder:text-gray-700"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-4">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1A1A1A]/50 border border-white/[0.05] rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-substack-orange/40 focus:bg-[#1A1A1A] transition-all font-sans shadow-inner placeholder:text-gray-700"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-4">Security Key</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A]/50 border border-white/[0.05] rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-substack-orange/40 focus:bg-[#1A1A1A] transition-all font-sans shadow-inner placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-substack !py-4 !rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="font-bold uppercase tracking-widest text-xs">Register</span>
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-xs font-serif italic">
                            Already have an account? <Link to="/login" className="text-substack-orange hover:underline font-bold not-italic ml-1">Sign in instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
