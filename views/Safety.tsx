import React from 'react';
import { Shield, Smartphone, Bell, EyeOff } from 'lucide-react';

interface SafetyProps {
  panicMode: boolean;
  togglePanicMode: () => void;
}

export const Safety: React.FC<SafetyProps> = ({ panicMode, togglePanicMode }) => {
  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-24">
      <div className="bg-white p-6 pt-8 shadow-sm mb-6">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Safety Center</h1>
        <p className="text-slate-500 text-sm">Manage your privacy and emergency settings.</p>
      </div>

      <div className="px-4 space-y-6">
          {/* Panic Mode Section */}
          <div className={`p-6 rounded-3xl border-2 transition-all ${panicMode ? 'bg-red-50 border-red-200' : 'bg-white border-white shadow-sm'}`}>
              <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-full ${panicMode ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Shield size={32} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">Panic Mode</h3>
                      <p className="text-sm text-slate-500 mt-1">
                          Instantly hides all romantic matches and replaces them with a generic "Book Club" interface.
                      </p>
                  </div>
              </div>
              
              <button 
                onClick={togglePanicMode}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 ${
                    panicMode 
                    ? 'bg-white text-red-500 border-2 border-red-100' 
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                }`}
              >
                  {panicMode ? 'DEACTIVATE PANIC MODE' : 'ACTIVATE PANIC MODE'}
              </button>
              
              {panicMode && (
                  <p className="text-center text-xs text-red-500 mt-3 font-medium animate-pulse">
                      Currently Active: Matches are hidden.
                  </p>
              )}
          </div>

          {/* Settings List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Smartphone className="text-slate-400" size={20} />
                      <span className="font-medium text-slate-700">Shake to Activate</span>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
              </div>
               <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Bell className="text-slate-400" size={20} />
                      <span className="font-medium text-slate-700">Emergency Contacts</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">2 Added</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <EyeOff className="text-slate-400" size={20} />
                      <span className="font-medium text-slate-700">Incognito Mode</span>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
