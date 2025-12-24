
import React, { useState } from 'react';
import { User, AppView } from '../types';
import { 
  Lock, Bell, CreditCard, Shield, HelpCircle, 
  UserX, LogOut, Trash2, ChevronRight, ArrowLeft
} from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  currentUser, 
  onNavigate, 
  onLogout,
  onUpdateUser 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const accountSettings = [
    {
      id: 'privacy',
      icon: Lock,
      label: 'Privacy Settings',
      action: () => onNavigate(AppView.PRIVACY_SETTINGS)
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      action: () => onNavigate(AppView.NOTIFICATION_SETTINGS)
    },
    {
      id: 'payment',
      icon: CreditCard,
      label: 'Payment Methods',
      action: () => onNavigate(AppView.PAYMENT_METHODS)
    },
    {
      id: 'safety',
      icon: Shield,
      label: 'Safety & Verification',
      action: () => onNavigate(AppView.SAFETY_VERIFICATION)
    }
  ];

  const supportSettings = [
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help Center',
      action: () => onNavigate(AppView.HELP_CENTER)
    },
    {
      id: 'blocked',
      icon: UserX,
      label: 'Blocked Users',
      action: () => onNavigate(AppView.BLOCKED_USERS)
    }
  ];

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    // In production, make API call here
    localStorage.clear();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => onNavigate(AppView.PROFILE)} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[120px]">
        {/* Account Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ACCOUNT
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {accountSettings.map((setting) => (
              <button
                key={setting.id}
                onClick={setting.action}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <setting.icon size={20} className="text-slate-600" />
                </div>
                <span className="flex-1 text-left font-medium text-slate-800">
                  {setting.label}
                </span>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              SUPPORT
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {supportSettings.map((setting) => (
              <button
                key={setting.id}
                onClick={setting.action}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <setting.icon size={20} className="text-slate-600" />
                </div>
                <span className="flex-1 text-left font-medium text-slate-800">
                  {setting.label}
                </span>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              DANGER ZONE
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors active:bg-red-100"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut size={20} className="text-red-600" />
              </div>
              <span className="flex-1 text-left font-medium text-red-600">
                Log Out
              </span>
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors active:bg-red-100"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <span className="flex-1 text-left font-medium text-red-600">
                Delete Account
              </span>
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-slate-400">
          <p>RoseMatch v1.0.0</p>
          <p className="mt-1">© 2024 All rights reserved</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 animate-in slide-in-from-bottom-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Delete Account?
              </h2>
              <p className="text-slate-600">
                This action cannot be undone. All your data, matches, and messages will be permanently deleted.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={confirmDeleteAccount}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
