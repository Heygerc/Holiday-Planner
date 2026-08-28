import React from 'react';
import { Calendar, Plane, MapPin, Calculator, Sparkles, Compass, Code, DollarSign, MessageSquare, User, BookmarkCheck, LogOut } from 'lucide-react';
import { CURRENCY_RATES } from '../utils/tripLinks';
import { UserProfile } from '../types/auth';

interface NavbarProps {
  activeTab: 'holidays' | 'flights-hotels' | 'itinerary' | 'budget' | 'ai-insight' | 'community';
  setActiveTab: (tab: 'holidays' | 'flights-hotels' | 'itinerary' | 'budget' | 'ai-insight' | 'community') => void;
  currency: string;
  setCurrency: (c: string) => void;
  selectedDestination: string;
  onOpenCodeModal: () => void;
  user: UserProfile | null;
  savedCount: number;
  onOpenAuthModal: () => void;
  onOpenSavedModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  selectedDestination,
  onOpenCodeModal,
  user,
  savedCount,
  onOpenAuthModal,
  onOpenSavedModal,
  onSignOut
}) => {
  const tabs = [
    { id: 'holidays' as const, label: '1. Global Holidays', icon: Calendar, subtitle: 'Calendar & Bridge Days' },
    { id: 'flights-hotels' as const, label: '2. Flights & Hotels', icon: Plane, subtitle: 'Search & Compare' },
    { id: 'itinerary' as const, label: '3. Itinerary Planner', icon: MapPin, subtitle: 'Timeline & Nodes' },
    { id: 'budget' as const, label: '4. Budget Calculator', icon: Calculator, subtitle: 'Real-time Math' },
    { id: 'ai-insight' as const, label: 'AI Trip Advisor', icon: Sparkles, subtitle: 'Smart Recommendations' },
    { id: 'community' as const, label: 'Community', icon: MessageSquare, subtitle: 'Discussion & Tips' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1e293b] text-white border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('holidays')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white font-sans">
                  HORIZON <span className="text-blue-400 font-light">PLANNER</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-900/60 text-blue-300 border border-blue-700">
                  Global Travel OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Holidays • Trip.com Search • Itineraries • Budgets
              </p>
            </div>
          </div>

          {/* Current Selection & Global Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {selectedDestination && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="text-slate-400">Target:</span>
                <span className="font-semibold text-amber-400">{selectedDestination}</span>
              </div>
            )}

            {/* Saved Trips Button */}
            <button
              onClick={onOpenSavedModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="View your saved trip plans"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Saved Trips</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400 mr-1" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                title="Select Display Currency"
              >
                {Object.keys(CURRENCY_RATES).map((curr) => (
                  <option key={curr} value={curr} className="bg-slate-800 text-white">
                    {curr} ({CURRENCY_RATES[curr].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Account / User profile button */}
            {user ? (
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                <button
                  onClick={onOpenSavedModal}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title={`Signed in as ${user.email}`}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium truncate max-w-[100px]">{user.name}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Sign in with Gmail, Yahoo, or custom email"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* View 4 Deliverable Files / Semantic HTML Code */}
            <button
              id="view-code-btn"
              onClick={onOpenCodeModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
              title="Inspect Delivered HTML5, CSS, and JS Files"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Export Code</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 rounded-t-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 border-blue-500 shadow-sm font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'ai-insight' && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

