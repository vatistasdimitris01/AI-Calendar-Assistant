
import type { GCalEvent, CalendarListEntry } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/calendar/v3';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'An unknown API error occurred.' }}));
    console.error('Google Calendar API Error:', error);
    const err = new Error(error.error.message || 'An API error occurred');
    (err as any).result = error;
    throw err;
  }
  if (response.status === 204) {
      return undefined as T;
  }
  return response.json();
}

/**
 * Fetches events from multiple calendars concurrently.
 * @param token The OAuth2 access token.
 * @param calendarIds An array of calendar IDs to fetch events from.
 * @returns A flattened array of event objects, with each event tagged with its calendarId.
 */
export async function listEvents(token: string, calendarIds: string[]): Promise<GCalEvent[]> {
  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 1);
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + 2);

  const requests = calendarIds.map(calendarId => {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    const url = `${API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;
    
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => handleResponse<{ items: GCalEvent[] }>(res))
    .then(data => (data.items || []).map(event => ({ ...event, calendarId })))
    .catch(error => {
      console.error(`Failed to fetch events for calendar ${calendarId}:`, error);
      return [];
    });
  });

  const results = await Promise.all(requests);
  return results.flat();
}

/**
 * Fetches the user's list of calendars.
 */
export async function listCalendars(token: string): Promise<CalendarListEntry[]> {
    const response = await fetch(`${API_BASE_URL}/users/me/calendarList`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await handleResponse<{ items: CalendarListEntry[] }>(response);
    return data.items;
}

/**
 * Creates a new event.
 */
export async function createEvent(token: string, event: Partial<GCalEvent>, calendarId: string = 'primary'): Promise<GCalEvent> {
    const response = await fetch(`${API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    });
    return handleResponse<GCalEvent>(response);
}

/**
 * Updates an existing event.
 */
export async function updateEvent(token: string, eventId: string, event: Partial<GCalEvent>, calendarId: string = 'primary'): Promise<GCalEvent> {
    const response = await fetch(`${API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    });
    return handleResponse<GCalEvent>(response);
}

/**
 * Deletes an event.
 */
export async function deleteEvent(token: string, eventId: string, calendarId: string = 'primary'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    await handleResponse<void>(response);
}
