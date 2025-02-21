import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import {
  X,
  Menu,
  Search,
  Lightbulb,
  ChevronDown,
  ArrowUp,
  ClipboardList,
  Zap,
  BarChart3,
  Image as ImageIcon,
  Code,
  Paperclip,
  Loader2
} from 'lucide-react';
import type { Message, ChatState } from './types';

// Initialize OpenAI client with proper configuration
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

function App() {
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatState.isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: inputValue
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true
    }));
    setInputValue('');

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Grok Chat Interface'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4',
          messages: [...chatState.messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };

        setChatState(prev => ({
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
        }],
        isLoading: false
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2C2C2C] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <X className="w-5 h-5" />
          <span className="font-semibold">Grok</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:bg-[#2C2C2C] p-2 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 max-w-3xl mx-auto w-full">
        {chatState.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Buenos días, Eduardo Thomas.</h1>
              <p className="text-gray-400">¿Cómo puedo ayudarte hoy?</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chatState.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2C2C2C] text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {chatState.isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2C2C2C] rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-[#2C2C2C] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="¿Qué quieres saber?"
                className="bg-transparent flex-1 outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={chatState.isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between border-t border-[#3C3C3C] pt-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm hover:bg-[#3C3C3C] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Búsqueda profunda
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm hover:bg-[#3C3C3C] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Pensar
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm hover:bg-[#3C3C3C] px-3 py-1.5 rounded-lg transition-colors"
                >
                  Asimilar 3
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={chatState.isLoading || !inputValue.trim()}
                  className="hover:bg-[#3C3C3C] p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2C] p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <button className="flex items-center gap-2 text-sm hover:bg-[#2C2C2C] px-3 py-1.5 rounded-lg transition-colors">
            <ClipboardList className="w-4 h-4" />
            Investigación
          </button>
          <button className="flex items-center gap-2 text-sm hover:bg-[#2C2C2C] px-3 py-1.5 rounded-lg transition-colors">
            <Zap className="w-4 h-4" />
            Idea genial
          </button>
          <button className="flex items-center gap-2 text-sm hover:bg-[#2C2C2C] px-3 py-1.5 rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" />
            Analizar datos
          </button>
          <button className="flex items-center gap-2 text-sm hover:bg-[#2C2C2C] px-3 py-1.5 rounded-lg transition-colors">
            <ImageIcon className="w-4 h-4" />
            Crear imágenes
          </button>
          <button className="flex items-center gap-2 text-sm hover:bg-[#2C2C2C] px-3 py-1.5 rounded-lg transition-colors">
            <Code className="w-4 h-4" />
            Código
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;