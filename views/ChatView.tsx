
import React, { useState, useEffect, useRef } from 'react';
import { Chat, User, Message } from '../types';
import { getAllUsers } from '../services/storage';
import { ArrowLeft, Send, Sparkles, Lightbulb, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { generateIcebreaker, generateDateIdea } from '../services/geminiService';
import { getCustomEvents } from '../services/storage';
import { MOCK_EVENTS } from '../constants';

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  onSendMessage: (chatId: string, text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chat, currentUser, onBack, onSendMessage }) => {
  const [text, setText] = useState('');
  const [generatingIcebreaker, setGeneratingIcebreaker] = useState(false);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const allUsers = getAllUsers();

  // Find linked event if it's a group chat
  const eventId = chat.isGroup && chat.userId.startsWith('event_') ? chat.userId.replace('event_', '') : null;
  const allEvents = [...MOCK_EVENTS, ...getCustomEvents()];
  const linkedEvent = eventId ? allEvents.find(e => e.id === eventId) : null;

  // Resolve display data
  const otherUser = !chat.isGroup ? allUsers.find(u => u.id === chat.userId) : null;
  const displayName = chat.isGroup ? chat.groupName : (otherUser?.name || 'User');
  const displayImage = chat.isGroup ? chat.groupImage : (otherUser?.images[0] || '');
  
  // FIXED: Display attendee count instead of internal ID for group chats
  const displaySubtext = chat.isGroup 
    ? (linkedEvent ? `${linkedEvent.attendees} members going` : 'Community Group') 
    : otherUser?.purpose;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(chat.id, text);
    setText('');
  };

  const handleIcebreaker = async () => {
    if (!otherUser) return;
    setGeneratingIcebreaker(true);
    const suggestion = await generateIcebreaker(otherUser, currentUser.interests, currentUser.purpose);
    setText(suggestion);
    setGeneratingIcebreaker(false);
  };

  const handleDateIdea = async () => {
    setGeneratingIdea(true);
    const idea = await generateDateIdea(currentUser.purpose, currentUser.location);
    setText(`Hey, how about we ${idea.toLowerCase()}?`);
    setGeneratingIdea(false);
  };

  const handleAddToCalendar = () => {
      if (!linkedEvent) return;
      
      const title = encodeURIComponent(linkedEvent.title);
      const details = encodeURIComponent(linkedEvent.description + "\n\nPlanned via RoseMatch");
      const location = encodeURIComponent(linkedEvent.location);
      
      const now = new Date();
      now.setDate(now.getDate() + 1); 
      const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = new Date(now.getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
      
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
      window.open(url, '_blank');
  };

  const getSenderName = (id: string) => {
    if (id === 'me') return 'You';
    if (id === 'system') return 'System';
    const u = allUsers.find(user => user.id === id);
    return u ? u.name : 'Member';
  };

  return (
    <div className="min-h-screen h-[100dvh] flex flex-col bg-rose-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm z-20 sticky top-0">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
            <ArrowLeft size={24} />
        </button>
        <div className="relative">
            <img src={displayImage} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
            {!chat.isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-slate-800 line-clamp-1 font-serif">{displayName}</h3>
            <p className="text-xs font-medium line-clamp-1 text-rose-500">{displaySubtext}</p>
        </div>
        {linkedEvent && (
            <button 
                onClick={handleAddToCalendar}
                className="p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100"
                title="Add to Calendar"
            >
                <CalendarIcon size={20} />
            </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            const isSystem = msg.senderId === 'system';
            const showSenderName = chat.isGroup && !isMe && !isSystem;
            
            if (isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                            {msg.text}
                        </span>
                    </div>
                )
            }

            return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showSenderName && (
                        <span className="text-[10px] text-slate-400 ml-3 mb-1">
                            {getSenderName(msg.senderId)}
                        </span>
                    )}
                    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl ${
                            isMe 
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-200 rounded-tr-none' 
                            : 'bg-white text-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                            <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Tools */}
      {!chat.isGroup && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-rose-50">
              <button 
                onClick={handleIcebreaker}
                disabled={generatingIcebreaker}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-rose-100 shadow-sm text-xs font-semibold text-rose-600 hover:bg-rose-50 whitespace-nowrap"
              >
                  <Sparkles size={14} />
                  {generatingIcebreaker ? 'Thinking...' : 'AI Icebreaker'}
              </button>
               <button 
                onClick={handleDateIdea}
                disabled={generatingIdea}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-rose-100 shadow-sm text-xs font-semibold text-rose-600 hover:bg-rose-50 whitespace-nowrap"
              >
                  <Lightbulb size={14} />
                  {generatingIdea ? 'Planning...' : 'Date Idea'}
              </button>
          </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-rose-100 sticky bottom-0 z-20 pb-safe">
        <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 transition-all focus-within:ring-rose-100 focus-within:border-rose-300">
            <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-slate-700 font-medium"
            />
            <button 
                onClick={handleSend}
                disabled={!text.trim()}
                className="p-2 text-white rounded-full shadow-md transition-all bg-rose-500 hover:bg-rose-600"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
