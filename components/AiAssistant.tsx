
import React, { useState, useRef, useEffect } from 'react';
import { summarizeEvents, suggestTime, answerScheduleQuestion } from '../services/geminiService';
import useCalendarStore from '../hooks/useCalendarStore';
import { SparklesIcon, SendIcon, BotIcon } from './icons';
import type { AiChatMessage } from '../types';

const PredefinedPrompt: React.FC<{ text: string, onClick: (text: string) => void }> = ({ text, onClick }) => (
    <button onClick={() => onClick(text)} className="w-full text-left p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">
        {text}
    </button>
);

function AiAssistant() {
  const { events } = useCalendarStore();
  const [messages, setMessages] = useState<AiChatMessage[]>([
      { role: 'model', content: "Hello! I'm your AI assistant. How can I help you with your schedule today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = async (promptText: string = input) => {
    if (!promptText.trim() || isLoading) return;
    
    const newMessages: AiChatMessage[] = [...messages, { role: 'user', content: promptText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let response = '';
    try {
        if (promptText.toLowerCase().includes('summarize')) {
            response = await summarizeEvents(events);
        } else if (promptText.toLowerCase().match(/free|suggest|find time/)) {
            response = await suggestTime(events, promptText);
        } else {
            response = await answerScheduleQuestion(events, promptText);
        }
    } catch (e) {
        response = "Sorry, I encountered an error. Please try again."
    } finally {
        setMessages([...newMessages, { role: 'model', content: response }]);
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <SparklesIcon className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-bold">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <BotIcon className="w-5 h-5"/>
              </div>
            )}
            <div className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <BotIcon className="w-5 h-5"/>
              </div>
              <div className="max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="space-y-2 mb-4">
            <PredefinedPrompt text="Summarize my week" onClick={handleSend} />
            <PredefinedPrompt text="What's on my schedule for tomorrow?" onClick={handleSend} />
            <PredefinedPrompt text="When am I free for a 1-hour meeting?" onClick={handleSend} />
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your schedule..."
          className="w-full p-3 pr-12 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-blue-500 disabled:text-gray-300">
            <SendIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
}

export default AiAssistant;
