
import { create } from 'zustand';
import { listEvents } from '../services/calendarService';
import type { GCalEvent, UserProfile } from '../types';

interface CalendarState {
  accessToken: string | null;
  tokenExpiry: number | null;
  userProfile: UserProfile | null;
  events: GCalEvent[];
  isLoading: boolean;
  error: string | null;
  setLoginData: (token: string, expiresIn: number, profile: UserProfile) => void;
  logout: () => void;
  fetchEvents: () => Promise<void>;
  setEvents: (events: GCalEvent[]) => void;
  addEvent: (event: GCalEvent) => void;
  updateEvent: (event: GCalEvent) => void;
  removeEvent: (eventId: string) => void;
  checkTokenExpiry: () => void;
}

const useCalendarStore = create<CalendarState>((set, get) => ({
  accessToken: localStorage.getItem('accessToken'),
  tokenExpiry: localStorage.getItem('tokenExpiry') ? parseInt(localStorage.getItem('tokenExpiry')!, 10) : null,
  userProfile: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')!) : null,
  events: [],
  isLoading: false,
  error: null,

  setLoginData: (token, expiresIn, profile) => {
    const expiryTime = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    localStorage.setItem('userProfile', JSON.stringify(profile));
    set({ accessToken: token, tokenExpiry: expiryTime, userProfile: profile, error: null });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userProfile');
    set({ accessToken: null, tokenExpiry: null, userProfile: null, events: [] });
  },

  fetchEvents: async () => {
    const { accessToken } = get();
    if (!accessToken) return;
    set({ isLoading: true, error: null });
    try {
      const events = await listEvents(accessToken);
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      if(error instanceof Error && 'result' in error && (error.result as any)?.error?.code === 401) {
        get().logout();
      }
      set({ error: 'Failed to fetch calendar events.', isLoading: false });
    }
  },
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set(state => ({ events: [...state.events, event] })),
  updateEvent: (event) => set(state => ({ events: state.events.map(e => e.id === event.id ? event : e) })),
  removeEvent: (eventId) => set(state => ({ events: state.events.filter(e => e.id !== eventId) })),

  checkTokenExpiry: () => {
    const { tokenExpiry } = get();
    if (tokenExpiry && new Date().getTime() > tokenExpiry) {
      get().logout();
    }
  },
}));

export default useCalendarStore;
