
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getAiChatResponse } from '../services/gemini';

interface AiChatProps {
  profile: UserProfile;
}

const AiChat: React.FC<AiChatProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // FIX: Added missing timestamp
    { role: 'assistant', content: "Hi! I'm your Kindred coach. Ask me anything about your kids or parenting challenges today.", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    // FIX: Added missing timestamp
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toISOString() }]);
    setIsTyping(true);

    try {
      // FIX: Map messages to match the expected history format (removing timestamp for the API call)
      const response = await getAiChatResponse(messages.map(m => ({ role: m.role, content: m.content })), userMsg, profile.children);
      // FIX: Added missing timestamp
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
    } catch (e) {
      // FIX: Added missing timestamp
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a little trouble connecting. Please try again in a moment.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-stone-800 font-display">Instant Advice</h2>
        <p className="text-stone-500">Get quick answers and coaching scripts.</p>
      </header>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-rose-500 text-white rounded-tr-none' 
                  : 'bg-stone-100 text-stone-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-stone-100 p-4 rounded-2xl rounded-tl-none flex space-x-1">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How do I handle a transition with my toddler?"
              className="flex-1 p-4 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-rose-500 text-white px-6 rounded-2xl font-bold hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Bedtime battle', 'Sibling rivalry', 'School anxiety'].map((tag) => (
              <button
                key={tag}
                onClick={() => setInput(tag)}
                className="text-[10px] uppercase font-bold tracking-widest text-stone-500 border border-stone-200 px-3 py-1 rounded-full hover:bg-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
