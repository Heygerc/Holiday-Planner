import React, { useEffect, useState } from 'react';
import { MessageSquare, Users, ExternalLink, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface DisqusCommentsProps {
  pageUrl?: string;
  pageIdentifier?: string;
  title?: string;
  shortname?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  pageUrl = 'https://holidayplanner-beta.vercel.app',
  pageIdentifier = 'holiday-planner-community-main',
  title = 'Horizon Planner - Global Travel Community',
  shortname = 'https-holidayplanner-beta-vercel-app'
}) => {
  const [currentShortname, setCurrentShortname] = useState<string>(() => {
    return localStorage.getItem('disqus_shortname') || shortname;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [tempShortname, setTempShortname] = useState<string>(currentShortname);

  const initDisqus = () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // Configuration object
      (window as any).disqus_config = function (this: any) {
        this.page.url = pageUrl;
        this.page.identifier = pageIdentifier;
        this.page.title = title;
      };

      // If DISQUS instance is already loaded globally, perform a full reset
      if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = pageUrl;
            this.page.identifier = pageIdentifier;
            this.page.title = title;
          }
        });
        setIsLoading(false);
      } else {
        // Remove existing script if any
        const oldScript = document.getElementById('dsq-embed-scr');
        if (oldScript) {
          oldScript.remove();
        }

        // Create fresh script element
        const d = document;
        const s = d.createElement('script');
        s.id = 'dsq-embed-scr';
        s.src = `https://${currentShortname}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', String(+new Date()));
        s.async = true;
        
        s.onload = () => {
          setIsLoading(false);
        };

        s.onerror = () => {
          setIsLoading(false);
          setIsError(true);
        };

        (d.head || d.body).appendChild(s);
      }
    } catch (err) {
      console.warn('Disqus embed init error:', err);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Delay initialization slightly to ensure #disqus_thread is fully mounted in DOM
    const timer = setTimeout(() => {
      initDisqus();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentShortname, pageUrl, pageIdentifier, title]);

  const handleSaveShortname = () => {
    const clean = tempShortname.trim();
    if (clean) {
      setCurrentShortname(clean);
      localStorage.setItem('disqus_shortname', clean);
      setShowConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Traveler Community & Discussion
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Users className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Connect directly with travelers via Disqus, exchange holiday leave strategies, recommend hidden gems, and review trip plans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={initDisqus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Disqus thread"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reload Comments
            </button>
            <a
              href={`https://disqus.com/home/forums/${currentShortname}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open on Disqus.com
            </a>
          </div>
        </div>

        {/* Community Topics Quick Prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">✈️ Destination Tips</span>
            Ask questions about local transit, seasonal weather, or food recommendations.
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">📅 Long-Weekend Hacks</span>
            Share how you bridge public holidays to maximize consecutive vacation days.
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">💰 Budget & Deals</span>
            Discuss flight bargains, hotel finds, and smart currency exchange tips.
          </div>
        </div>

        {/* Adblock / Connectivity Notice */}
        {isError && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to load the embedded Disqus widget</p>
              <p className="text-amber-800 mt-1">
                This commonly happens if an ad blocker (like uBlock Origin, Brave Shield, or Privacy Badger) or strict browser tracking protection is blocking third-party comments.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={`https://disqus.com/home/forums/${currentShortname}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-amber-600 text-white rounded font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> View Discussion Directly on Disqus
                </a>
                <button
                  onClick={initDisqus}
                  className="text-amber-900 underline font-medium hover:text-amber-950"
                >
                  Try Reconnecting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disqus Embed Container */}
        <div className="mt-6 pt-6 border-t border-slate-100 relative min-h-[350px]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Connecting to Disqus Traveler Thread...</p>
            </div>
          )}

          <div id="disqus_thread" className="w-full"></div>
          
          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-blue-600 underline">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>

        {/* Footer info & Settings Toggle */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Tied directly to Disqus Community Forum: <strong>{currentShortname}</strong></span>
          </div>

          <div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              {showConfig ? 'Close Forum Settings' : 'Change Disqus Shortname'}
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        {showConfig && (
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in duration-150">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disqus Forum Shortname:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempShortname}
                onChange={(e) => setTempShortname(e.target.value)}
                placeholder="e.g. https-holidayplanner-beta-vercel-app"
                className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveShortname}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Save & Reload
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default is <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">https-holidayplanner-beta-vercel-app</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
