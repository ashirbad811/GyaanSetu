import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Mobile Header */}
            <div className="xl:hidden flex items-center justify-between p-4 border-b border-white/[0.05] sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-substack-orange rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,103,25,0.3)]">
                        <span className="text-white font-bold text-xs">S</span>
                    </div>
                    <span className="text-lg font-bold font-serif">Substack</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Dark Sidebar (Fixed/Responsive) */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Main Content Area */}
            <main className="xl:pl-72 min-h-screen transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
