import React, { useState, useEffect } from 'react';
import { PublicHoliday, LongWeekend, CountryInfo } from '../types';
import { NAGER_COUNTRIES } from '../utils/countriesData';
import { 
  Calendar, Search, Sparkles, Plane, MapPin, 
  Clock, ArrowRight, Zap, Info, Filter, CheckCircle2, Globe 
} from 'lucide-react';

interface HolidayFinderProps {
  onSelectHolidayForTrip: (holiday: PublicHoliday, longWeekend?: LongWeekend) => void;
  onSearchTripDotCom: (countryCode: string, countryName: string, date: string) => void;
  onAskAIForHoliday: (holiday: PublicHoliday, countryName: string) => void;
}

export const HolidayFinder: React.FC<HolidayFinderProps> = ({
  onSelectHolidayForTrip,
  onSearchTripDotCom,
  onAskAIForHoliday
}) => {
  const [countries, setCountries] = useState<CountryInfo[]>(NAGER_COUNTRIES);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('JP');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filterLongWeekendsOnly, setFilterLongWeekendsOnly] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'grid' | 'table'>('grid');

  // Load countries on mount
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch('/api/holidays/countries');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCountries(data);
          }
        }
      } catch (e) {
        console.error("Failed to load countries:", e);
      }
    }
    loadCountries();
  }, []);

  // Fetch holidays & long weekends when country or year changes
  useEffect(() => {
    async function loadHolidayData() {
      setLoading(true);
      try {
        const [holidaysRes, lwRes] = await Promise.all([
          fetch(`/api/holidays/${selectedYear}/${selectedCountryCode}`),
          fetch(`/api/holidays/long-weekends/${selectedYear}/${selectedCountryCode}`)
        ]);

        if (holidaysRes.ok) {
          const data = await holidaysRes.json();
          setHolidays(Array.isArray(data) ? data : []);
        }

        if (lwRes.ok) {
          const lwData = await lwRes.json();
          setLongWeekends(Array.isArray(lwData) ? lwData : []);
        }
      } catch (err) {
        console.error("Error loading holiday data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedCountryCode) {
      loadHolidayData();
    }
  }, [selectedCountryCode, selectedYear]);

  const selectedCountryName = countries.find(c => c.countryCode === selectedCountryCode)?.name || selectedCountryCode;

  // Filter holidays
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = 
      holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holiday.localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holiday.date.includes(searchQuery);

    const matchesMonth = selectedMonth === 'all' || 
      new Date(holiday.date).getMonth() + 1 === parseInt(selectedMonth, 10);

    const isNearLongWeekend = longWeekends.some(lw => {
      const hDate = new Date(holiday.date).getTime();
      const sDate = new Date(lw.startDate).getTime();
      const eDate = new Date(lw.endDate).getTime();
      return hDate >= sDate - 86400000 && hDate <= eDate + 86400000;
    });

    const matchesLongWeekendFilter = !filterLongWeekendsOnly || isNearLongWeekend;

    return matchesSearch && matchesMonth && matchesLongWeekendFilter;
  });

  // Calculate day of week & bridge day potential
  const getHolidayMeta = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    const isFriOrMon = dayOfWeek === 'Friday' || dayOfWeek === 'Monday';
    const isThuOrTue = dayOfWeek === 'Thursday' || dayOfWeek === 'Tuesday';
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    let bridgeTip = '';
    if (isFriOrMon) {
      bridgeTip = '3-Day Long Weekend! (No leave required)';
    } else if (isThuOrTue) {
      bridgeTip = dayOfWeek === 'Thursday' ? 'Take Friday off -> 4-Day Mini Break!' : 'Take Monday off -> 4-Day Mini Break!';
    } else if (dayOfWeek === 'Wednesday') {
      bridgeTip = 'Mid-week break (Take 2 days for a 5-day vacation)';
    }

    return { dayOfWeek, isFriOrMon, isThuOrTue, isWeekend, bridgeTip };
  };

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Search & Selection Command Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-blue-50 text-blue-600 font-bold">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Global Holidays Explorer
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Identify upcoming public holidays and long-weekend bridge opportunities worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Country & Year Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Destination Country
                </label>
                <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                  {countries.length} Countries
                </span>
              </div>
              <select
                id="country-select"
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="w-56 sm:w-64 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer shadow-xs"
              >
                {countries.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.name} ({c.countryCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Calendar Year
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-28 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer shadow-xs"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>
          </div>
        </div>

        {/* Popular Country Quick Pills */}
        <div className="pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-thin">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Popular:
          </span>
          {[
            { code: 'JP', name: 'Japan' },
            { code: 'SG', name: 'Singapore' },
            { code: 'KR', name: 'South Korea' },
            { code: 'TH', name: 'Thailand' },
            { code: 'MY', name: 'Malaysia' },
            { code: 'VN', name: 'Vietnam' },
            { code: 'ID', name: 'Indonesia' },
            { code: 'TW', name: 'Taiwan' },
            { code: 'HK', name: 'Hong Kong' },
            { code: 'AU', name: 'Australia' },
            { code: 'NZ', name: 'New Zealand' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'US', name: 'United States' },
            { code: 'FR', name: 'France' },
            { code: 'IT', name: 'Italy' },
            { code: 'DE', name: 'Germany' },
            { code: 'CH', name: 'Switzerland' }
          ].map((pop) => (
            <button
              key={pop.code}
              type="button"
              onClick={() => setSelectedCountryCode(pop.code)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCountryCode === pop.code
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pop.name}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search holiday name or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Month Filter */}
            <div className="flex items-center">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Long Weekend Toggle Button */}
            <button
              onClick={() => setFilterLongWeekendsOnly(!filterLongWeekendsOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                filterLongWeekendsOnly
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bridge Day / Long Weekends</span>
              {longWeekends.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${filterLongWeekendsOnly ? 'bg-amber-600' : 'bg-slate-200'}`}>
                  {longWeekends.length}
                </span>
              )}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-slate-200 rounded overflow-hidden">
            <button
              onClick={() => setActiveView('grid')}
              className={`px-3 py-1.5 text-xs font-medium ${
                activeView === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Card Grid
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 text-xs font-medium ${
                activeView === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Data Table
            </button>
          </div>
        </div>
      </div>

      {/* Strategic Vacation Planner Insight Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-lg p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-white">
              Smart Leave Strategy for {selectedCountryName} in {selectedYear}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Found <strong className="text-amber-400 font-semibold">{filteredHolidays.length} public holidays</strong> and <strong className="text-blue-300 font-semibold">{longWeekends.length} long weekend periods</strong>. Click any holiday below to launch direct flight & hotel searches on sg.trip.com or build a day-by-day itinerary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <span className="text-xs text-slate-400">Total Holidays:</span>
          <span className="px-2.5 py-1 rounded bg-blue-600 font-bold text-xs text-white">
            {holidays.length} Days
          </span>
        </div>
      </div>

      {/* Holiday Listing */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading public holidays for {selectedCountryName}...
          </p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-700">No holidays found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or clearing the month filter.
          </p>
        </div>
      ) : activeView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHolidays.map((holiday, idx) => {
            const meta = getHolidayMeta(holiday.date);
            const holidayDate = new Date(holiday.date);
            const formattedDate = holidayDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={`${holiday.date}-${idx}`}
                className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-4 sm:p-5">
                  
                  {/* Top Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {meta.dayOfWeek}
                    </span>
                    
                    {meta.isFriOrMon && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Long Weekend
                      </span>
                    )}

                    {meta.isThuOrTue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Zap className="w-3 h-3 text-amber-600" />
                        Bridge Opportunity
                      </span>
                    )}
                  </div>

                  {/* Date Heading */}
                  <div className="text-xl font-bold text-slate-900 tracking-tight">
                    {formattedDate}
                  </div>

                  {/* Holiday Title & Local Name */}
                  <h3 className="text-base font-semibold text-blue-900 mt-1 leading-snug">
                    {holiday.name}
                  </h3>
                  {holiday.localName && holiday.localName !== holiday.name && (
                    <p className="text-xs text-slate-500 italic mt-0.5">
                      Local: {holiday.localName}
                    </p>
                  )}

                  {/* Bridge Strategy Note */}
                  {meta.bridgeTip && (
                    <div className="mt-3 p-2 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{meta.bridgeTip}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Plan Itinerary */}
                  <button
                    onClick={() => onSelectHolidayForTrip(holiday)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    title="Build Day-by-Day Itinerary around this holiday"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Plan Trip</span>
                  </button>

                  {/* Search on Trip.com */}
                  <button
                    onClick={() => onSearchTripDotCom(holiday.countryCode, selectedCountryName, holiday.date)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                    title="Find Flights & Hotels for these dates on sg.trip.com"
                  >
                    <Plane className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trip.com</span>
                  </button>

                  {/* Ask AI */}
                  <button
                    onClick={() => onAskAIForHoliday(holiday, selectedCountryName)}
                    className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors"
                    title="Get AI Travel Advice for this holiday"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Day</th>
                <th className="px-4 py-3">Holiday Name</th>
                <th className="px-4 py-3">Local Name</th>
                <th className="px-4 py-3">Type & Bridge Opportunity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredHolidays.map((holiday, idx) => {
                const meta = getHolidayMeta(holiday.date);
                return (
                  <tr key={`${holiday.date}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {holiday.date}
                      <span className="block text-xs font-normal text-slate-500">{meta.dayOfWeek}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-900">
                      {holiday.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">
                      {holiday.localName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {meta.bridgeTip ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Zap className="w-3 h-3 text-amber-600" />
                          {meta.bridgeTip}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Standard Holiday</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectHolidayForTrip(holiday)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        >
                          Plan
                        </button>
                        <button
                          onClick={() => onSearchTripDotCom(holiday.countryCode, selectedCountryName, holiday.date)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                        >
                          Trip.com
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
