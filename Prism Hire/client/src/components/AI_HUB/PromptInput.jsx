import React, { useState } from 'react';
import { Send } from 'lucide-react';

const PromptInput = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 relative z-10">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-gray-900 rounded-lg p-1 ring-1 ring-white/10">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything to all models..."
                        className="w-full bg-transparent text-white placeholder-gray-400 p-4 outline-none resize-none min-h-[60px] max-h-[200px] overflow-hidden rounded-lg font-medium"
                        disabled={isLoading}
                        rows={1}
                        style={{ height: 'auto', minHeight: '60px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isLoading}
                        className={`p-3 m-1 rounded-md transition-all duration-300 ${prompt.trim() && !isLoading
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-indigo-500/50 hover:scale-105 active:scale-95'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send size={24} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PromptInput;
