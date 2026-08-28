import React, { useState } from 'react';
import { TripPlan, ItineraryDay, ItineraryItem, PublicHoliday } from '../types';
import { formatCurrency } from '../utils/tripLinks';
import { 
  MapPin, Plus, Trash2, Calendar, Clock, DollarSign, 
  Plane, Building2, Utensils, Compass, Bus, Edit3, 
  Download, Printer, Share2, Sparkles, CheckCircle2, ChevronRight, X
} from 'lucide-react';

interface ItineraryPlannerProps {
  tripPlan: TripPlan;
  currency: string;
  onUpdateTripPlan: (updated: TripPlan) => void;
  onNavigateToBudget: () => void;
  onAskAIItinerary: () => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  tripPlan,
  currency,
  onUpdateTripPlan,
  onNavigateToBudget,
  onAskAIItinerary
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  // New item form state
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [time, setTime] = useState<string>('09:00');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<'flight' | 'hotel' | 'sightseeing' | 'dining' | 'transport' | 'leisure'>('sightseeing');
  const [location, setLocation] = useState<string>('');
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const currentDay = tripPlan.itineraryDays.find(d => d.dayNumber === selectedDayNumber) || tripPlan.itineraryDays[0];

  // Category Icon & Color Mapping
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'flight':
        return { icon: Plane, bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600', label: 'Flight' };
      case 'hotel':
        return { icon: Building2, bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-700', label: 'Accommodation' };
      case 'dining':
        return { icon: Utensils, bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', label: 'Food & Dining' };
      case 'transport':
        return { icon: Bus, bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-600', label: 'Transit / Transfer' };
      case 'leisure':
        return { icon: Sparkles, bg: 'bg-pink-100 text-pink-800 border-pink-300', dot: 'bg-pink-600', label: 'Leisure / Rest' };
      case 'sightseeing':
      default:
        return { icon: Compass, bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', label: 'Sightseeing' };
    }
  };

  // Add Day
  const handleAddDay = () => {
    const nextDayNum = tripPlan.itineraryDays.length + 1;
    const lastDate = new Date(tripPlan.startDate || '2026-09-18');
    lastDate.setDate(lastDate.getDate() + (nextDayNum - 1));
    const dateStr = lastDate.toISOString().split('T')[0];

    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      date: dateStr,
      title: `Day ${nextDayNum} - Exploration & Highlights`,
      items: []
    };

    onUpdateTripPlan({
      ...tripPlan,
      itineraryDays: [...tripPlan.itineraryDays, newDay]
    });
    setSelectedDayNumber(nextDayNum);
  };

  // Delete Day
  const handleDeleteDay = (dayNum: number) => {
    if (tripPlan.itineraryDays.length <= 1) return;
    const updatedDays = tripPlan.itineraryDays
      .filter(d => d.dayNumber !== dayNum)
      .map((d, idx) => ({ ...d, dayNumber: idx + 1 }));

    onUpdateTripPlan({
      ...tripPlan,
      itineraryDays: updatedDays
    });
    setSelectedDayNumber(1);
  };

  // Save Activity Item
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ItineraryItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      day: selectedDayNumber,
      timeSlot,
      time,
      title,
      category,
      location,
      cost: Number(cost) || 0,
      notes
    };

    const updatedDays = tripPlan.itineraryDays.map(d => {
      if (d.dayNumber === selectedDayNumber) {
        let updatedItems = [...d.items];
        if (editingItem) {
          updatedItems = updatedItems.map(item => item.id === editingItem.id ? newItem : item);
        } else {
          updatedItems.push(newItem);
        }
        // sort by time if provided
        updatedItems.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        return { ...d, items: updatedItems };
      }
      return d;
    });

    onUpdateTripPlan({
      ...tripPlan,
      itineraryDays: updatedDays
    });

    // Reset modal
    setEditingItem(null);
    setTitle('');
    setLocation('');
    setCost(0);
    setNotes('');
    setShowAddModal(false);
  };

  // Delete Activity Item
  const handleDeleteActivity = (itemId: string) => {
    const updatedDays = tripPlan.itineraryDays.map(d => {
      if (d.dayNumber === selectedDayNumber) {
        return { ...d, items: d.items.filter(i => i.id !== itemId) };
      }
      return d;
    });
    onUpdateTripPlan({ ...tripPlan, itineraryDays: updatedDays });
  };

