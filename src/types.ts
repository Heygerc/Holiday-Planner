export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface LongWeekend {
  startDate: string;
  endDate: string;
  dayCount: number;
  needBridgeDay: boolean;
  bridgeDays?: string[];
}

export interface CountryInfo {
  countryCode: string;
  name: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  tripDotComUrl: string;
}

export interface HotelOption {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  currency: string;
  image: string;
  neighborhood: string;
  amenities: string[];
  tripDotComUrl: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  date?: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  time?: string;
  title: string;
  category: 'flight' | 'hotel' | 'sightseeing' | 'dining' | 'transport' | 'leisure';
  location?: string;
  cost: number;
  notes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

export interface TripPlan {
  id: string;
  title: string;
  destinationCountry: string;
  destinationCity: string;
  originCity: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  targetBudget: number;
  currency: string;
  linkedHoliday?: PublicHoliday;
  itineraryDays: ItineraryDay[];
  budget: {
    flightCost: number;
    hotelCostPerNight: number;
    dailyFoodCost: number;
    dailyTransportCost: number;
    shoppingBudget: number;
    emergencyBufferPercent: number;
  };
}

export interface TravelInsightResponse {
  summary: string;
  recommendations: string[];
  bestFlightBookingWindow?: string;
  localHolidayHighlights?: string[];
  packingTips?: string[];
  suggestedItineraryDays?: Array<{
    dayNumber: number;
    title: string;
    activities: string[];
  }>;
}
