
import { GoogleGenAI } from '@google/genai';
import type { GCalEvent } from '../types';

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. AI features will not work. Make sure to set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Removed deprecated and unused model definition.
// According to the guidelines, models should not be defined this way, and the model name should be passed directly to `generateContent`.
function formatEventsForPrompt(events: GCalEvent[]): string {
  if (!events || events.length === 0) {
    return 'The user has no upcoming events.';
  }
  return events
    .map(event => `- "${event.summary}" at ${new Date(event.start.dateTime).toLocaleString()}`)
    .join('\n');
}

export async function summarizeEvents(events: GCalEvent[]): Promise<string> {
  const prompt = `
    You are a helpful assistant. Summarize the user's upcoming calendar events in a friendly and concise way.
    Today's date is ${new Date().toLocaleDateString()}.
    Here are the events:
    ${formatEventsForPrompt(events)}

    Provide a brief summary of the upcoming schedule.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error summarizing events:", error);
    return "Sorry, I couldn't summarize the events right now.";
  }
}

export async function suggestTime(events: GCalEvent[], task: string): Promise<string> {
  const prompt = `
    You are a scheduling assistant. A user wants to find time for a task.
    Analyze their calendar and suggest 2-3 specific time slots.
    Today's date is ${new Date().toLocaleDateString()}.
    The user's request is: "${task}"
    Here is their current schedule:
    ${formatEventsForPrompt(events)}

    Suggest a few optimal time slots for their task, considering their existing schedule.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error suggesting time:", error);
    return "Sorry, I couldn't find a suitable time right now.";
  }
}

export async function generateDescription(title: string): Promise<string> {
  const prompt = `
    You are an event planning assistant.
    Generate a concise and professional event description for a calendar event with the title: "${title}".
    The description should be a short paragraph.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "";
  }
}

export async function answerScheduleQuestion(events: GCalEvent[], question: string): Promise<string> {
  const prompt = `
    You are a personal calendar assistant. Answer the user's question based on their calendar.
    Today's date is ${new Date().toLocaleDateString()}.
    The user's question is: "${question}"
    Here is their calendar data:
    ${formatEventsForPrompt(events)}

    Provide a direct and helpful answer to their question.
  `;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error answering question:", error);
    return "Sorry, I couldn't answer that question right now.";
  }
}
