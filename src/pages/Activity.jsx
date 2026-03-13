import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await api.get('/activity');
                setActivities(res.data || []);
            } catch (err) {
                console.error('Error fetching activity:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-substack-orange animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[640px] mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-substack-orange/10 rounded-2xl flex items-center justify-center border border-substack-orange/20">
                    <Bell className="w-6 h-6 text-substack-orange" />
                </div>
                <h1 className="text-3xl font-bold text-white font-serif italic">Activity</h1>
            </div>

            <div className="space-y-4">
                {activities.length > 0 ? (
                    activities.map((act, idx) => (
                        <div key={idx} className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 flex items-start gap-4 hover:bg-[#222222] transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-[#242424] flex items-center justify-center overflow-hidden border border-white/5 flex-shrink-0">
                                {act.actor_avatar ? (
                                    <img src={act.actor_avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-substack-orange uppercase font-bold text-xs">{act.actor_name[0]}</div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    {act.type === 'like' && <Heart className="w-3 h-3 text-red-500 fill-red-500" />}
                                    {act.type === 'comment' && <MessageCircle className="w-3 h-3 text-substack-orange" />}
                                    {act.type === 'follow' && <UserPlus className="w-3 h-3 text-blue-500" />}
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                        {act.type === 'like' && 'Liked your post'}
                                        {act.type === 'comment' && 'Commented on your post'}
                                        {act.type === 'follow' && 'Started following you'}
                                    </span>
                                </div>
                                <p className="text-white text-sm">
                                    <span className="font-bold">{act.actor_name}</span>
                                    {act.post_title && <span> on <span className="italic font-serif">"{act.post_title}"</span></span>}
                                </p>
                                {act.comment_text && (
                                    <p className="mt-2 text-gray-400 text-sm font-serif italic border-l-2 border-substack-orange/20 pl-4 py-1">
                                        "{act.comment_text}"
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">
                                    {new Date(act.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {act.post_id && (
                                <Link to={`/post/${act.slug}`} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-substack-orange">
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-[#1C1C1C] rounded-3xl border border-white/5 p-20 text-center">
                        <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-serif italic text-lg mb-2">No activity yet...</p>
                        <p className="text-gray-600 text-sm">Interactions on your posts will show up here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activity;
