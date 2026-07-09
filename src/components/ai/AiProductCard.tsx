import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { AiProduct } from '@/hooks/useAiChat';
import { getResponsiveImageUrl } from '@/lib/imageUtils';

interface AiProductCardProps {
    product: AiProduct;
}

const AiProductCard = memo(({ product }: AiProductCardProps) => {
    const discountPercent = product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;

    const imageUrl = product.thumbnailUrl
        ? getResponsiveImageUrl(product.thumbnailUrl, 80)
        : null;

    return (
        <Link
            to={`/product/${product.slug || product.id}`}
            className="group flex items-center gap-3 bg-zinc-800/60 border border-white/5 rounded-xl px-3 py-2.5
                hover:border-amber-500/30 hover:bg-zinc-800/90 transition-all duration-200"
        >
            {/* Thumbnail */}
            <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-zinc-700/50 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-lg">
                        🏍️
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                    {product.name}
                </h4>
                {product.brand && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">{product.brand}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    {product.offerPrice ? (
                        <>
                            <span className="text-sm font-bold text-amber-400">
                                ₹{product.offerPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-500 line-through">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {discountPercent > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400">
                                    {discountPercent}% off
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-sm font-bold text-amber-400">
                            ₹{product.price.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>
            </div>

            {/* Rating + Stock */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {product.rating !== undefined && product.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-medium text-zinc-300">{product.rating.toFixed(1)}</span>
                    </div>
                )}
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    product.inStock !== false
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-red-400 bg-red-500/10'
                }`}>
                    {product.inStock !== false ? 'In Stock' : 'Out'}
                </span>
            </div>
        </Link>
    );
});

AiProductCard.displayName = 'AiProductCard';

export default AiProductCard;
