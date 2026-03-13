import React, { useState } from 'react';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FollowModal = ({ isOpen, onClose, authorId, authorName }) => {
    const { user, follow } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    if (!isOpen) return null;

    const handleFollow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setStatus('loading');
        try {
            await follow(authorId);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1C1C1C] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-substack-orange mx-auto mb-4" />
                        <h2 className="text-2xl font-bold font-serif mb-2 text-white">Following {authorName}!</h2>
                        <p className="text-gray-500 font-serif italic">You'll see more from this author in your feed.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold font-serif mb-3 tracking-tight text-white">Follow {authorName}</h2>
                            <p className="text-gray-400 font-serif italic leading-relaxed">
                                Join our community and stay updated with stories that matter.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handleFollow}
                                disabled={status === 'loading'}
                                className="btn-substack w-full !py-4 !rounded-xl text-sm tracking-widest uppercase font-bold flex items-center justify-center space-x-2"
                            >
                                {status === 'loading' ? (
                                    <span>Following...</span>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Follow this writer</span>
                                    </>
                                )}
                            </button>
                            {status === 'error' && (
                                <p className="text-red-500 text-[10px] text-center font-bold tracking-widest uppercase mt-4">
                                    Something went wrong. Try again.
                                </p>
                            )}
                        </div>
                        <p className="mt-8 text-[11px] text-gray-600 text-center uppercase tracking-widest font-bold leading-relaxed">
                            Support independent writers.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FollowModal;
