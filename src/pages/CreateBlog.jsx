import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Image as ImageIcon, Send, X, Plus, Type, AlignLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/editor.css';

const CreateBlog = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [postType, setPostType] = useState('article'); // article or note
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState('');
    const [keywords, setKeywords] = useState('');
    const [images, setImages] = useState([]);
    const [featuredImage, setFeaturedImage] = useState(null);
    const [isPreview, setIsPreview] = useState(false);

    // Auto-save logic
    useEffect(() => {
        const savedDraft = localStorage.getItem('blog_draft');
        if (savedDraft) {
            const { title, subtitle, content, keywords, postType, featuredImage } = JSON.parse(savedDraft);
            setTitle(title || '');
            setSubtitle(subtitle || '');
            setContent(content || '');
            setKeywords(keywords || '');
            setPostType(postType || 'article');
            setFeaturedImage(featuredImage || null);
        }
    }, []);

    useEffect(() => {
        try {
            const draft = { title, subtitle, content, keywords, postType };
            localStorage.setItem('blog_draft', JSON.stringify(draft));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('Draft auto-save failed: localStorage quota exceeded.');
            } else {
                console.error('Draft auto-save failed:', error);
            }
        }
    }, [title, subtitle, content, keywords, postType]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content) return;

        setLoading(true);
        try {
            const res = await api.post('/posts', {
                title: postType === 'article' ? title : null,
                subtitle: postType === 'article' ? subtitle : null,
                content,
                type: postType,
                keywords,
                featuredImage,
                images
            });

            localStorage.removeItem('blog_draft');

            Swal.fire({
                icon: 'success',
                title: 'Story Published!',
                text: 'Your perspective is now live on the stack.',
                background: '#1C1C1C',
                color: '#fff',
                confirmButtonColor: '#FF6719'
            });

            navigate(`/post/${res.data.id}`);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Publishing Failed',
                text: err.response?.data?.msg || 'Something went wrong',
                background: '#1C1C1C',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-6 pb-16">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-substack-orange to-[#FF8C42] rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(255,103,25,0.4)] relative group transition-all hover:scale-105">
                        <Plus className="text-white w-8 h-8" />
                        <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold text-white font-serif tracking-tight leading-none mb-2">Create</h1>
                        <div className="flex items-center gap-3">
                            <span className="h-[1px] w-8 bg-substack-orange/50"></span>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Drafting your next story</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsPreview(!isPreview)}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${isPreview ? 'bg-white text-black border-white' : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-white'}`}
                    >
                        {isPreview ? 'Back to Edit' : 'Live Preview'}
                    </button>

                    <div className="flex bg-[#1C1C1C]/60 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/5 shadow-2xl">
                        <button 
                            type="button"
                            onClick={() => setPostType('article')}
                            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${postType === 'article' ? 'bg-gradient-to-r from-substack-orange to-[#FF8C42] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Article
                        </button>
                        <button 
                            type="button"
                            onClick={() => setPostType('note')}
                            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${postType === 'note' ? 'bg-gradient-to-r from-substack-orange to-[#FF8C42] text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Note
                        </button>
                    </div>
                </div>
            </div>

            {isPreview ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#1C1C1C]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-12 md:p-20 shadow-2xl min-h-[600px] prose prose-invert max-w-none">
                        {featuredImage && (
                            <img src={featuredImage} alt="Featured" className="w-full aspect-[21/9] object-cover rounded-[2rem] mb-12 shadow-2xl" />
                        )}
                        <h1 className="text-6xl font-serif font-bold text-white mb-4 leading-tight">{title || 'Untitled Story'}</h1>
                        <p className="text-2xl text-gray-400 font-serif italic mb-12 border-l-4 border-substack-orange pl-8">{subtitle}</p>
                        <div className="content-preview text-xl leading-relaxed text-gray-300 font-serif" dangerouslySetInnerHTML={{ __html: content || 'Start typing to see preview...' }}></div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="space-y-12">
                        {/* Featured Image Section */}
                        <div className="relative group/featured h-[400px] w-full rounded-[3rem] overflow-hidden bg-[#1C1C1C]/50 border border-dashed border-white/10 hover:border-substack-orange/30 transition-all flex items-center justify-center">
                            {featuredImage ? (
                                <>
                                    <img src={featuredImage} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover/featured:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/featured:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <label className="p-4 bg-white/10 backdrop-blur-md rounded-2xl cursor-pointer hover:bg-white/20 transition-all">
                                            <ImageIcon className="w-6 h-6 text-white" />
                                            <input type="file" accept="image/*" onChange={handleFeaturedImageChange} className="hidden" />
                                        </label>
                                        <button onClick={() => setFeaturedImage(null)} className="p-4 bg-red-500/20 backdrop-blur-md rounded-2xl hover:bg-red-500/40 transition-all text-red-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="flex flex-col items-center gap-4 cursor-pointer group-hover/featured:scale-110 transition-transform">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-substack-orange/10 transition-colors">
                                        <ImageIcon className="w-10 h-10 text-gray-500 group-hover:text-substack-orange" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-white font-bold text-lg">Add Cover Image</h3>
                                        <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Recommended: 1600x900px</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFeaturedImageChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="bg-[#1C1C1C]/30 backdrop-blur-2xl rounded-[3rem] border border-white/5 p-12 shadow-2xl space-y-12 relative overflow-hidden group/card px-8 md:px-16">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-substack-orange/5 blur-[150px] -mr-[250px] -mt-[250px]"></div>
                            
                            {postType === 'article' && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-substack-orange/50 ml-6">Headline</label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="The title of your piece..."
                                            className="w-full bg-transparent border-none text-white text-3xl md:text-4xl font-serif font-black focus:outline-none placeholder:text-gray-800"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 ml-6">Deck / Subtitle</label>
                                        <textarea 
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            placeholder="What's this story about? (optional)"
                                            className="w-full bg-transparent border-none text-gray-400 text-2xl font-serif italic focus:outline-none placeholder:text-gray-800 resize-none min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 min-h-[300px]">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 ml-6">Composition</label>
                                {postType === 'article' ? (
                                    <ReactQuill 
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Start writing your masterpiece..."
                                        className="premium-editor"
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                ['blockquote', 'code-block'],
                                                ['link'],
                                                ['clean']
                                            ],
                                        }}
                                    />
                                ) : (
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Share a thought..."
                                        className="w-full bg-transparent border-none text-white text-3xl font-serif focus:outline-none placeholder:text-gray-800 resize-none min-h-[400px] italic"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#1C1C1C]/40 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 ml-2">Keywords & Taxonomy</label>
                                <input 
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="Design, Tech, Future..."
                                    className="w-full bg-[#121212]/50 border border-white/5 rounded-2xl py-5 px-8 text-sm font-sans text-gray-300 focus:outline-none focus:border-substack-orange/30 transition-all placeholder:text-gray-800 uppercase tracking-[0.2em]"
                                />
                            </div>

                            <div className="bg-[#1C1C1C]/40 p-8 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6 ml-2">Gallery Assets</h3>
                                <div className="flex flex-wrap gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-substack-orange/40 hover:bg-white/5 transition-all group">
                                        <Plus className="w-6 h-6 text-gray-700 group-hover:text-substack-orange" />
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-12">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-substack-orange to-[#FF8C42] text-white px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_25px_50px_-12px_rgba(255,103,25,0.5)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-6 hover:shadow-[0_25px_60px_-10px_rgba(255,103,25,0.6)]"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Publish Publication</span>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreateBlog;
