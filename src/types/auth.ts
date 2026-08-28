import { TripPlan } from '../types';

export interface SavedItineraryRecord {
  id: string;
  name: string;
  destination: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  savedAt: string;
  tripPlan: TripPlan;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'yahoo' | 'email' | 'guest';
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  savedItineraries: SavedItineraryRecord[];
}
