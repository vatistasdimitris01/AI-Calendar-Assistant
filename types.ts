// FIX: Add global type definition for import.meta.env to resolve TypeScript errors.
// This makes the Vite-specific environment variables type-safe across the application.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_GOOGLE_CLIENT_ID: string;
    }
  }
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface GCalEvent {
  id: string;
  summary?: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  organizer: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  calendarId?: string;
  [key: string]: any;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: GCalEvent;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  backgroundColor: string;
  foregroundColor: string;
  primary?: boolean;
  selected?: boolean;
}