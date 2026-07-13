import { memo } from 'react';
import { AiChatMessage } from '@/hooks/useAiChat';
import AiProductCard from './AiProductCard';
import AiServiceCard from './AiServiceCard';

interface AiMessageBubbleProps {
    message: AiChatMessage;
    onSuggestionClick?: (suggestion: string) => void;
}

const AiMessageBubble = memo(({ message, onSuggestionClick }: AiMessageBubbleProps) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] ${isUser ? 'order-1' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isUser
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-amber-500/20'
                            : 'bg-zinc-800/80 text-zinc-100 rounded-bl-md border border-white/5'
                    }`}
                >
                    {message.content}
                    {message.isQueued && (
                        <span className="text-[9px] opacity-70 ml-2 italic bg-black/30 px-1.5 py-0.5 rounded">
                            (Queued)
                        </span>
                    )}
                </div>

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {message.products.slice(0, 4).map(product => (
                            <AiProductCard key={product.id} product={product} />
                        ))}
                        {message.products.length > 4 && (
                            <p className="text-xs text-zinc-400 text-center py-1">
                                + {message.products.length - 4} more products
                            </p>
                        )}
                    </div>
                )}

                {/* Service Cards */}
                {message.services && message.services.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {message.services.slice(0, 4).map(service => (
                            <AiServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}

                {/* Order Info */}
                {message.orders && message.orders.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {message.orders.map(order => (
                            <div
                                key={order.orderNumber}
                                className="bg-zinc-800/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-semibold text-amber-400">#{order.orderNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' :
                                        order.orderStatus === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                                        order.orderStatus === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {order.orderStatus.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-zinc-400">
                                    <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                    <span>{new Date(order.orderedAt).toLocaleDateString('en-IN')}</span>
                                </div>
                                {order.tracking?.trackingNumber && (
                                    <div className="mt-1.5 text-zinc-300">
                                        📦 Tracking: {order.tracking.trackingNumber}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Suggestion Chips */}
                {message.suggestions && message.suggestions.length > 0 && !isUser && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSuggestionClick?.(suggestion)}
                                className="px-3 py-1.5 text-xs font-medium rounded-full
                                    bg-zinc-800/60 text-zinc-300 border border-white/10
                                    hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30
                                    transition-all duration-200 active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp */}
                <p className={`text-[10px] text-zinc-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
});

AiMessageBubble.displayName = 'AiMessageBubble';

// ── Typing Indicator ──

export const AiTypingIndicator = ({ status }: { status?: string | null }) => (
    <div className="flex flex-col justify-start mb-3 gap-1 animate-fadeIn">
        <div className="bg-zinc-800/80 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 w-fit">
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
        {status && (
            <p className="text-[10px] text-zinc-400 ml-1.5 italic animate-pulse">
                {status}
            </p>
        )}
    </div>
);

export default AiMessageBubble;
