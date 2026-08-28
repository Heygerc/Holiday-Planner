import { UserProfile, SavedItineraryRecord } from '../types/auth';
import { TripPlan } from '../types';

const AUTH_STORAGE_KEY = 'horizon_planner_user_session';
const SAVED_ITINERARIES_KEY = 'horizon_planner_saved_itineraries';

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveUserSession = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save user session:', err);
  }
};

export const getStoredItineraries = (userEmail?: string): SavedItineraryRecord[] => {
  try {
    const raw = localStorage.getItem(SAVED_ITINERARIES_KEY);
    if (!raw) return [];
    const list: SavedItineraryRecord[] = JSON.parse(raw);
    if (userEmail) {
      // Return records tagged for this user plus generic ones
      return list;
    }
    return list;
  } catch {
    return [];
  }
};

export const saveItineraryRecord = (tripPlan: TripPlan, user?: UserProfile | null): SavedItineraryRecord => {
  const existing = getStoredItineraries();
  
  const record: SavedItineraryRecord = {
    id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: tripPlan.title || `${tripPlan.destinationCity || 'Vacation'} Itinerary`,
    destination: tripPlan.destinationCity || tripPlan.destinationCountry || 'Global Destination',
    countryCode: tripPlan.destinationCountry || 'JP',
    startDate: tripPlan.startDate,
    endDate: tripPlan.endDate,
    savedAt: new Date().toISOString(),
    tripPlan: JSON.parse(JSON.stringify(tripPlan))
  };

  const updated = [record, ...existing.filter(item => item.id !== record.id)];
  try {
    localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save itinerary to localStorage:', err);
  }

  return record;
};

export const deleteStoredItinerary = (recordId: string): SavedItineraryRecord[] => {
  const existing = getStoredItineraries();
  const updated = existing.filter(item => item.id !== recordId);
  try {
    localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete itinerary:', err);
  }
  return updated;
};