  // Open Edit
  const handleOpenEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setTimeSlot(item.timeSlot);
    setTime(item.time || '09:00');
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location || '');
    setCost(item.cost || 0);
    setNotes(item.notes || '');
    setShowAddModal(true);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tripPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Horizon-Itinerary-${tripPlan.destinationCity || 'Trip'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate day total cost
  const dayTotalCost = (currentDay?.items || []).reduce((sum, item) => sum + (item.cost || 0), 0);
  const entireTripActivityCost = tripPlan.itineraryDays.reduce((sum, day) => 
    sum + day.items.reduce((s, item) => s + (item.cost || 0), 0), 0
  );

  return (
    <div className="space-y-6">
      
      {/* Trip Header & Overview Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-amber-50 text-amber-600 font-bold">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {tripPlan.title || `${tripPlan.destinationCity || 'Global'} Holiday Itinerary`}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{tripPlan.startDate} to {tripPlan.endDate}</span>
                  <span>•</span>
                  <span>{tripPlan.itineraryDays.length} Days Plan</span>
                  <span>•</span>
                  <span>{tripPlan.travelersCount} Traveler{tripPlan.travelersCount > 1 ? 's' : ''}</span>
                  {tripPlan.linkedHoliday && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        Holiday: {tripPlan.linkedHoliday.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAskAIItinerary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Auto-Build Days</span>
            </button>

            <button
              onClick={onNavigateToBudget}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>View Budget Sync</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Download Itinerary JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Horizontal Tab Selector */}
        <div className="pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {tripPlan.itineraryDays.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              const itemCount = day.items.length;
              return (
                <button
                  key={`day-tab-${day.dayNumber}`}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`flex flex-col text-left px-3.5 py-2 rounded-md transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <span>Day {day.dayNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {itemCount}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {day.date || `Day ${day.dayNumber}`}
                  </span>
                </button>
              );
            })}

            {/* Add New Day Button */}
            <button
              onClick={handleAddDay}
              className="flex items-center gap-1 px-3 py-2 rounded border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 text-xs font-semibold shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
          </div>

          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[11px] text-slate-400 block">Day Activity Cost</span>
            <span className="text-sm font-bold text-slate-800">
              {formatCurrency(dayTotalCost, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day View & Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        
        {/* Day Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
              Timeline Schedule • Day {currentDay?.dayNumber || 1}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {currentDay?.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setTitle('');
                setLocation('');
                setCost(0);
                setNotes('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Activity to Day {selectedDayNumber}</span>
            </button>

            {tripPlan.itineraryDays.length > 1 && (
              <button
                onClick={() => handleDeleteDay(selectedDayNumber)}
                className="p-2 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                title="Delete this entire day"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Vertical Timeline Nodes */}
        <div className="pt-6">
          {(!currentDay?.items || currentDay.items.length === 0) ? (
            <div className="py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700 text-sm">No scheduled events for this day yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add flights, hotel check-ins, local sightseeing monuments, or authentic restaurants to plan your daily schedule.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Activity</span>
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentDay.items.map((item, index) => {
                const style = getCategoryStyles(item.category);
                const IconComponent = style.icon;

                return (
                  <div key={item.id} className="relative group">
                    {/* Node Dot on Timeline */}
                    <div className={`absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full border-2 border-white ${style.dot} shadow-sm ring-2 ring-slate-100`}></div>

                    {/* Event Card */}
                    <div className="bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-blue-300 p-4 transition-all hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        
                        {/* Event Content */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.time || 'Flexible'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${style.bg}`}>
                              <IconComponent className="w-3 h-3" />
                              {style.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.timeSlot}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mt-1">
                            {item.title}
                          </h4>

                          {item.location && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.location}</span>
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-xs text-slate-600 bg-white/80 p-2 rounded border border-slate-100 mt-2">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Cost & Management Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          {item.cost > 0 && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Est. Cost</span>
                              <span className="text-sm font-bold text-slate-900">
                                {formatCurrency(item.cost, currency)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Edit item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(item.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              {editingItem ? 'Edit Itinerary Activity' : `Add Activity to Day ${selectedDayNumber}`}
            </h3>

            <form onSubmit={handleSaveActivity} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Senso-ji Temple & Festive Market"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="sightseeing">Sightseeing / Attraction</option>
                    <option value="flight">Flight / Departure</option>
                    <option value="hotel">Hotel / Check-in</option>
                    <option value="dining">Food & Dining</option>
                    <option value="transport">Transit / Train / Bus</option>
                    <option value="leisure">Leisure / Free Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as any)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specific Time (24h)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Cost (SGD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asakusa, Taito City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Tips
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pre-booked tickets required. Best visited during sunset."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
