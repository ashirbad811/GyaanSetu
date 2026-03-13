import React from 'react';
import { X, MessageCircle, Facebook, Link2, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

const ShareModal = ({ isOpen, onClose, postUrl, postId, postTitle }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopied(true);
            await trackShare('copy_link');
            setTimeout(() => setCopied(false), 2000);
            
            Swal.fire({
                title: 'Link Copied!',
                text: 'The story link is ready to share.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#141414',
                color: '#fff',
                iconColor: '#FF6719'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const trackShare = async (platform) => {
        try {
            await api.post(`/posts/${postId}/share`, { platform });
        } catch (err) {
            console.error('Error tracking share:', err);
        }
    };

    const sharePlatforms = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'bg-[#25D366]',
            hoverColor: 'hover:bg-[#20ba59]',
            action: async () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(postTitle + ' ' + postUrl)}`, '_blank');
                await trackShare('whatsapp');
            }
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6" />,
            color: 'bg-[#1877F2]',
            hoverColor: 'hover:bg-[#166fe5]',
            action: async () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
                await trackShare('facebook');
            }
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#141414] border border-white/[0.08] rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-substack-orange/[0.05] blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-substack-orange/[0.05] blur-3xl -ml-16 -mb-16" />

                <div className="flex items-center justify-between mb-8 relative">
                    <h2 className="text-2xl font-bold text-white font-serif tracking-tight">Share this story</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 relative">
                    {sharePlatforms.map((platform) => (
                        <button
                            key={platform.name}
                            onClick={platform.action}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl ${platform.color} ${platform.hoverColor} text-white font-bold transition-all shadow-lg active:scale-[0.98]`}
                        >
                            <div className="p-2 bg-white/10 rounded-xl">
                                {platform.icon}
                            </div>
                            <span className="flex-grow text-left">Share on {platform.name}</span>
                        </button>
                    ))}

                    <div className="pt-4 border-t border-white/[0.05]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 ml-1">Copy Permalink</p>
                        <div className="flex items-stretch gap-2 bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-2 pl-4">
                            <input 
                                type="text" 
                                readOnly 
                                value={postUrl}
                                className="bg-transparent border-none outline-none text-gray-400 font-mono text-sm flex-grow min-w-0"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${copied ? 'bg-green-500/10 text-green-500' : 'bg-substack-orange text-white hover:bg-substack-orange/90'}`}
                            >
                                {copied ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Copied</>
                                ) : (
                                    <><Link2 className="w-4 h-4" /> Copy</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.25em]">
                    Spread the word • Connect the dots
                </p>
            </div>
        </div>
    );
};

export default ShareModal;
