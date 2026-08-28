/**
 * Horizon Planner - Main Vanilla JS Application (app.js)
 * -------------------------------------------------------------
 * Designed for learners who know HTML and are exploring JavaScript.
 * 
 * Features:
 * 1. Fetching global public holidays
 * 2. Generating real deep-links for flights and hotels
 * 3. Managing a day-by-day Itinerary Planner with activity items
 * 4. Real-time dynamic Budget Calculator with auto-synced activity costs
 */

// Global State Object
const appState = {
  selectedCountry: 'JP',
  selectedYear: 2026,
  destinationCity: 'Tokyo',
  originCode: 'SIN',
  destCode: 'HND',
  departDate: '2026-09-18',
  returnDate: '2026-09-22',
  currency: 'SGD',
  currencyRate: 1.0,
  travelers: 1,
  targetBudget: 2200,
  itinerary: [
    {
      dayNumber: 1,
      date: '2026-09-18',
      title: 'Arrival & Welcome Dinner',
      items: [
        { id: 1, time: '09:00', title: 'Arrival at Airport', category: 'flight', cost: 0 },
        { id: 2, time: '14:00', title: 'Hotel Check-in & Rest', category: 'hotel', cost: 0 },
        { id: 3, time: '18:30', title: 'Welcome Holiday Dinner', category: 'dining', cost: 65 }
      ]
    },
    {
      dayNumber: 2,
      date: '2026-09-19',
      title: 'Iconic Landmarks & Sightseeing',
      items: [
        { id: 4, time: '10:00', title: 'Historic Shrine & Temple Tour', category: 'sightseeing', cost: 25 },
        { id: 5, time: '15:00', title: 'Festive Holiday Market', category: 'sightseeing', cost: 40 },
        { id: 6, time: '19:00', title: 'Traditional Ramen Dinner', category: 'dining', cost: 30 }
      ]
    }
  ],
  budget: {
    flightPerPerson: 520,
    hotelPerNight: 160,
    dailyFoodPerPerson: 60,
    dailyTransitPerPerson: 20,
    shoppingPerPerson: 250,
    emergencyPercent: 10
  }
};

/**
 * 1. Fetch public holidays
 */
async function fetchHolidays(countryCode, year) {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) throw new Error('Network error');
    const holidays = await response.json();
    return holidays;
  } catch (error) {
    console.warn('Could not fetch external API, returning fallback holidays:', error);
    return [
      { date: `${year}-01-01`, name: "New Year's Day", localName: "元日" },
      { date: `${year}-05-03`, name: "Constitution Memorial Day", localName: "憲法記念日" },
      { date: `${year}-09-21`, name: "Respect for the Aged Day", localName: "敬老の日" },
      { date: `${year}-11-03`, name: "Culture Day", localName: "文化の日" }
    ];
  }
}

/**
 * 2. Generate sg.trip.com deep link
 */
function generateTripFlightUrl(origin, dest, depart, returnDate) {
  return `https://sg.trip.com/flights/${origin.toLowerCase()}-to-${dest.toLowerCase()}/tickets-roundtrip?dcity=${origin}&acity=${dest}&ddate=${depart}&rdate=${returnDate}&locale=en-sg`;
}

function generateTripHotelUrl(cityName, checkIn, checkOut) {
  return `https://sg.trip.com/hotels/list?keyword=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&locale=en-sg`;
}

/**
 * 3. Calculate Trip Budget Math
 */
function calculateTripBudget() {
  const travelers = appState.travelers || 1;
  const days = appState.itinerary.length || 4;
  const nights = Math.max(1, days - 1);

  // Sync activity expenses from the itinerary list
  let activityTotal = 0;
  appState.itinerary.forEach(day => {
    day.items.forEach(item => {
      activityTotal += (item.cost || 0);
    });
  });

  const flightTotal = appState.budget.flightPerPerson * travelers;
  const hotelTotal = appState.budget.hotelPerNight * nights;
  const foodTotal = appState.budget.dailyFoodPerPerson * days * travelers;
  const transitTotal = appState.budget.dailyTransitPerPerson * days * travelers;
  const shoppingTotal = appState.budget.shoppingPerPerson * travelers;

  const subtotal = flightTotal + hotelTotal + foodTotal + transitTotal + activityTotal + shoppingTotal;
  const emergencyBuffer = Math.round((subtotal * appState.budget.emergencyPercent) / 100);
  const grandTotal = subtotal + emergencyBuffer;

  return {
    flightTotal,
    hotelTotal,
    foodTotal,
    transitTotal,
    activityTotal,
    shoppingTotal,
    emergencyBuffer,
    grandTotal,
    costPerPerson: Math.round(grandTotal / travelers),
    costPerDay: Math.round(grandTotal / days)
  };
}

// Export functions for browser / modular consumption
if (typeof module !== 'undefined') {
  module.exports = {
    appState,
    fetchHolidays,
    generateTripFlightUrl,
    generateTripHotelUrl,
    calculateTripBudget
  };
}
