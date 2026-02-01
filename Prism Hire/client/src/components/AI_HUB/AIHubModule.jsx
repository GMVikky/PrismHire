import { useState, useRef } from 'react';
import { X, Sparkles, FileText } from 'lucide-react';
import PromptInput from './PromptInput';
import ResponsePanel from './ResponsePanel';

function AIHubModule() {
    const [responses, setResponses] = useState({
        chatgpt: '',
        claude: '',
        gemini: ''
    });
    const [loading, setLoading] = useState({
        chatgpt: false,
        claude: false,
        gemini: false
    });
    const [error, setError] = useState(null);

    // Summary State
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const eventSourceRef = useRef(null);

    const handlePromptSubmit = async (prompt) => {
        // Reset states
        setError(null);
        setResponses({ chatgpt: '', claude: '', gemini: '' });
        setLoading({ chatgpt: true, claude: true, gemini: true });
        setSummary(''); // Reset summary on new prompt

        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/stream';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error('Failed to fetch responses');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    setLoading({ chatgpt: false, gemini: false, claude: false });
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const { model, data: text, done: isDone } = data;

                            if (model === 'error') {
                                setError(text);
                                continue;
                            }

                            if (['chatgpt', 'claude', 'gemini'].includes(model)) {
                                setResponses(prev => ({
                                    ...prev,
                                    [model]: prev[model] + text
                                }));

                                if (isDone) {
                                    setLoading(prev => ({
                                        ...prev,
                                        [model]: false
                                    }));
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch responses. Please try again.');
            setLoading({ chatgpt: false, claude: false, gemini: false });
        }
    };

    const handleSummarize = async () => {
        // Check if there are any responses from the 3 models
        const hasResponses = Object.values(responses).some(response => response && response.trim() !== '');

        console.log('📊 Attempting to summarize. Has responses:', hasResponses);
        console.log('📊 Responses object:', responses);

        if (!hasResponses) return;

        setShowSummary(true);
        setIsSummarizing(true);
        setSummary(''); // Reset previous summary

        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1/summarize';
            console.log('📤 Sending request to:', API_URL);
            console.log('📤 Request body:', { responses });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses }),
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Server Error:', errorData);
                throw new Error(errorData.details || errorData.error || 'Unknown server error');
            }

            const data = await response.json();
            console.log('✅ Summary received:', data.summary?.substring(0, 100) + '...');
            setSummary(data.summary);
        } catch (err) {
            console.error('❌ Summary error:', err);
            setSummary(`Error: ${err.message}. Please check your API key quota.`);
        } finally {
            setIsSummarizing(false);
        }
    };

    const hasResponses = responses.chatgpt || responses.gemini || responses.claude;

    return (
        <div className="h-full flex flex-col text-white selection:bg-purple-500/30 relative">
            {/* Header */}
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight mb-2">
                    AI HUB
                </h1>
                <p className="text-gray-400 text-lg">Compare models side-by-side with real-time streaming</p>
            </header>

            {/* Input Area */}
            <PromptInput
                onSubmit={handlePromptSubmit}
                isLoading={loading.chatgpt || loading.gemini || loading.claude}
            />

            {/* Summarize Button - Only show if there are responses */}
            {hasResponses && (
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleSummarize}
                        className="group relative inline-flex items-center gap-2 px-8 py-3 bg-gray-900 border border-purple-500/30 rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></span>
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 group-hover:text-white transition-colors">
                            Summarize All Insights
                        </span>
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg max-w-2xl text-center">
                    {error}
                </div>
            )}

            {/* Results Grid - 3x1 grid for 3 models */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 pb-6">
                <ResponsePanel
                    title="ChatGPT (OpenAI)"
                    content={responses.chatgpt}
                    type="chatgpt"
                    isLoading={loading.chatgpt}
                />
                <ResponsePanel
                    title="Claude (Anthropic)"
                    content={responses.claude}
                    type="claude"
                    isLoading={loading.claude}
                />
                <ResponsePanel
                    title="Gemini (Google)"
                    content={responses.gemini}
                    type="gemini"
                    isLoading={loading.gemini}
                />
            </div>

            {/* Summary Modal */}
            {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-gray-900/90 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-500/20 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-purple-500/20">
                                    <FileText className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Comprehensive Insight Summary
                                    </h2>
                                    <p className="text-sm text-gray-400">Synthesized from all AI models</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {isSummarizing ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-gray-300 font-medium animate-pulse text-lg">Synthesizing perspectives...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none prose-lg">
                                    <div className="whitespace-pre-wrap leading-relaxed text-gray-200 bg-gray-800/30 p-6 rounded-xl border border-white/5">
                                        {summary}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 bg-gray-800/50 flex justify-end">
                            <button
                                onClick={() => setShowSummary(false)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIHubModule;
