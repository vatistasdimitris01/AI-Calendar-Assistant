import React, { useState, useEffect } from 'react';
import useCalendarStore from '../hooks/useCalendarStore';
import { createEvent, updateEvent, deleteEvent } from '../services/calendarService';
import { generateDescription } from '../services/geminiService';
import { XIcon, SparklesIcon, TrashIcon } from './icons';

const EventModal: React.FC = () => {
  const {
      accessToken,
      addEvent,
      updateEvent: updateStoreEvent,
      removeEvent,
      isEventModalOpen,
      selectedEvent,
      closeEventModal
  } = useCalendarStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setDescription(selectedEvent.resource?.description || '');
      const toLocalISOString = (date: Date) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
        return localISOTime;
      }
      setStart(selectedEvent.start ? toLocalISOString(selectedEvent.start) : '');
      setEnd(selectedEvent.end ? toLocalISOString(selectedEvent.end) : '');
    }
  }, [selectedEvent]);

  if (!isEventModalOpen) return null;

  const handleGenerateDescription = async () => {
    if (!title) {
        setError('Please enter a title first.');
        return;
    }
    setIsGenerating(true);
    setError('');
    try {
        const generatedDesc = await generateDescription(title);
        setDescription(generatedDesc);
    } catch (e) {
        setError('Failed to generate description.');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const eventData = {
      summary: title,
      description,
      start: { dateTime: new Date(start).toISOString() },
      end: { dateTime: new Date(end).toISOString() },
    };

    setIsSaving(true);
    setError('');
    try {
      if (selectedEvent?.id) {
        const updated = await updateEvent(accessToken, selectedEvent.id, eventData);
        updateStoreEvent(updated);
      } else {
        const created = await createEvent(accessToken, eventData);
        addEvent(created);
      }
      closeEventModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!accessToken || !selectedEvent?.id) return;
    if (window.confirm('Are you sure you want to delete this event?')) {
        setIsSaving(true);
        setError('');
        try {
            await deleteEvent(accessToken, selectedEvent.id);
            removeEvent(selectedEvent.id);
            closeEventModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete event.');
        } finally {
            setIsSaving(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{selectedEvent?.id ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={closeEventModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            <div className="relative">
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 resize-none"/>
                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="absolute bottom-2 right-2 flex items-center px-2 py-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50">
                    <SparklesIcon className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'AI'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-between items-center mt-6">
            <div>
              {selectedEvent?.id && (
                  <button type="button" onClick={handleDelete} disabled={isSaving} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                      <TrashIcon className="w-5 h-5"/>
                  </button>
              )}
            </div>
            <div className="flex space-x-2">
                <button type="button" onClick={closeEventModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300">{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
