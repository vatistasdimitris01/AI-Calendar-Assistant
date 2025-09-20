import { GoogleGenAI, Type } from '@google/genai';
import type { GCalEvent } from '../types';

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. AI features will not work. Make sure to set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
}

const eventCreationSchema = {
    type: Type.OBJECT,
    properties: {
        is_event_creation_request: { 
            type: Type.BOOLEAN, 
            description: "Set to true only if the user is explicitly asking to create, schedule, book, or add a new event to their calendar. Otherwise, set to false." 
        },
        summary: { type: Type.STRING, nullable: true, description: "The title of the event." },
        start_time: { type: Type.STRING, description: "The start time of the event in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss). Infer this from the user's prompt and the current date if necessary.", nullable: true },
        end_time: { type: Type.STRING, description: "The end time of the event in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss). If not specified, infer a sensible duration (e.g., 1 hour after start time).", nullable: true }
    }
};

export async function createEventFromPrompt(prompt: string): Promise<any> {
    const fullPrompt = `
      Analyze the following user request. Your task is to determine if it is a command to create a calendar event.
      - The current date is: ${new Date().toISOString()}.
      - If the user wants to create an event, extract the event details into the specified JSON format.
      - If the user is just asking a question or making a statement that is NOT a request to create an event, set 'is_event_creation_request' to false.
      
      User Request: "${prompt}"
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: eventCreationSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error creating event from prompt:", error);
        throw error;
    }
}
