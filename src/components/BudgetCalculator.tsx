import React, { useState } from 'react';
import { TripPlan } from '../types';
import { formatCurrency, CURRENCY_RATES } from '../utils/tripLinks';
import { 
  Calculator, DollarSign, Plane, Building2, Utensils, 
  Bus, Compass, ShoppingBag, ShieldAlert, Sparkles, 
  ArrowUpRight, Download, RefreshCw, CheckCircle, AlertTriangle 
} from 'lucide-react';

interface BudgetCalculatorProps {
  tripPlan: TripPlan;
  currency: string;
  onUpdateBudget: (updatedBudget: TripPlan['budget'], targetBudget?: number) => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  tripPlan,
  currency,
  onUpdateBudget
}) => {
  const travelers = tripPlan.travelersCount || 1;
  const daysCount = tripPlan.itineraryDays.length || 4;
  const nightsCount = Math.max(1, daysCount - 1);

  // Extract synced activity costs from itinerary
  const syncedActivityCost = tripPlan.itineraryDays.reduce((sum, day) => 
    sum + day.items.reduce((s, item) => s + (item.cost || 0), 0), 0
  );

  const [flightCost, setFlightCost] = useState<number>(tripPlan.budget.flightCost || 520);
  const [hotelCostPerNight, setHotelCostPerNight] = useState<number>(tripPlan.budget.hotelCostPerNight || 160);
  const [dailyFoodCost, setDailyFoodCost] = useState<number>(tripPlan.budget.dailyFoodCost || 60);
  const [dailyTransportCost, setDailyTransportCost] = useState<number>(tripPlan.budget.dailyTransportCost || 20);
  const [shoppingBudget, setShoppingBudget] = useState<number>(tripPlan.budget.shoppingBudget || 250);
  const [emergencyBufferPercent, setEmergencyBufferPercent] = useState<number>(tripPlan.budget.emergencyBufferPercent || 10);
  const [targetCap, setTargetCap] = useState<number>(tripPlan.targetBudget || 2200);

  // Calculations
  const totalFlights = flightCost * travelers;
  const totalHotels = hotelCostPerNight * nightsCount;
  const totalFood = dailyFoodCost * daysCount * travelers;
  const totalTransport = dailyTransportCost * daysCount * travelers;
  const totalActivities = syncedActivityCost;
  const totalShopping = shoppingBudget * travelers;

  const subtotal = totalFlights + totalHotels + totalFood + totalTransport + totalActivities + totalShopping;
  const emergencyAmount = Math.round((subtotal * emergencyBufferPercent) / 100);
  const grandTotal = subtotal + emergencyAmount;

  const costPerTraveler = Math.round(grandTotal / travelers);
  const costPerDay = Math.round(grandTotal / daysCount);

  const budgetDifference = targetCap - grandTotal;
  const isUnderBudget = budgetDifference >= 0;
  const budgetUtilization = Math.min(100, Math.round((grandTotal / (targetCap || 1)) * 100));

  // Category shares for the visual bar
  const categories = [
    { name: 'Flights', amount: totalFlights, color: 'bg-blue-600', icon: Plane },
    { name: 'Lodging', amount: totalHotels, color: 'bg-slate-700', icon: Building2 },
    { name: 'Dining', amount: totalFood, color: 'bg-emerald-600', icon: Utensils },
    { name: 'Activities', amount: totalActivities, color: 'bg-amber-500', icon: Compass },
    { name: 'Transit', amount: totalTransport, color: 'bg-purple-600', icon: Bus },
    { name: 'Shopping', amount: totalShopping, color: 'bg-pink-600', icon: ShoppingBag },
    { name: 'Buffer', amount: emergencyAmount, color: 'bg-rose-500', icon: ShieldAlert }
  ];

  // Save changes back to parent
  const handleSaveBudget = () => {
    onUpdateBudget({
      flightCost,
      hotelCostPerNight,
      dailyFoodCost,
      dailyTransportCost,
      shoppingBudget,
      emergencyBufferPercent
    }, targetCap);
  };

  // Preset travel tiers
  const applyPreset = (tier: 'budget' | 'comfort' | 'luxury') => {
    if (tier === 'budget') {
      setFlightCost(320);
      setHotelCostPerNight(85);
      setDailyFoodCost(35);
      setDailyTransportCost(12);
      setShoppingBudget(100);
      setTargetCap(1300);
    } else if (tier === 'comfort') {
      setFlightCost(540);
      setHotelCostPerNight(165);
      setDailyFoodCost(65);
      setDailyTransportCost(22);
      setShoppingBudget(300);
      setTargetCap(2400);
    } else if (tier === 'luxury') {
      setFlightCost(980);
      setHotelCostPerNight(380);
      setDailyFoodCost(140);
      setDailyTransportCost(55);
      setShoppingBudget(800);
      setTargetCap(5000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Status Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-emerald-50 text-emerald-600 font-bold">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Trip Budget Architect & Calculator
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Real-time dynamic spending projection for {daysCount} Days / {nightsCount} Nights in {tripPlan.destinationCity || 'Destination'} ({travelers} Traveler{travelers > 1 ? 's' : ''}).
                </p>
              </div>
            </div>
          </div>

          {/* Travel Style Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Presets:</span>
            <button
              onClick={() => applyPreset('budget')}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Backpacker
            </button>
            <button
              onClick={() => applyPreset('comfort')}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
            >
              Comfort / Modern
            </button>
            <button
              onClick={() => applyPreset('luxury')}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              Luxury 5★
            </button>
          </div>
        </div>

        {/* Primary Budget Metric Cards */}
        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Estimated Cost */}
          <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Total Projected Cost
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-1 text-white">
                {formatCurrency(grandTotal, currency)}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              Includes {emergencyBufferPercent}% emergency buffer
            </span>
          </div>

          {/* Cost Per Traveler */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                Cost Per Traveler
              </span>
              <div className="text-2xl font-bold mt-1 text-slate-900">
                {formatCurrency(costPerTraveler, currency)}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">
              For {travelers} total traveler{travelers > 1 ? 's' : ''}
            </span>
          </div>

          {/* Daily Average Cost */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                Daily Average Spending
              </span>
              <div className="text-2xl font-bold mt-1 text-slate-900">
                {formatCurrency(costPerDay, currency)}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">
              Across {daysCount} total days
            </span>
          </div>

          {/* Target Cap & Budget Health */}
          <div className={`rounded-lg p-4 border flex flex-col justify-between ${
            isUnderBudget ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-700 font-semibold">
                  Budget Target
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  isUnderBudget ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}>
                  {isUnderBudget ? 'Under Cap' : 'Exceeds Cap'}
                </span>
              </div>
              <div className="text-2xl font-bold mt-1 text-slate-900">
                {formatCurrency(targetCap, currency)}
              </div>
            </div>
            <span className={`text-[10px] font-semibold mt-2 ${isUnderBudget ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isUnderBudget ? `+${formatCurrency(budgetDifference, currency)} surplus remaining` : `-${formatCurrency(Math.abs(budgetDifference), currency)} over target`}
            </span>
          </div>
        </div>

        {/* Visual Spending Distribution Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Spending Distribution</span>
            <span className="text-slate-500">{subtotal > 0 ? '100% Allocated' : '0%'}</span>
          </div>

          {/* Multi-segment Colored Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {categories.map((cat, i) => {
              const pct = subtotal > 0 ? (cat.amount / grandTotal) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={i}
                  className={`${cat.color} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${cat.name}: ${formatCurrency(cat.amount, currency)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend Grid */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {categories.map((cat, i) => {
              const pct = subtotal > 0 ? ((cat.amount / grandTotal) * 100).toFixed(1) : '0';
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-xs ${cat.color}`}></div>
                  <span className="text-slate-600 font-medium">{cat.name}:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(cat.amount, currency)}</span>
                  <span className="text-slate-400 text-[10px]">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Category Expense Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-200">
          Expense Category Breakdown & Custom Modifiers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          
          {/* 1. Flights */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">Flight Tickets</span>
              </div>
              <span className="text-xs text-slate-500">Per Person</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">S$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={flightCost}
                onChange={(e) => setFlightCost(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{travelers} Traveler{travelers > 1 ? 's' : ''} total:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalFlights, currency)}</span>
            </div>
          </div>

          {/* 2. Hotel / Lodging */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-sm text-slate-900">Lodging & Hotels</span>
              </div>
              <span className="text-xs text-slate-500">Per Night</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">S$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={hotelCostPerNight}
                onChange={(e) => setHotelCostPerNight(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{nightsCount} Night{nightsCount > 1 ? 's' : ''} total:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalHotels, currency)}</span>
            </div>
          </div>

          {/* 3. Food & Dining */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">Food & Dining</span>
              </div>
              <span className="text-xs text-slate-500">Daily / Person</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">S$</span>
              <input
                type="number"
                min="0"
                step="5"
                value={dailyFoodCost}
                onChange={(e) => setDailyFoodCost(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{daysCount} Days x {travelers} Pax:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalFood, currency)}</span>
            </div>
          </div>

          {/* 4. Sightseeing / Itinerary Synced */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-sm text-slate-900">Activities & Tickets</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                Auto-Synced
              </span>
            </div>
            <div className="py-1 px-2.5 bg-white border border-slate-300 rounded text-sm font-bold text-slate-900">
              {formatCurrency(totalActivities, currency)}
            </div>
            <div className="text-[11px] text-slate-500">
              Calculated automatically from {tripPlan.itineraryDays.reduce((a, b) => a + b.items.length, 0)} scheduled items in your planner.
            </div>
          </div>

          {/* 5. Local Transport */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-slate-900">Local Transit</span>
              </div>
              <span className="text-xs text-slate-500">Daily / Person</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">S$</span>
              <input
                type="number"
                min="0"
                step="5"
                value={dailyTransportCost}
                onChange={(e) => setDailyTransportCost(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{daysCount} Days total:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalTransport, currency)}</span>
            </div>
          </div>

          {/* 6. Shopping & Souvenirs */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-600" />
                <span className="font-bold text-sm text-slate-900">Shopping & Misc</span>
              </div>
              <span className="text-xs text-slate-500">Per Person</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">S$</span>
              <input
                type="number"
                min="0"
                step="20"
                value={shoppingBudget}
                onChange={(e) => setShoppingBudget(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Total Shopping:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalShopping, currency)}</span>
            </div>
          </div>
        </div>

        {/* Target Budget Cap & Emergency Buffer Slider */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Maximum Target Budget Cap (SGD)
            </label>
            <input
              type="number"
              min="100"
              step="100"
              value={targetCap}
              onChange={(e) => setTargetCap(parseFloat(e.target.value) || 0)}
              className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Emergency Contingency Buffer: {emergencyBufferPercent}%
              </label>
              <span className="text-xs font-bold text-rose-600">
                +{formatCurrency(emergencyAmount, currency)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={emergencyBufferPercent}
              onChange={(e) => setEmergencyBufferPercent(parseInt(e.target.value, 10))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Tight)</span>
              <span>10% (Recommended)</span>
              <span>25% (Safe)</span>
            </div>
          </div>
        </div>

        {/* Save & Apply Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveBudget}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save & Apply Budget Calculation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
