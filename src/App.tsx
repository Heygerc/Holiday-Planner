import React, { useState } from 'react';
import { TripPlan, PublicHoliday, LongWeekend, FlightOption, HotelOption, ItineraryDay } from './types';
import { Navbar } from './components/Navbar';
import { HolidayFinder } from './components/HolidayFinder';
import { FlightHotelSearch } from './components/FlightHotelSearch';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { BudgetCalculator } from './components/BudgetCalculator';
import { TravelInsightView } from './components/TravelInsightView';
import { CodeExportModal } from './components/CodeExportModal';
import { Compass, Sparkles, Check, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'holidays' | 'flights-hotels' | 'itinerary' | 'budget' | 'ai-insight'>('holidays');
  const [currency, setCurrency] = useState<string>('SGD');
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Search parameters to pass into FlightHotelSearch
  const [searchParams, setSearchParams] = useState({
    origin: 'SIN',
    dest: 'HND',
    departDate: '2026-09-18',
    returnDate: '2026-09-22',
    cityName: 'Tokyo'
  });

  // Central Trip State
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    id: 'trip-1',
    title: 'Japan Autumn Holiday Getaway',
    destinationCountry: 'Japan',
    destinationCity: 'Tokyo',
    originCity: 'Singapore (SIN)',
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    travelersCount: 2,
    targetBudget: 2400,
    currency: 'SGD',
    linkedHoliday: {
      date: '2026-09-21',
      name: 'Respect for the Aged Day',
      localName: '敬老の日',
      countryCode: 'JP',
      fixed: false,
      global: true,
      counties: null,
      launchYear: null,
      types: ['Public']
    },
    itineraryDays: [
      {
        dayNumber: 1,
        date: '2026-09-18',
        title: 'Arrival & Shibuya / Shinjuku Exploration',
        items: [
          { id: '1', day: 1, timeSlot: 'Morning', time: '08:45', title: 'Flight SQ 638 Singapore to Tokyo Haneda', category: 'flight', location: 'Changi T3 -> Haneda Int.', cost: 0, notes: 'Direct flight, arrives 16:30' },
          { id: '2', day: 1, timeSlot: 'Afternoon', time: '17:30', title: 'Airport Limousine Bus & Hotel Check-in', category: 'transport', location: 'Tokyo Metro / Shinjuku', cost: 35, notes: 'Transit pass validated' },
          { id: '3', day: 1, timeSlot: 'Evening', time: '19:30', title: 'Welcome Holiday Dinner & Omoide Yokocho Stroll', category: 'dining', location: 'Shinjuku, Tokyo', cost: 75, notes: 'Authentic yakitori & local atmosphere' }
        ]
      },
      {
        dayNumber: 2,
        date: '2026-09-19',
        title: 'Historic Asakusa & Festive Holiday Stalls',
        items: [
          { id: '4', day: 2, timeSlot: 'Morning', time: '09:30', title: 'Senso-ji Temple & Nakamise-dori Market', category: 'sightseeing', location: 'Asakusa, Taito City', cost: 15, notes: 'Explore historic Buddhist complex' },
          { id: '5', day: 2, timeSlot: 'Afternoon', time: '13:00', title: 'Traditional Tempura Lunch & Sumida River Cruise', category: 'dining', location: 'Sumida River, Tokyo', cost: 50, notes: 'Scenic water taxi to Odaiba' },
          { id: '6', day: 2, timeSlot: 'Evening', time: '18:00', title: 'TeamLab Borderless Digital Art Museum', category: 'sightseeing', location: 'Azabudai Hills', cost: 45, notes: 'Advance timed-entry pass' }
        ]
      },
      {
        dayNumber: 3,
        date: '2026-09-20',
        title: 'Cultural Gardens & Modern Art Districts',
        items: [
          { id: '7', day: 3, timeSlot: 'Morning', time: '10:00', title: 'Meiji Jingu Shrine & Yoyogi Park', category: 'sightseeing', location: 'Shibuya City', cost: 0, notes: 'Peaceful morning forest walk' },
          { id: '8', day: 3, timeSlot: 'Afternoon', time: '14:30', title: 'Omotesando Architectural Tour & Matcha Cafe', category: 'leisure', location: 'Omotesando', cost: 30, notes: 'Artisan tea ceremony' },
          { id: '9', day: 3, timeSlot: 'Evening', time: '19:00', title: 'Rooftop Skyline Vista at Shibuya Sky', category: 'sightseeing', location: 'Shibuya Scramble Square', cost: 28, notes: 'Sunset golden hour view' }
        ]
      },
      {
        dayNumber: 4,
        date: '2026-09-21',
        title: 'Public Holiday Celebrations & Departure',
        items: [
          { id: '10', day: 4, timeSlot: 'Morning', time: '10:00', title: 'Tsukiji Outer Market & Souvenir Shopping', category: 'dining', location: 'Tsukiji, Chuo City', cost: 40, notes: 'Fresh seafood & local confections' },
          { id: '11', day: 4, timeSlot: 'Afternoon', time: '14:00', title: 'Hotel Checkout & Express Transit to Haneda', category: 'transport', location: 'Tokyo Haneda Airport', cost: 20, notes: 'Duty free shopping' },
          { id: '12', day: 4, timeSlot: 'Evening', time: '17:50', title: 'Return Flight to Singapore', category: 'flight', location: 'Tokyo (HND) -> Singapore (SIN)', cost: 0, notes: 'Safe travels home' }
        ]
      }
    ],
    budget: {
      flightCost: 520,
      hotelCostPerNight: 165,
      dailyFoodCost: 65,
      dailyTransportCost: 22,
      shoppingBudget: 250,
      emergencyBufferPercent: 10
    }
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. When user selects a holiday to plan a trip around
  const handleSelectHolidayForTrip = (holiday: PublicHoliday, longWeekend?: LongWeekend) => {
    const holidayDate = new Date(holiday.date);
    
    // Default 4 days around holiday
    const start = new Date(holidayDate);
    start.setDate(start.getDate() - 1);
    const end = new Date(holidayDate);
    end.setDate(end.getDate() + 2);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const destHubMapping: Record<string, { code: string; city: string }> = {
      JP: { code: 'HND', city: 'Tokyo' },
      SG: { code: 'SIN', city: 'Singapore' },
      KR: { code: 'ICN', city: 'Seoul' },
      TH: { code: 'BKK', city: 'Bangkok' },
      VN: { code: 'SGN', city: 'Ho Chi Minh City' },
      MY: { code: 'KUL', city: 'Kuala Lumpur' },
      ID: { code: 'DPS', city: 'Bali' },
      AU: { code: 'SYD', city: 'Sydney' },
      GB: { code: 'LHR', city: 'London' },
      FR: { code: 'CDG', city: 'Paris' },
      US: { code: 'JFK', city: 'New York' },
      HK: { code: 'HKG', city: 'Hong Kong' },
      TW: { code: 'TPE', city: 'Taipei' }
    };

    const destInfo = destHubMapping[holiday.countryCode] || { code: 'HND', city: 'Tokyo' };

    setSearchParams({
      origin: 'SIN',
      dest: destInfo.code,
      departDate: startStr,
      returnDate: endStr,
      cityName: destInfo.city
    });

    const updatedPlan: TripPlan = {
      ...tripPlan,
      title: `${destInfo.city} Holiday Getaway (${holiday.name})`,
      destinationCountry: holiday.countryCode,
      destinationCity: destInfo.city,
      startDate: startStr,
      endDate: endStr,
      linkedHoliday: holiday,
      itineraryDays: [
        {
          dayNumber: 1,
          date: startStr,
          title: `Arrival in ${destInfo.city} & Neighborhood Orientation`,
          items: [
            { id: `item-arr-1`, day: 1, timeSlot: 'Morning', time: '09:00', title: `Flight Arrival at ${destInfo.city}`, category: 'flight', cost: 0 },
            { id: `item-arr-2`, day: 1, timeSlot: 'Afternoon', time: '14:00', title: 'Hotel Check-in & Downtown Walk', category: 'hotel', cost: 0 },
            { id: `item-arr-3`, day: 1, timeSlot: 'Evening', time: '19:00', title: 'Local Cuisine Welcome Dinner', category: 'dining', cost: 60 }
          ]
        },
        {
          dayNumber: 2,
          date: holiday.date,
          title: `Public Holiday Festivities: ${holiday.name}`,
          items: [
            { id: `item-fest-1`, day: 2, timeSlot: 'Morning', time: '10:00', title: `Experience ${holiday.name} Celebrations & Landmarks`, category: 'sightseeing', cost: 30, notes: holiday.localName ? `Local celebration: ${holiday.localName}` : '' },
            { id: `item-fest-2`, day: 2, timeSlot: 'Afternoon', time: '14:30', title: 'Holiday Food Market & Cultural Walk', category: 'dining', cost: 45 },
            { id: `item-fest-3`, day: 2, timeSlot: 'Evening', time: '19:30', title: 'Festive Sunset Dinner & Nightlife', category: 'leisure', cost: 50 }
          ]
        },
        {
          dayNumber: 3,
          date: endStr,
          title: `Highlights, Souvenirs & Return Departure`,
          items: [
            { id: `item-dep-1`, day: 3, timeSlot: 'Morning', time: '10:00', title: 'Boutique Shopping & Photo Landmarks', category: 'sightseeing', cost: 25 },
            { id: `item-dep-2`, day: 3, timeSlot: 'Afternoon', time: '15:00', title: 'Airport Express Transfer & Departure Check-in', category: 'transport', cost: 25 },
            { id: `item-dep-3`, day: 3, timeSlot: 'Evening', time: '18:00', title: 'Departure Flight Back', category: 'flight', cost: 0 }
          ]
        }
      ]
    };

    setTripPlan(updatedPlan);
    showToast(`Created trip plan around ${holiday.name} in ${destInfo.city}!`);
    setActiveTab('itinerary');
  };

  // 2. Search Trip.com for a specific holiday & country
  const handleSearchTripDotCom = (countryCode: string, countryName: string, date: string) => {
    const destHubMapping: Record<string, { code: string; city: string }> = {
      JP: { code: 'HND', city: 'Tokyo' },
      SG: { code: 'SIN', city: 'Singapore' },
      KR: { code: 'ICN', city: 'Seoul' },
      TH: { code: 'BKK', city: 'Bangkok' },
      VN: { code: 'SGN', city: 'Ho Chi Minh City' },
      MY: { code: 'KUL', city: 'Kuala Lumpur' },
      ID: { code: 'DPS', city: 'Bali' },
      AU: { code: 'SYD', city: 'Sydney' },
      GB: { code: 'LHR', city: 'London' },
      FR: { code: 'CDG', city: 'Paris' },
      US: { code: 'JFK', city: 'New York' },
      HK: { code: 'HKG', city: 'Hong Kong' },
      TW: { code: 'TPE', city: 'Taipei' }
    };

    const destInfo = destHubMapping[countryCode] || { code: 'HND', city: 'Tokyo' };
    const d1 = new Date(date);
    const d2 = new Date(date);
    d2.setDate(d2.getDate() + 4);

    setSearchParams({
      origin: 'SIN',
      dest: destInfo.code,
      departDate: d1.toISOString().split('T')[0],
      returnDate: d2.toISOString().split('T')[0],
      cityName: destInfo.city
    });

    setActiveTab('flights-hotels');
    showToast(`Loaded Trip.com search for ${destInfo.city} on ${date}`);
  };

  // 3. Trigger AI for a holiday
  const handleAskAIForHoliday = (holiday: PublicHoliday, countryName: string) => {
    setTripPlan(prev => ({
      ...prev,
      destinationCountry: countryName,
      linkedHoliday: holiday
    }));
    setActiveTab('ai-insight');
    showToast(`Consulting AI for holiday insights on ${holiday.name}`);
  };

  // 4. Add selected flight to Itinerary & Budget
  const handleAddFlightToItinerary = (flight: FlightOption) => {
    setTripPlan(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        flightCost: flight.price
      }
    }));
    showToast(`Synced flight ${flight.airline} (${flight.flightNumber}) S$${flight.price} with your budget!`);
  };

  // 5. Add selected hotel to Itinerary & Budget
  const handleAddHotelToItinerary = (hotel: HotelOption, nights: number) => {
    setTripPlan(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        hotelCostPerNight: hotel.pricePerNight
      }
    }));
    showToast(`Synced ${hotel.name} S$${hotel.pricePerNight}/night with your budget!`);
  };

  // 6. Import AI-generated days into active itinerary
  const handleImportAIIterary = (suggestedDays: Array<{ dayNumber: number; title: string; activities: string[] }>) => {
    const baseDate = new Date(tripPlan.startDate || '2026-09-18');
    
    const newDays: ItineraryDay[] = suggestedDays.map((d, index) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + index);
      const dateStr = dayDate.toISOString().split('T')[0];

      return {
        dayNumber: d.dayNumber,
        date: dateStr,
        title: d.title,
        items: d.activities.map((act, actIdx) => {
          let category: any = 'sightseeing';
          if (act.toLowerCase().includes('flight') || act.toLowerCase().includes('airport')) category = 'flight';
          else if (act.toLowerCase().includes('hotel') || act.toLowerCase().includes('check-in')) category = 'hotel';
          else if (act.toLowerCase().includes('dinner') || act.toLowerCase().includes('lunch') || act.toLowerCase().includes('breakfast') || act.toLowerCase().includes('food')) category = 'dining';
          else if (act.toLowerCase().includes('transit') || act.toLowerCase().includes('train')) category = 'transport';

          return {
            id: `ai-gen-${d.dayNumber}-${actIdx}`,
            day: d.dayNumber,
            timeSlot: actIdx === 0 ? 'Morning' : actIdx === 1 ? 'Afternoon' : 'Evening',
            time: actIdx === 0 ? '09:30' : actIdx === 1 ? '14:00' : '19:00',
            title: act,
            category: category,
            cost: category === 'dining' ? 45 : category === 'sightseeing' ? 25 : 0
          };
        })
      };
    });

    setTripPlan(prev => ({
      ...prev,
      itineraryDays: newDays
    }));

    showToast(`Successfully imported ${newDays.length}-day AI itinerary into your planner!`);
    setActiveTab('itinerary');
  };

  // 7. Update Budget from Calculator
  const handleUpdateBudget = (updatedBudget: TripPlan['budget'], targetCap?: number) => {
    setTripPlan(prev => ({
      ...prev,
      targetBudget: targetCap !== undefined ? targetCap : prev.targetBudget,
      budget: updatedBudget
    }));
    showToast('Trip budget parameters saved and updated!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* App Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        selectedDestination={tripPlan.destinationCity}
        onOpenCodeModal={() => setShowCodeModal(true)}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Content Area (12-Column Grid / 1280px max) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: Global Holidays Explorer */}
        {activeTab === 'holidays' && (
          <HolidayFinder
            onSelectHolidayForTrip={handleSelectHolidayForTrip}
            onSearchTripDotCom={handleSearchTripDotCom}
            onAskAIForHoliday={handleAskAIForHoliday}
          />
        )}

        {/* TAB 2: Flights & Hotels (sg.trip.com) */}
        {activeTab === 'flights-hotels' && (
          <FlightHotelSearch
            initialOrigin={searchParams.origin}
            initialDestination={searchParams.dest}
            initialDepartDate={searchParams.departDate}
            initialReturnDate={searchParams.returnDate}
            currency={currency}
            onAddFlightToItinerary={handleAddFlightToItinerary}
            onAddHotelToItinerary={handleAddHotelToItinerary}
          />
        )}

        {/* TAB 3: Itinerary Planner */}
        {activeTab === 'itinerary' && (
          <ItineraryPlanner
            tripPlan={tripPlan}
            currency={currency}
            onUpdateTripPlan={setTripPlan}
            onNavigateToBudget={() => setActiveTab('budget')}
            onAskAIItinerary={() => setActiveTab('ai-insight')}
          />
        )}

        {/* TAB 4: Budget Calculator */}
        {activeTab === 'budget' && (
          <BudgetCalculator
            tripPlan={tripPlan}
            currency={currency}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {/* TAB 5: AI Advisor */}
        {activeTab === 'ai-insight' && (
          <TravelInsightView
            tripPlan={tripPlan}
            currency={currency}
            onImportAIIterary={handleImportAIIterary}
          />
        )}
      </main>

      {/* Semantic Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white tracking-tight">Horizon Planner</span>
            <span>— Global Holiday Travel Operating System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Global Holiday Calendar & Travel Architecture</span>
            <span>•</span>
            <button
              onClick={() => setShowCodeModal(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              View 4 Standalone Files
            </button>
          </div>
        </div>
      </footer>

      {/* Code Inspector Modal */}
      <CodeExportModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
}
