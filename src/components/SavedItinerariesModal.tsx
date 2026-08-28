import React from 'react';
import { UserProfile, SavedItineraryRecord } from '../types/auth';
import { TripPlan } from '../types';
import { formatCurrency } from '../utils/tripLinks';
import { 
  X, BookmarkCheck, Trash2, Calendar, MapPin, 
  ExternalLink, Sparkles, FolderOpen, ArrowRight, User
} from 'lucide-react';

interface SavedItinerariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  savedList: SavedItineraryRecord[];
  currency: string;
  onLoadItinerary: (trip: TripPlan) => void;
  onDeleteItinerary: (id: string) => void;
  onOpenAuth: () => void;
}

export const SavedItinerariesModal: React.FC<SavedItinerariesModalProps> = ({
  isOpen,
  onClose,
  user,
  savedList,
  currency,
  onLoadItinerary,
  onDeleteItinerary,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Saved Trip Itineraries
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {savedList.length} {savedList.length === 1 ? 'Trip' : 'Trips'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user ? `Tagged to ${user.name} (${user.email})` : 'Stored locally in your active browser session'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!user && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Sign in with <strong>Gmail or Yahoo</strong> to link your trips to your account identity.</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {savedList.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No saved itineraries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Go to the <strong>Itinerary Planner</strong> tab and click the <strong>"Save Itinerary"</strong> button to keep track of your custom plans.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedList.map((record) => {
                const totalDays = record.tripPlan.itineraryDays ? record.tripPlan.itineraryDays.length : 1;
                const totalCost = (record.tripPlan.itineraryDays || []).reduce((acc, day) => {
                  return acc + (day.items || []).reduce((sum, it) => sum + (it.cost || 0), 0);
                }, 0);

                return (
                  <div
                    key={record.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {record.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {record.destination}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {record.startDate} → {record.endDate} ({totalDays} Days)
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>
                          Activities: <strong>{formatCurrency(totalCost, currency)}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">
                          Saved: {new Date(record.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onLoadItinerary(record.tripPlan);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Load Trip
                      </button>
                      <button
                        onClick={() => onDeleteItinerary(record.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>You can load any saved plan back into the interactive Itinerary Planner.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
