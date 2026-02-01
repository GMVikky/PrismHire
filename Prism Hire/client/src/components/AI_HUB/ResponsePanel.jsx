import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Sparkles, Zap } from 'lucide-react';

const ResponsePanel = ({ title, content, type, isLoading }) => {
    const contentRef = useRef(null);

    // Auto-scroll to bottom when content updates
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [content]);

    const getIcon = () => {
        switch (type) {
            case 'chatgpt': return <Zap size={20} className="text-green-400" />;
            case 'claude': return <Bot size={20} className="text-orange-400" />;
            case 'gemini': return <Sparkles size={20} className="text-blue-400" />;
            default: return <Bot size={20} className="text-gray-400" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'chatgpt': return 'group-hover:border-green-500/50';
            case 'claude': return 'group-hover:border-orange-500/50';
            case 'gemini': return 'group-hover:border-blue-500/50';
            default: return 'group-hover:border-gray-500/50';
        }
    };

    const getGlowColor = () => {
        switch (type) {
            case 'chatgpt': return 'shadow-green-500/20';
            case 'claude': return 'shadow-orange-500/20';
            case 'gemini': return 'shadow-blue-500/20';
            default: return '';
        }
    };

    return (
        <div className={`group flex flex-col h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-gray-900/80 ${getBorderColor()} ${isLoading ? 'shadow-lg ' + getGlowColor() : ''}`}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5">
                <div className={`p-2 rounded-lg bg-gray-800/50 ring-1 ring-white/10 shadow-inner ${isLoading ? 'animate-pulse' : ''}`}>
                    {getIcon()}
                </div>
                <h3 className="font-semibold text-lg text-white tracking-wide">{title}</h3>
                {isLoading && (
                    <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span>Thinking</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
                {!content && !isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                        {getIcon()}
                        <span className="text-sm">Waiting for prompt...</span>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                        {isLoading && content && (
                            <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse"></span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponsePanel;
