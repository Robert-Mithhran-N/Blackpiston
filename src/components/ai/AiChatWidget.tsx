import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    MessageCircle,
    X,
    Send,
    Trash2,
    ChevronDown,
    Sparkles,
    Search,
    Package,
    Wrench,
    HelpCircle,
} from 'lucide-react';
import { useAiChat } from '@/hooks/useAiChat';
import AiMessageBubble, { AiTypingIndicator } from './AiMessageBubble';

const QUICK_ACTIONS = [
    { label: 'Search Products', icon: Search, query: 'Show me your best products' },
    { label: 'Track Order', icon: Package, query: 'Track my order' },
    { label: 'Garage Services', icon: Wrench, query: 'What garage services do you offer?' },
    { label: 'FAQs', icon: HelpCircle, query: 'Show me frequently asked questions' },
];

const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [showScrollDown, setShowScrollDown] = useState(false);

    const location = useLocation();
    const { messages, isLoading, sendMessage, clearChat } = useAiChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Hide on admin routes, login, checkout
    const hideRoutes = ['/admin', '/login', '/checkout', '/onboarding', '/forgot-password', '/reset-password'];
    if (hideRoutes.some(route => location.pathname.startsWith(route))) {
        return null;
    }

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Track scroll position for "scroll down" button
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        setShowScrollDown(!isNearBottom);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input.trim());
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const handleQuickAction = (query: string) => {
        sendMessage(query);
    };

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                id="ai-chat-button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed z-[60] transition-all duration-500 ease-out group
                    ${isOpen
                        ? 'bottom-4 right-4 lg:bottom-6 lg:right-6'
                        : 'bottom-20 right-4 lg:bottom-6 lg:right-6'
                    }`}
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center
                    shadow-xl transition-all duration-300
                    ${isOpen
                        ? 'bg-zinc-800 rotate-0 shadow-zinc-900/50'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 active:scale-95'
                    }`}
                >
                    {isOpen ? (
                        <X className="w-6 h-6 text-zinc-300" />
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6 text-white" />
                            {/* Pulse ring */}
                            <span className="absolute inset-0 rounded-2xl animate-ping bg-amber-500/20 pointer-events-none" />
                        </>
                    )}
                </div>
                {/* Tooltip (only when closed) */}
                {!isOpen && (
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap
                        px-3 py-1.5 text-xs font-medium text-white bg-zinc-800 rounded-lg
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                        border border-white/10 shadow-lg hidden lg:block">
                        BlackPiston AI
                    </span>
                )}
            </button>

            {/* ── Chat Panel ── */}
            <div
                id="ai-chat-panel"
                className={`fixed z-[59] transition-all duration-500 ease-out
                    ${isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-8 pointer-events-none'
                    }
                    /* Mobile: full-width bottom sheet */
                    bottom-0 left-0 right-0 h-[85vh]
                    /* Desktop: fixed popup */
                    lg:bottom-24 lg:left-auto lg:right-6 lg:h-[600px] lg:w-[420px] lg:rounded-2xl
                `}
            >
                <div className="w-full h-full flex flex-col bg-zinc-900/95 backdrop-blur-xl
                    border border-white/10 overflow-hidden
                    rounded-t-2xl lg:rounded-2xl
                    shadow-2xl shadow-black/50">

                    {/* ── Header ── */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3
                        border-b border-white/5 bg-zinc-900/80">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                                flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-tight">
                                    BlackPiston AI
                                </h3>
                                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10
                                        transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5
                                    transition-colors lg:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages Area ── */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-1
                            scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                    >
                        {messages.length === 0 ? (
                            /* ── Welcome Screen ── */
                            <div className="flex flex-col items-center justify-center h-full text-center px-2">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20
                                    flex items-center justify-center mb-4 border border-amber-500/20">
                                    <Sparkles className="w-8 h-8 text-amber-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-1">
                                    BlackPiston AI Assistant
                                </h4>
                                <p className="text-xs text-zinc-400 mb-6 max-w-[260px]">
                                    Your motorcycle gear expert. Ask about products, services, orders, or anything BlackPiston!
                                </p>

                                {/* Quick Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
                                    {QUICK_ACTIONS.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.label}
                                                onClick={() => handleQuickAction(action.query)}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                                                    bg-zinc-800/60 border border-white/5 text-left
                                                    hover:bg-zinc-800 hover:border-amber-500/20 hover:text-amber-400
                                                    transition-all duration-200 group/qa active:scale-95"
                                            >
                                                <Icon className="w-4 h-4 text-zinc-400 group-hover/qa:text-amber-400 transition-colors flex-shrink-0" />
                                                <span className="text-xs font-medium text-zinc-300 group-hover/qa:text-amber-400 transition-colors">
                                                    {action.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* ── Message List ── */
                            <>
                                {messages.map((msg, idx) => (
                                    <AiMessageBubble
                                        key={idx}
                                        message={msg}
                                        onSuggestionClick={handleSuggestionClick}
                                    />
                                ))}
                                {isLoading && <AiTypingIndicator />}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll Down Button */}
                    {showScrollDown && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                            <button
                                onClick={scrollToBottom}
                                className="p-2 rounded-full bg-zinc-800 border border-white/10 text-zinc-400
                                    hover:text-white shadow-lg transition-all duration-200"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── Input Area ── */}
                    <div className="flex-shrink-0 px-3 py-3 border-t border-white/5 bg-zinc-900/80">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about products, services..."
                                    disabled={isLoading}
                                    maxLength={500}
                                    className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm
                                        bg-zinc-800/80 border border-white/10 text-white
                                        placeholder:text-zinc-500
                                        focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all duration-200"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                                    bg-gradient-to-br from-amber-500 to-orange-600 text-white
                                    hover:from-amber-400 hover:to-orange-500
                                    disabled:opacity-30 disabled:cursor-not-allowed
                                    shadow-lg shadow-amber-500/20
                                    transition-all duration-200 active:scale-90"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[9px] text-zinc-600 text-center mt-1.5">
                            BlackPiston AI • Motorcycle Gear Expert
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Backdrop (mobile only) ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[58] bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default AiChatWidget;
