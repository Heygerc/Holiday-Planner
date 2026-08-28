import React, { useState, useEffect } from 'react';
import { FlightOption, HotelOption } from '../types';
import { 
  getSampleFlights, getSampleHotels, AIRPORT_HUBS, 
  buildTripDotComFlightUrl, buildTripDotComHotelUrl, formatCurrency 
} from '../utils/tripLinks';
import { 
  Plane, Building2, Calendar, Users, ExternalLink, 
  Check, ArrowRight, ShieldCheck, Star, MapPin, 
  Wifi, Coffee, Sparkles, Filter, Info, Luggage
} from 'lucide-react';

interface FlightHotelSearchProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDepartDate?: string;
  initialReturnDate?: string;
  currency: string;
  onAddFlightToItinerary: (flight: FlightOption) => void;
  onAddHotelToItinerary: (hotel: HotelOption, nights: number) => void;
}

export const FlightHotelSearch: React.FC<FlightHotelSearchProps> = ({
  initialOrigin = 'SIN',
  initialDestination = 'HND',
  initialDepartDate = '2026-09-18',
  initialReturnDate = '2026-09-22',
  currency,
  onAddFlightToItinerary,
  onAddHotelToItinerary
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'flights' | 'hotels'>('flights');
  
  // Search parameters
  const [originCode, setOriginCode] = useState<string>(initialOrigin);
  const [destCode, setDestCode] = useState<string>(initialDestination);
  const [departDate, setDepartDate] = useState<string>(initialDepartDate);
  const [returnDate, setReturnDate] = useState<string>(initialReturnDate);
  const [travelers, setTravelers] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<'economy' | 'premium' | 'business'>('economy');
  const [hotelCity, setHotelCity] = useState<string>('Tokyo');

  // Filter states
  const [flightStopsFilter, setFlightStopsFilter] = useState<'all' | 'direct' | '1stop'>('all');
  const [hotelStarsFilter, setHotelStarsFilter] = useState<number>(0);

  // Result states
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [addedFlightId, setAddedFlightId] = useState<string | null>(null);
  const [addedHotelId, setAddedHotelId] = useState<string | null>(null);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialOrigin) setOriginCode(initialOrigin);
    if (initialDestination) {
      setDestCode(initialDestination);
      const hub = AIRPORT_HUBS[initialDestination];
      if (hub) setHotelCity(hub.city);
    }
    if (initialDepartDate) setDepartDate(initialDepartDate);
    if (initialReturnDate) setReturnDate(initialReturnDate);
  }, [initialOrigin, initialDestination, initialDepartDate, initialReturnDate]);

  // Execute search
  useEffect(() => {
    const flightResults = getSampleFlights(originCode, destCode, departDate, returnDate);
    setFlights(flightResults);

    const destHub = AIRPORT_HUBS[destCode];
    const cityName = destHub ? destHub.city : hotelCity;
    const hotelResults = getSampleHotels(cityName, departDate, returnDate);
    setHotels(hotelResults);
  }, [originCode, destCode, departDate, returnDate, hotelCity]);

  // Calculate nights
  const calculateNights = () => {
    const d1 = new Date(departDate);
    const d2 = new Date(returnDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 3;
  };
  const nightsCount = calculateNights();

  // Filtered flights
  const filteredFlights = flights.filter(f => {
    if (flightStopsFilter === 'direct') return f.stops === 0;
    if (flightStopsFilter === '1stop') return f.stops === 1;
    return true;
  });

  // Filtered hotels
  const filteredHotels = hotels.filter(h => {
    if (hotelStarsFilter > 0) return h.stars >= hotelStarsFilter;
    return true;
  });

  // Direct Trip.com Search Link
  const globalTripFlightUrl = buildTripDotComFlightUrl({
    originCode,
    destCode,
    departDate,
    returnDate,
    cabinClass,
    adults: travelers
  });

  const globalTripHotelUrl = buildTripDotComHotelUrl({
    cityName: AIRPORT_HUBS[destCode]?.city || hotelCity,
    checkIn: departDate,
    checkOut: returnDate,
    guests: travelers
  });

  return (
    <div className="space-y-6">
      
      {/* High-prominence Segmented Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header & Sub-tab Selector */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500 text-white">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-white">
                Trip.com Integrated Booking Gateway
              </span>
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                Live link sync with sg.trip.com
              </span>
            </div>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-md border border-slate-700">
            <button
              onClick={() => setActiveSubTab('flights')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeSubTab === 'flights' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Flights</span>
            </button>
            <button
              onClick={() => setActiveSubTab('hotels')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeSubTab === 'hotels' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotels</span>
            </button>
          </div>
        </div>

        {/* Segmented Input Form */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Segment 1: Origin & Destination */}
          <div className="pr-0 md:pr-4 space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Route / Cities
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block">From</span>
                <select
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  {Object.values(AIRPORT_HUBS).map((hub) => (
                    <option key={`orig-${hub.code}`} value={hub.code}>
                      {hub.flag} {hub.code} - {hub.city}
                    </option>
                  ))}
                </select>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-3" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block">To</span>
                <select
                  value={destCode}
                  onChange={(e) => {
                    setDestCode(e.target.value);
                    const hub = AIRPORT_HUBS[e.target.value];
                    if (hub) setHotelCity(hub.city);
                  }}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  {Object.values(AIRPORT_HUBS).map((hub) => (
                    <option key={`dest-${hub.code}`} value={hub.code}>
                      {hub.flag} {hub.code} - {hub.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Segment 2: Travel Dates */}
          <div className="pt-3 md:pt-0 md:px-4 space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Travel Dates ({nightsCount} Nights)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Departure</span>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Return</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Segment 3: Travelers & Class */}
          <div className="pt-3 md:pt-0 md:px-4 space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Travelers & Cabin
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Passengers</span>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
                  className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                  <option value={5}>5+ Group</option>
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Class</span>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as any)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="economy">Economy</option>
                  <option value="premium">Prem. Economy</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
          </div>

          {/* Segment 4: Launch Trip.com Direct Search */}
          <div className="pt-3 md:pt-0 md:pl-4 flex flex-col justify-end">
            <a
              href={activeSubTab === 'flights' ? globalTripFlightUrl : globalTripHotelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all text-center"
            >
              <span>Search Live on Trip.com</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="text-[10px] text-slate-400 text-center mt-1">
              Direct deep link to sg.trip.com portal
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Subheader Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter by:</span>
          {activeSubTab === 'flights' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFlightStopsFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${flightStopsFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                All Flights
              </button>
              <button
                onClick={() => setFlightStopsFilter('direct')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${flightStopsFilter === 'direct' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Non-stop Only
              </button>
              <button
                onClick={() => setFlightStopsFilter('1stop')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${flightStopsFilter === '1stop' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                1-Stop
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHotelStarsFilter(0)}
                className={`px-2.5 py-1 rounded text-xs font-medium ${hotelStarsFilter === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                All Stars
              </button>
              <button
                onClick={() => setHotelStarsFilter(4)}
                className={`px-2.5 py-1 rounded text-xs font-medium ${hotelStarsFilter === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                4★ and above
              </button>
              <button
                onClick={() => setHotelStarsFilter(5)}
                className={`px-2.5 py-1 rounded text-xs font-medium ${hotelStarsFilter === 5 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                5★ Luxury
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing {activeSubTab === 'flights' ? filteredFlights.length : filteredHotels.length} options for <strong className="text-slate-800">{AIRPORT_HUBS[destCode]?.city || destCode}</strong>
        </div>
      </div>

      {/* FLIGHT RESULTS VIEW */}
      {activeSubTab === 'flights' && (
        <div className="space-y-3">
          {filteredFlights.map((flight) => {
            const isAdded = addedFlightId === flight.id;
            return (
              <div
                key={flight.id}
                className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Flight Info Zone */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-800 text-xs">
                        {flight.airlineCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {flight.airline}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {flight.flightNumber} • {flight.cabinClass}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        <Luggage className="w-3 h-3 text-slate-500" />
                        23kg Baggage Included
                      </span>
                      {flight.stops === 0 ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Direct
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {flight.stops} Stop
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flight Timing Grid */}
                  <div className="mt-4 grid grid-cols-3 items-center text-center py-2 bg-slate-50 rounded-md border border-slate-100">
                    <div className="text-left px-3">
                      <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                        {flight.departureTime}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{originCode} - {AIRPORT_HUBS[originCode]?.city}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-slate-400 font-medium">{flight.duration}</span>
                      <div className="w-full flex items-center my-1">
                        <div className="h-0.5 bg-slate-300 flex-1"></div>
                        <Plane className="w-3.5 h-3.5 text-blue-600 mx-1 transform rotate-90" />
                        <div className="h-0.5 bg-slate-300 flex-1"></div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} transfer`}
                      </span>
                    </div>

                    <div className="text-right px-3">
                      <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                        {flight.arrivalTime}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{destCode} - {AIRPORT_HUBS[destCode]?.city}</div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Action Zone */}
                <div className="bg-slate-50 lg:w-60 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-center items-center lg:items-end text-center lg:text-right gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Est. Roundtrip / Person</span>
                    <div className="text-2xl font-black text-slate-900">
                      {formatCurrency(flight.price, currency)}
                    </div>
                    <span className="text-[10px] text-slate-400">Taxes & fees included</span>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => {
                        onAddFlightToItinerary(flight);
                        setAddedFlightId(flight.id);
                        setTimeout(() => setAddedFlightId(null), 2500);
                      }}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all ${
                        isAdded 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Planner!</span>
                        </>
                      ) : (
                        <span>+ Add to Planner & Budget</span>
                      )}
                    </button>

                    <a
                      href={flight.tripDotComUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      <span>Book on sg.trip.com</span>
                      <ExternalLink className="w-3 h-3 text-blue-600" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HOTEL RESULTS VIEW */}
      {activeSubTab === 'hotels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHotels.map((hotel) => {
            const isAdded = addedHotelId === hotel.id;
            const totalStayCost = hotel.pricePerNight * nightsCount;

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Hotel Image with Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{hotel.rating} / 5.0</span>
                      <span className="text-slate-300 text-[10px]">({hotel.reviewsCount} reviews)</span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold">
                      {hotel.stars}★ Hotel
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {hotel.name}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{hotel.neighborhood}</span>
                    </div>

                    {/* Amenities Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hotel.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Booking Footer */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{nightsCount} nights total</span>
                    <div className="text-lg font-black text-slate-900">
                      {formatCurrency(hotel.pricePerNight, currency)} <span className="text-xs font-normal text-slate-500">/ night</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Est. Total: {formatCurrency(totalStayCost, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddHotelToItinerary(hotel, nightsCount);
                        setAddedHotelId(hotel.id);
                        setTimeout(() => setAddedHotelId(null), 2500);
                      }}
                      className={`px-3 py-2 rounded text-xs font-bold transition-all ${
                        isAdded 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isAdded ? 'Added!' : '+ Add to Plan'}
                    </button>

                    <a
                      href={hotel.tripDotComUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors"
                      title="View & Book on Trip.com"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
