import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Wrench } from 'lucide-react';
import { AiService } from '@/hooks/useAiChat';

interface AiServiceCardProps {
    service: AiService;
}

const AiServiceCard = memo(({ service }: AiServiceCardProps) => {
    return (
        <Link
            to="/garage"
            className="group flex items-center gap-3 bg-zinc-800/60 border border-white/5 rounded-xl px-3 py-2.5
                hover:border-amber-500/30 hover:bg-zinc-800/90 transition-all duration-200"
        >
            {/* Icon */}
            <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20
                flex items-center justify-center border border-amber-500/10">
                <Wrench className="w-5 h-5 text-amber-400" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                    {service.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-amber-400">
                        ₹{service.price.toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                    </span>
                </div>
                {service.highlights && service.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {service.highlights.slice(0, 2).map((h, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                                {h}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
});

AiServiceCard.displayName = 'AiServiceCard';

export default AiServiceCard;
