import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, Hash, MessageSquare, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Chat = () => {
    const { user, fetchUnreadCount } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const userIdFromUrl = searchParams.get('user');

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
            const interval = setInterval(() => {
                fetchMessages(selectedChat.id, true);
            }, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChats = async () => {
        try {
            const res = await api.get('/messages/chats');
            const chatList = res.data;
            setChats(chatList);
            
            // If user ID provided in URL, try to select that chat
            if (userIdFromUrl && !selectedChat) {
                const existingChat = chatList.find(c => c.id === Number(userIdFromUrl));
                if (existingChat) {
                    setSelectedChat(existingChat);
                } else {
                    // Fetch user info for a new chat
                    try {
                        const userRes = await api.get(`/auth/user/${userIdFromUrl}`);
                        setSelectedChat(userRes.data);
                        // Add to temp chat list if not already there
                        if (!chatList.find(c => c.id === Number(userIdFromUrl))) {
                            setChats([...chatList, userRes.data]);
                        }
                    } catch (err) {
                        console.error('Failed to fetch user for new chat', err);
                    }
                }
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchMessages = async (userId, silent = false) => {
        try {
            const res = await api.get(`/messages/${userId}`);
            // Only update state if message count changed to avoid flickering
            if (res.data.length !== messages.length) {
                setMessages(res.data);
                fetchUnreadCount();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || sending) return;

        setSending(true);
        try {
            const res = await api.post('/messages', {
                receiver_id: selectedChat.id,
                message_text: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            // If this was a new chat, refresh chat list
            if (!chats.find(c => c.id === selectedChat.id)) {
                fetchChats();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                    <MessageSquare className="w-10 h-10 text-substack-orange" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-6 font-serif tracking-tight">Voices of Modern Blog</h1>
                <p className="text-gray-500 font-serif italic text-lg max-w-md mb-8">
                    Sign in to participate in the conversation and connect with our global community.
                </p>
                <Link to="/login" className="btn-substack !px-12 !py-4 shadow-orange-500/10">Sign In to Chat</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto min-h-[85vh] flex gap-6 px-4 sm:px-10 py-8">
            {/* Sidebar: Chat List */}
            <div className={`w-full lg:w-80 flex-col bg-[#141414]/60 backdrop-blur-2xl border border-white/[0.05] rounded-[2.5rem] overflow-hidden shadow-2xl ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-8 border-b border-white/[0.05]">
                    <h2 className="text-xl font-bold text-white font-serif tracking-tight mb-6">Messages</h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-substack-orange transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search chats..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-substack-orange/30 transition-all placeholder:text-gray-700"
                        />
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-6 h-6 text-substack-orange animate-spin" />
                        </div>
                    ) : chats.length > 0 ? (
                        chats.map(chat => (
                            <button 
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${selectedChat?.id === chat.id ? 'bg-substack-orange/10 border border-substack-orange/20' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-[#1F1F1F] border border-white/[0.05] overflow-hidden shadow-lg">
                                    {chat.avatar && chat.avatar !== "" ? (
                                        <img src={chat.avatar.startsWith('http') ? chat.avatar : `http://localhost:5000${chat.avatar}`} alt={chat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-substack-orange font-bold text-sm bg-gradient-to-br from-white/5 to-transparent">
                                            {chat.name[0]}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full" />
                                </div>
                                <div className="flex-grow text-left">
                                    <h3 className={`font-bold text-[15px] tracking-tight ${selectedChat?.id === chat.id ? 'text-substack-orange' : 'text-white'}`}>{chat.name}</h3>
                                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">Writer</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-12 px-6">
                            <p className="text-gray-600 text-sm font-serif italic">No conversations yet. Start a chat from a writer's profile!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className={`flex-grow flex flex-col bg-[#141414]/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] overflow-hidden shadow-2xl relative ${!selectedChat ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/[0.05]">
                            <div className="flex items-center gap-5">
                                <button 
                                    onClick={() => setSelectedChat(null)}
                                    className="lg:hidden p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                                >
                                    <User className="rotate-180 w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-white/[0.05] overflow-hidden shadow-xl">
                                        {selectedChat.avatar && selectedChat.avatar !== "" ? (
                                            <img src={selectedChat.avatar.startsWith('http') ? selectedChat.avatar : `http://localhost:5000${selectedChat.avatar}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-substack-orange font-bold bg-white/5">
                                                {selectedChat.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white tracking-tight">{selectedChat.name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-8 selection:bg-substack-orange/20">
                            {messages.map((msg, idx) => (
                                <div 
                                    key={msg.id || idx}
                                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                                >
                                    <div className={`max-w-[85%] sm:max-w-[70%] space-y-2 ${msg.sender_id === user.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-6 py-4 rounded-[2rem] shadow-xl text-[15px] sm:text-base leading-relaxed ${
                                            msg.sender_id === user.id 
                                            ? 'bg-substack-orange text-white rounded-br-none' 
                                            : 'bg-white/5 border border-white/[0.05] text-gray-300 rounded-bl-none'
                                        }`}>
                                            {msg.message_text}
                                        </div>
                                        <div className={`flex items-center gap-2 px-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.sender_id === user.id && (
                                                <span className={`w-1 h-1 rounded-full ${msg.is_read ? 'bg-green-500' : 'bg-gray-700'}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-6 sm:p-8 bg-[#0A0A0A]/40 border-t border-white/[0.05]">
                            <div className="relative flex items-center gap-4 bg-white/5 border border-white/[0.05] rounded-[2rem] p-2 focus-within:border-substack-orange/30 transition-all group shadow-2xl">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-grow bg-transparent border-none focus:outline-none px-6 py-3 text-white placeholder:text-gray-700 font-serif italic"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-12 h-12 bg-substack-orange text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group/send"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center p-12 space-y-10 group">
                        <div className="w-24 h-24 bg-gradient-to-br from-substack-orange/10 to-transparent rounded-[2.5rem] flex items-center justify-center mx-auto border border-substack-orange/10 shadow-3xl group-hover:scale-110 transition-transform duration-1000">
                            <Hash className="w-10 h-10 text-substack-orange group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white font-serif tracking-tight">The Modern Salon</h2>
                            <p className="text-gray-600 font-serif italic text-lg max-w-sm mx-auto leading-relaxed">
                                Select an author from the sidebar to start a real-time intellectual exchange.
                            </p>
                        </div>
                        <div className="pt-10 flex justify-center gap-8 opacity-40">
                           <div className="w-2 h-2 rounded-full bg-substack-orange animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-substack-orange animate-bounce delay-100" />
                           <div className="w-2 h-2 rounded-full bg-substack-orange animate-bounce delay-200" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
