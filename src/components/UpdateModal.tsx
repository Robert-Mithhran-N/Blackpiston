import { useState } from "react";
import { usePWA } from "@/context/PWAContext";
import { Sparkles, RefreshCw, X, Zap, CheckCircle2, Flame } from "lucide-react";

const UpdateModal = () => {
  const { needRefresh, setNeedRefresh, updateApp, latestVersion, appVersion } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!needRefresh) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    // Give it a tiny delay for visual feedback before reloading
    setTimeout(async () => {
      await updateApp();
    }, 800);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 z-[10000] animate-in slide-in-from-bottom-5 duration-500">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl">
        <div className="relative flex items-start gap-4">
          
          {/* Flame Icon Container with gradient */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            {isUpdating ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <Flame className="h-6 w-6 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-orange-500/20 uppercase tracking-wider">
                New Update
              </span>
              {latestVersion && latestVersion !== appVersion && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  v{appVersion} → v{latestVersion}
                </span>
              )}
            </div>
            
            <h3 className="mt-1 text-sm font-bold text-white uppercase tracking-wider font-display">
              New BlackPiston Update Available
            </h3>

            {/* Change log details */}
            <ul className="mt-2.5 space-y-1.5 text-xs text-zinc-400 font-ui">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Faster loading & performance optimizations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Security & checkout improvements</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>General bug fixes & UI polishing</span>
              </li>
            </ul>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 disabled:opacity-70 px-4 py-2.5 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.97]"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Updating App...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Update Now
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={isUpdating}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white disabled:opacity-50 active:scale-[0.97]"
              >
                Later
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="absolute -top-1.5 -right-1.5 shrink-0 rounded-full p-1 text-zinc-500 hover:bg-zinc-800/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
