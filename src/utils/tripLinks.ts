import { FlightOption, HotelOption } from '../types';

/**
 * Builds direct deep-linking URLs to sg.trip.com
 */
export function buildTripDotComFlightUrl(params: {
  originCode: string;
  destCode: string;
  departDate: string;
  returnDate?: string;
  cabinClass?: string;
  adults?: number;
}): string {
  const { originCode, destCode, departDate, returnDate, cabinClass = 'economy', adults = 1 } = params;
  const baseUrl = 'https://sg.trip.com/flights';
  
  if (returnDate) {
    return `${baseUrl}/${originCode.toLowerCase()}-to-${destCode.toLowerCase()}/tickets-roundtrip?dcity=${originCode.toUpperCase()}&acity=${destCode.toUpperCase()}&ddate=${departDate}&rdate=${returnDate}&class=${cabinClass}&adult=${adults}&locale=en-sg`;
  }
  
  return `${baseUrl}/${originCode.toLowerCase()}-to-${destCode.toLowerCase()}/tickets-oneway?dcity=${originCode.toUpperCase()}&acity=${destCode.toUpperCase()}&ddate=${departDate}&class=${cabinClass}&adult=${adults}&locale=en-sg`;
}

export function buildTripDotComHotelUrl(params: {
  cityName: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  rooms?: number;
}): string {
  const { cityName, checkIn, checkOut, guests = 2, rooms = 1 } = params;
  const encodedCity = encodeURIComponent(cityName);
  return `https://sg.trip.com/hotels/list?keyword=${encodedCity}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${guests}&roomNum=${rooms}&locale=en-sg`;
}

