
import type { GCalEvent } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/calendar/v3';

async function handleResponse<T,>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    console.error('Google Calendar API Error:', error);
    const err = new Error(error.error.message || 'An API error occurred');
    (err as any).result = error;
    throw err;
  }
  return response.json();
}

export async function listEvents(token: string): Promise<GCalEvent[]> {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMin.getDate() + 30); // Fetch events for the next 30 days

  const response = await fetch(`${API_BASE_URL}/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await handleResponse<{ items: GCalEvent[] }>(response);
  return data.items;
}

export async function createEvent(token: string, event: Partial<GCalEvent>): Promise<GCalEvent> {
  const response = await fetch(`${API_BASE_URL}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  return handleResponse<GCalEvent>(response);
}

export async function updateEvent(token: string, eventId: string, event: Partial<GCalEvent>): Promise<GCalEvent> {
  const response = await fetch(`${API_BASE_URL}/calendars/primary/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  return handleResponse<GCalEvent>(response);
}

export async function deleteEvent(token: string, eventId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
   if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ error: { message: "Failed to delete event" } }));
    console.error('Google Calendar API Error:', error);
    throw new Error(error.error.message || 'Failed to delete event');
  }
}
