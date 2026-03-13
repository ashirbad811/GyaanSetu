import React from 'react';
import { Compass } from 'lucide-react';

const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 mb-8">
            <Compass className="w-10 h-10 text-substack-orange animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 font-serif italic">{title}</h1>
        <p className="text-gray-500 font-serif italic text-lg max-w-md">
            This module is being optimized for the premium experience. Check back soon.
        </p>
    </div>
);

export const Following = () => <PlaceholderPage title="Following" />;
export const Activity = () => <PlaceholderPage title="Activity" />;
export const Chat = () => <PlaceholderPage title="Chat" />;

export default PlaceholderPage;