export const AIRPORT_HUBS: Record<string, { code: string; name: string; city: string; country: string; flag: string }> = {
  SIN: { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  HND: { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  NRT: { code: 'NRT', name: 'Narita Airport', city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  KIX: { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan', flag: '🇯🇵' },
  ICN: { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', flag: '🇰🇷' },
  BKK: { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭' },
  HKG: { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰' },
  TPE: { code: 'TPE', name: 'Taoyuan International', city: 'Taipei', country: 'Taiwan', flag: '🇹🇼' },
  LHR: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  CDG: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', flag: '🇫🇷' },
  SYD: { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  JFK: { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'United States', flag: '🇺🇸' },
  SFO: { code: 'SFO', name: 'San Francisco Int.', city: 'San Francisco', country: 'United States', flag: '🇺🇸' },
  DPS: { code: 'DPS', name: 'Ngurah Rai (Bali)', city: 'Bali', country: 'Indonesia', flag: '🇮🇩' },
  KUL: { code: 'KUL', name: 'Kuala Lumpur Int.', city: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾' },
  FCO: { code: 'FCO', name: 'Fiumicino Airport', city: 'Rome', country: 'Italy', flag: '🇮🇹' },
  ZRH: { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', flag: '🇨🇭' }
};

export function getSampleFlights(originCode: string, destCode: string, departDate: string, returnDate?: string): FlightOption[] {
  const origin = AIRPORT_HUBS[originCode] || { code: originCode, city: originCode };
  const dest = AIRPORT_HUBS[destCode] || { code: destCode, city: destCode };

  const flightTemplates = [
    {
      airline: 'Singapore Airlines',
      airlineCode: 'SQ',
      flightNumber: 'SQ 638',
      departureTime: '08:45',
      arrivalTime: '16:30',
      duration: '7h 45m',
      stops: 0,
      basePrice: 520,
      cabinClass: 'Economy' as const
    },
    {
      airline: 'Japan Airlines (JAL)',
      airlineCode: 'JL',
      flightNumber: 'JL 036',
      departureTime: '11:20',
      arrivalTime: '19:15',
      duration: '7h 55m',
      stops: 0,
      basePrice: 560,
      cabinClass: 'Economy' as const
    },
    {
      airline: 'Scoot / Low Cost',
      airlineCode: 'TR',
      flightNumber: 'TR 898',
      departureTime: '01:10',
      arrivalTime: '08:55',
      duration: '7h 45m',
      stops: 0,
      basePrice: 310,
      cabinClass: 'Economy' as const
    },
    {
      airline: 'Cathay Pacific',
      airlineCode: 'CX',
      flightNumber: 'CX 714',
      departureTime: '14:30',
      arrivalTime: '23:45',
      duration: '9h 15m',
      stops: 1,
      basePrice: 430,
      cabinClass: 'Economy' as const
    },
    {
      airline: 'Emirates / Premier Flagship',
      airlineCode: 'EK',
      flightNumber: 'EK 348',
      departureTime: '21:30',
      arrivalTime: '06:10',
      duration: '8h 40m',
      stops: 0,
      basePrice: 780,
      cabinClass: 'Premium Economy' as const
    }
  ];

  return flightTemplates.map((t, idx) => ({
    id: `flight-${originCode}-${destCode}-${idx}`,
    airline: t.airline,
    airlineCode: t.airlineCode,
    flightNumber: t.flightNumber,
    origin: `${origin.city} (${originCode})`,
    destination: `${dest.city} (${destCode})`,
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    duration: t.duration,
    stops: t.stops,
    price: t.basePrice,
    currency: 'SGD',
    cabinClass: t.cabinClass,
    tripDotComUrl: buildTripDotComFlightUrl({
      originCode,
      destCode,
      departDate: departDate || '2026-09-01',
      returnDate: returnDate,
      cabinClass: t.cabinClass.toLowerCase()
    })
  }));
}

export function getSampleHotels(cityName: string, checkIn: string, checkOut: string): HotelOption[] {
  const city = cityName || 'Tokyo';
  const hotels = [
    {
      name: `${city} Grand Horizon Luxury Hotel & Spa`,
      stars: 5,
      rating: 4.9,
      reviewsCount: 3420,
      pricePerNight: 260,
      neighborhood: 'Central City / Financial & Cultural District',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      amenities: ['Free High-Speed WiFi', 'Infinity Pool', 'Breakfast Included', 'Near Metro Station', '24h Concierge']
    },
    {
      name: `The Urban Heritage Boutique Hotel ${city}`,
      stars: 4,
      rating: 4.7,
      reviewsCount: 1850,
      pricePerNight: 165,
      neighborhood: 'Old Town & Historic Promenade',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
      amenities: ['Free WiFi', 'Rooftop Bar', 'Complimentary Coffee', 'Fitness Center']
    },
    {
      name: `${city} Metro Parkside Modern Suites`,
      stars: 4,
      rating: 4.6,
      reviewsCount: 2200,
      pricePerNight: 130,
      neighborhood: 'Parkside & Transit Hub',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
      amenities: ['Free WiFi', 'Kitchenette', 'Laundry Facilities', '2 min to Train']
    },
    {
      name: `Solace Garden Retreat & Onsen ${city}`,
      stars: 5,
      rating: 4.9,
      reviewsCount: 980,
      pricePerNight: 310,
      neighborhood: 'Scenic Hillside / Botanical Gardens',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
      amenities: ['Thermal Onsen/Spa', 'Gourmet Dining', 'Garden View', 'Airport Shuttle']
    }
  ];

  return hotels.map((h, idx) => ({
    id: `hotel-${city}-${idx}`,
    name: h.name,
    city: city,
    country: 'International',
    stars: h.stars,
    rating: h.rating,
    reviewsCount: h.reviewsCount,
    pricePerNight: h.pricePerNight,
    currency: 'SGD',
    image: h.image,
    neighborhood: h.neighborhood,
    amenities: h.amenities,
    tripDotComUrl: buildTripDotComHotelUrl({
      cityName: city,
      checkIn: checkIn || '2026-09-01',
      checkOut: checkOut || '2026-09-05'
    })
  }));
}

export const CURRENCY_RATES: Record<string, { symbol: string; rateFromSGD: number; name: string }> = {
  SGD: { symbol: 'S$', rateFromSGD: 1.0, name: 'Singapore Dollar' },
  USD: { symbol: '$', rateFromSGD: 0.74, name: 'US Dollar' },
  EUR: { symbol: '€', rateFromSGD: 0.69, name: 'Euro' },
  GBP: { symbol: '£', rateFromSGD: 0.58, name: 'British Pound' },
  JPY: { symbol: '¥', rateFromSGD: 115.2, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', rateFromSGD: 1.14, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', rateFromSGD: 1.02, name: 'Canadian Dollar' },
  HKD: { symbol: 'HK$', rateFromSGD: 5.82, name: 'Hong Kong Dollar' },
  MYR: { symbol: 'RM', rateFromSGD: 3.32, name: 'Malaysian Ringgit' },
  THB: { symbol: '฿', rateFromSGD: 26.8, name: 'Thai Baht' }
};

export function formatCurrency(amountInSGD: number, targetCurrency: string = 'SGD'): string {
  const info = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES['SGD'];
  const converted = amountInSGD * info.rateFromSGD;
  
  if (targetCurrency === 'JPY' || targetCurrency === 'THB') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
