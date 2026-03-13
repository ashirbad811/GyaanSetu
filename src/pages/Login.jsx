import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: '#1C1C1C',
                color: '#fff'
            });
            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.response?.data?.message || 'Please check your credentials',
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
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-substack-orange/10 blur-[120px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-substack-orange/5 blur-[100px] rounded-full animate-pulse-slow delay-700" />

            <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-[#141414]/60 backdrop-blur-2xl border border-white/[0.05] p-10 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-substack-orange/[0.02] to-transparent pointer-events-none" />

                    <div className="text-center mb-10 relative">
                        <div className="w-20 h-20 bg-substack-orange/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-substack-orange/20 group-hover:scale-110 transition-transform duration-700">
                            <Layout className="text-white w-10 h-10 fill-current" />
                        </div>
                        <h1 className="text-4xl font-bold text-white font-serif tracking-tight mb-3">Welcome Back</h1>
                        <p className="text-gray-500 font-serif italic text-lg leading-relaxed">Enter the realm of thought.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
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
                            <div className="flex justify-between items-center ml-4 mr-1">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Security Key</label>
                                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-substack-orange/60 hover:text-substack-orange transition-colors">Forgot?</button>
                            </div>
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
                            className="btn-substack w-full !py-5 !rounded-2xl transition-all flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:shadow-orange-500/20 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Portal <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="text-center mt-10 relative pt-8 border-t border-white/[0.03]">
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                            New here?{' '}
                            <Link to="/register" className="text-substack-orange hover:text-orange-400 transition-colors underline-offset-8 hover:underline ml-1">
                                Create an Identity
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
