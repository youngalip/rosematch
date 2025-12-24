
import React from 'react';
import { AppView } from '../types';
import { Flame, Calendar, MessageCircle, User } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChange }) => {
  const navItems = [
    { view: AppView.DISCOVER, icon: Flame, label: 'Discover' },
    { view: AppView.EVENTS, icon: Calendar, label: 'Events' },
    { view: AppView.CHATS, icon: MessageCircle, label: 'Chats' },
    { view: AppView.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-transparent shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-[100] pb-safe flex justify-around items-start pt-2">
      {/* Top Border Gradient Hack */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-gradient opacity-30" />
      
      {navItems.map((item) => {
        const isActive = currentView === item.view || (currentView === AppView.EDIT_PROFILE && item.view === AppView.PROFILE);
        return (
          <button
            key={item.view}
            onClick={() => onChange(item.view)}
            className="flex flex-col items-center justify-center w-1/4 h-full relative group active:scale-95 transition-transform"
          >
            {isActive && (
                <div className="absolute -top-[2px] w-10 h-[3px] bg-rose-500 rounded-b-sm shadow-[0_2px_4px_rgba(183,110,121,0.4)]" />
            )}
            
            <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`mb-1 transition-colors duration-300 ${isActive ? 'text-rose-500' : 'text-gray-300 group-hover:text-rose-300'}`} 
            />
            <span className={`text-[11px] font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-rose-500' : 'text-gray-400'}`}>
                {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
