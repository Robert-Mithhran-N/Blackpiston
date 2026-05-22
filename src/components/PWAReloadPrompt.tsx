import { useRegisterSW } from "virtual:pwa-register/react";
import { DownloadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const PWAReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (offlineReady) {
      toast.success("App ready to work offline", {
        position: "bottom-right",
      });
    }
  }, [offlineReady]);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] animate-in slide-in-from-bottom-5 duration-500">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
            <DownloadCloud className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Update Available</h3>
            <p className="mt-1 text-xs text-zinc-400">
              A new version of BlackPiston Garage is available.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
              >
                Reload
              </button>
              <button
                onClick={close}
                className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={close}
            className="shrink-0 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAReloadPrompt;
