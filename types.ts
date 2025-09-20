
export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface GCalEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
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