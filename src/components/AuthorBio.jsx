import { User, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const AuthorBio = ({ author, onFollow }) => {
    const { user, isFollowing, unfollow } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!author) return null;

    const authorId = author.id;
    const following = authorId ? isFollowing(authorId) : false;
    const isOwnProfile = user?.id && authorId && Number(user.id) === Number(authorId);

    const handleFollowClick = async () => {
        if (following) {
            setLoading(true);
            try {
                await unfollow(author.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            onFollow();
        }
    };

    return (
        <div className="bg-[#1C1C1C] p-8 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left shadow-xl">
            <div className="w-24 h-24 rounded-full bg-[#242424] flex items-center justify-center text-substack-orange border border-white/5 overflow-hidden flex-shrink-0 shadow-inner">
                {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-12 h-12" />
                )}
            </div>
            <div className="flex-grow">
                <h3 className="text-2xl font-bold font-serif mb-3 text-white">{author.name}</h3>
                <p className="text-gray-400 font-serif leading-relaxed mb-6 italic">
                    {author.bio || "Sharing deep dives and modern perspectives on technology, design, and everything in between."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {!isOwnProfile && (
                        <button 
                            onClick={handleFollowClick}
                            disabled={loading}
                            className={`flex items-center justify-center w-full sm:w-auto font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all ${
                                following 
                                ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10' 
                                : 'btn-substack'
                            }`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (following ? 'Following' : <><UserPlus className="w-4 h-4 mr-2" /> Follow</>)}
                        </button>
                    )}
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                        Join our community of readers
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthorBio;
