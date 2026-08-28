import React, { useState } from 'react';
import { TripPlan, TravelInsightResponse } from '../types';
import { 
  Sparkles, Send, MapPin, Calendar, Lightbulb, 
  Check, ArrowRight, ShieldCheck, ShoppingBag, Clock, Plus, RefreshCw 
} from 'lucide-react';

interface TravelInsightViewProps {
  tripPlan: TripPlan;
  currency: string;
  onImportAIIterary: (suggestedDays: Array<{ dayNumber: number; title: string; activities: string[] }>) => void;
}

export const TravelInsightView: React.FC<TravelInsightViewProps> = ({
  tripPlan,
  currency,
  onImportAIIterary
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [insight, setInsight] = useState<TravelInsightResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [style, setStyle] = useState<string>('Balanced Explorer');
  const [focusArea, setFocusArea] = useState<'itinerary' | 'budget_tips' | 'holiday_guide' | 'general'>('general');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [imported, setImported] = useState<boolean>(false);

  // Fetch AI insight from server-side Gemini endpoint
  const handleGenerateInsight = async (overrideFocus?: 'itinerary' | 'budget_tips' | 'holiday_guide' | 'general') => {
    setLoading(true);
    setImported(false);
    setErrorMessage(null);
    const targetFocus = overrideFocus || focusArea;

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: tripPlan.destinationCountry || 'Japan',
          city: tripPlan.destinationCity || 'Tokyo',
          holidayName: tripPlan.linkedHoliday?.name || 'Public Holiday',
          startDate: tripPlan.startDate,
          endDate: tripPlan.endDate,
          travelers: tripPlan.travelersCount,
          budget: tripPlan.targetBudget,
          currency: currency,
          style: style,
          requestType: targetFocus,
          customPrompt: customPrompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInsight(data);
      } else {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.error === "credential not configured") {
          setErrorMessage("Gemini API credential not configured. Please add GEMINI_API_KEY to your project settings.");
        } else {
          setErrorMessage(errJson.error || "Failed to generate travel insight. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Failed to generate insight:", err);
      setErrorMessage("Network error connecting to the insight service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-900 text-sm flex items-start gap-3 shadow-sm">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Advisory Service Notice</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Control Banner Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-amber-50 text-amber-600 font-bold">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  AI Travel Advisor & Holiday Strategist
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Targeted recommendations, holiday bridge schedules, and tailored day-by-day itineraries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Travel Style:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
            >
              <option value="Balanced Explorer">Balanced Explorer</option>
              <option value="Food & Culture Enthusiast">Food & Culture Enthusiast</option>
              <option value="Budget Backpacker">Budget Backpacker</option>
              <option value="Luxury & Wellness">Luxury & Wellness</option>
              <option value="Fast-Paced Highlights">Fast-Paced Highlights</option>
            </select>
          </div>
        </div>

        {/* Quick Strategy Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFocusArea('holiday_guide');
              handleGenerateInsight('holiday_guide');
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Holiday Travel Strategy</span>
          </button>

          <button
            onClick={() => {
              setFocusArea('itinerary');
              handleGenerateInsight('itinerary');
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Build Complete 4-Day Itinerary</span>
          </button>

          <button
            onClick={() => {
              setFocusArea('budget_tips');
              handleGenerateInsight('budget_tips');
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Peak Holiday Budget & Flight Booking Window</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
          <p className="text-sm font-semibold text-slate-800">
            Generating strategic travel recommendations for {tripPlan.destinationCity || 'your destination'}...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing holiday crowd flows, booking windows, and curated itineraries.
          </p>
        </div>
      )}

      {/* Results View */}
      {!loading && insight && (
        <div className="space-y-6">
          
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-lg p-5 border border-slate-800 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Strategic Travel Overview • {tripPlan.destinationCity || tripPlan.destinationCountry}
                </span>
                <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                  {insight.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Recommendations */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Key Strategic Recommendations</span>
              </div>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Flight Booking Window & Holiday Highlights */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Booking Window & Highlights</span>
              </div>
              
              {insight.bestFlightBookingWindow && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900">
                  <span className="font-bold block">Best Flight Booking Window:</span>
                  {insight.bestFlightBookingWindow}
                </div>
              )}

              {insight.localHolidayHighlights && insight.localHolidayHighlights.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {insight.localHolidayHighlights.map((hl, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Packing Essentials */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Packing & Essentials</span>
              </div>
              <ul className="space-y-2">
                {(insight.packingTips || []).map((tip, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI-Suggested Itinerary Section with 1-Click Import */}
          {insight.suggestedItineraryDays && insight.suggestedItineraryDays.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                    AI Auto-Generated Itinerary
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {insight.suggestedItineraryDays.length}-Day Structured Plan for {tripPlan.destinationCity || 'Your Trip'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    onImportAIIterary(insight.suggestedItineraryDays || []);
                    setImported(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition-all shadow-sm ${
                    imported 
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {imported ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Successfully Imported to Planner!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Import into My Itinerary Planner</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insight.suggestedItineraryDays.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                        Day {day.dayNumber}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{day.title}</h4>
                    <ul className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-600">
                      {day.activities.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default Prompt state when no insight yet */}
      {!loading && !insight && (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center shadow-sm">
          <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            Generate Customized Travel Insights for {tripPlan.destinationCity || 'Your Holiday Destination'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click one of the quick buttons above to receive AI-powered holiday leave-bridging advice, peak-season flight booking windows, and auto-built day-by-day schedules.
          </p>
          <button
            onClick={() => handleGenerateInsight('general')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First AI Advisory</span>
          </button>
        </div>
      )}
    </div>
  );
};
