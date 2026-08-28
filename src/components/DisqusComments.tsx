import React, { useEffect } from 'react';
import { MessageSquare, MessageCircle, Users, Sparkles, Heart } from 'lucide-react';

interface DisqusCommentsProps {
  pageUrl?: string;
  pageIdentifier?: string;
  title?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  pageUrl,
  pageIdentifier = 'holiday-planner-main',
  title = 'Horizon Planner - Global Travel Community'
}) => {
  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : 'https://holidayplanner-beta.vercel.app');

  useEffect(() => {
    // If DISQUS is already present on window, trigger a reset
    if ((window as any).DISQUS) {
      try {
        (window as any).DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = pageIdentifier;
            this.page.url = currentUrl;
            this.page.title = title;
          }
        });
      } catch (err) {
        console.warn('Disqus reset error:', err);
      }
    } else {
      // Define configuration before loading script
      (window as any).disqus_config = function () {
        this.page.url = currentUrl;
        this.page.identifier = pageIdentifier;
        this.page.title = title;
      };

      // Inject embed script
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://https-holidayplanner-beta-vercel-app.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      (d.head || d.body).appendChild(s);
    }
  }, [currentUrl, pageIdentifier, title]);

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
                Connect with travelers, exchange holiday leave strategies, recommend hidden gems, and review trip plans.
              </p>
            </div>
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

        {/* Disqus Embed Container */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div id="disqus_thread" className="min-h-[300px]"></div>
          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-blue-600 underline">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>
      </div>
    </div>
  );
};
