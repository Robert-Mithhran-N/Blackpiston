import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

const StartupLoader = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        // Simple health check ping
        const res = await axios.get(`${apiUrl}/api/health`, { timeout: 15000 });
        if (res.status === 200) {
          setIsReady(true);
        }
      } catch (err) {
        setIsWaking(true);
        // Retry logic for cold start
        let retries = 5;
        const interval = setInterval(async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.get(`${apiUrl}/api/health`, { timeout: 10000 });
            if (res.status === 200) {
              clearInterval(interval);
              setIsReady(true);
            }
          } catch (e) {
            retries -= 1;
            if (retries <= 0) {
              clearInterval(interval);
              setError(true);
            }
          }
        }, 5000); // retry every 5s
      }
    };

    checkHealth();
  }, []);

  if (isReady) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black">
      <div className="text-center">
        {/* Simplified Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-xl shadow-amber-500/10">
            <span className="font-bebas text-4xl text-amber-500">BP</span>
          </div>
        </div>

        {error ? (
          <div className="text-red-500">
            <p className="text-sm font-semibold">Failed to connect to server.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-amber-500 px-4 py-2 text-sm font-bold text-black"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
            <h2 className="mt-4 font-bebas text-2xl tracking-wider text-white">
              BLACKPISTON GARAGE
            </h2>
            {isWaking ? (
              <p className="mt-2 animate-pulse text-sm text-zinc-400">
                Starting up servers... this may take a moment.
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">Loading...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StartupLoader;
