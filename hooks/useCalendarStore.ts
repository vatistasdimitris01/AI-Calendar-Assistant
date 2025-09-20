import { create } from 'zustand';
import { listEvents, listCalendars } from '../services/calendarService';
import type { GCalEvent, UserProfile, CalendarEvent, CalendarListEntry } from '../types';
import type { View } from 'react-big-calendar';

interface CalendarState {
  accessToken: string | null;
  tokenExpiry: number | null;
  userProfile: UserProfile | null;
  events: GCalEvent[];
  calendars: CalendarListEntry[];
  calendarFilters: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  currentDate: Date;
  view: View;
  isSidebarOpen: boolean;
  isEventModalOpen: boolean;
  selectedEvent: Partial<CalendarEvent> | null;
  setLoginData: (token: string, expiresIn: number, profile: UserProfile) => void;
  logout: () => void;
  fetchEvents: () => Promise<void>;
  fetchCalendars: () => Promise<void>;
  toggleCalendarFilter: (calendarId: string) => void;
  addEvent: (event: GCalEvent) => void;
  updateEvent: (event: GCalEvent) => void;
  removeEvent: (eventId: string) => void;
  checkTokenExpiry: () => void;
  setCurrentDate: (date: Date) => void;
  setView: (view: View) => void;
  toggleSidebar: () => void;
  openEventModal: (event?: Partial<CalendarEvent>) => void;
  closeEventModal: () => void;
}

const useCalendarStore = create<CalendarState>((set, get) => ({
  accessToken: localStorage.getItem('accessToken'),
  tokenExpiry: localStorage.getItem('tokenExpiry') ? parseInt(localStorage.getItem('tokenExpiry')!, 10) : null,
  userProfile: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')!) : null,
  events: [],
  calendars: [],
  calendarFilters: {},
  isLoading: false,
  error: null,
  currentDate: new Date(),
  view: 'month',
  isSidebarOpen: window.innerWidth > 1024,
  isEventModalOpen: false,
  selectedEvent: null,

  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setView: (view: View) => set({ view }),
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

  openEventModal: (event) => set({ isEventModalOpen: true, selectedEvent: event || {} }),
  closeEventModal: () => set({ isEventModalOpen: false, selectedEvent: null }),

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
    set({ accessToken: null, tokenExpiry: null, userProfile: null, events: [], calendars: [], calendarFilters: {} });
  },

  fetchEvents: async () => {
    const { accessToken, calendarFilters } = get();
    if (!accessToken) return;

    const selectedCalendarIds = Object.entries(calendarFilters)
        .filter(([, isSelected]) => isSelected)
        .map(([calendarId]) => calendarId);

    if (selectedCalendarIds.length === 0) {
        set({ events: [], isLoading: false });
        return;
    }

    set({ isLoading: true, error: null });
    try {
      const events = await listEvents(accessToken, selectedCalendarIds);
      set({ events, isLoading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      const apiError = (error as any)?.result?.error;
      if (apiError?.code === 401 || (apiError?.code === 403 && apiError?.status === 'PERMISSION_DENIED')) {
        get().logout();
      }
      set({ error: 'Failed to fetch calendar events. Please sign in again.', isLoading: false });
    }
  },
  
  fetchCalendars: async () => {
    const { accessToken } = get();
    if (!accessToken) return;
    try {
      const calendars = await listCalendars(accessToken);
      const initialFilters: Record<string, boolean> = {};
      calendars.forEach(cal => {
          initialFilters[cal.id] = cal.selected ?? cal.primary ?? false;
      });
      set({ calendars, calendarFilters: initialFilters });
      get().fetchEvents(); // Fetch events after calendars are loaded
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  },

  toggleCalendarFilter: (calendarId: string) => {
    set(state => ({
        calendarFilters: {
            ...state.calendarFilters,
            [calendarId]: !state.calendarFilters[calendarId],
        }
    }));
    get().fetchEvents(); // Re-fetch events when a filter is toggled
  },

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