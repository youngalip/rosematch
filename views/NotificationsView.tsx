
import React from 'react';
import { Notification } from '../types';
import { ArrowLeft, Bell, Calendar, Heart, MessageCircle, Info, Trash2 } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  onBack: () => void;
  onClear: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onBack, onClear }) => {
  
  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'MATCH': return <Heart size={20} className="text-rose-500" fill="currentColor" />;
          case 'MESSAGE': return <MessageCircle size={20} className="text-blue-500" />;
          case 'EVENT': return <Calendar size={20} className="text-purple-500" />;
          case 'SYSTEM': 
          default: return <Info size={20} className="text-slate-500" />;
      }
  };

  const getBackground = (type: Notification['type']) => {
      switch(type) {
          case 'MATCH': return 'bg-rose-100';
          case 'MESSAGE': return 'bg-blue-100';
          case 'EVENT': return 'bg-purple-100';
          case 'SYSTEM': 
          default: return 'bg-slate-100';
      }
  };

  const formatTime = (timestamp: number) => {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
      return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="bg-white p-4 pt-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
         <div className="flex items-center gap-4">
             <button onClick={onBack} className="text-slate-600 hover:text-rose-500 p-2 -ml-2">
                 <ArrowLeft size={24} />
             </button>
             <h1 className="text-2xl font-serif font-bold text-slate-800">Notifications</h1>
         </div>
         {notifications.length > 0 && (
             <button onClick={onClear} className="p-2 text-slate-400 hover:text-red-500">
                 <Trash2 size={20} />
             </button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Bell size={32} />
                  </div>
                  <p className="font-medium">No new notifications</p>
              </div>
          ) : (
              notifications.map((notif) => (
                  <div key={notif.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 animate-in slide-in-from-bottom-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBackground(notif.type)}`}>
                          {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-800 text-sm">{notif.title}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">{formatTime(notif.timestamp)}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{notif.body}</p>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};
