
import React, { useState } from 'react';
import { User } from '../types';
import { Bell, Mail, MessageSquare, Heart, Calendar, Users, ArrowLeft } from 'lucide-react';

interface NotificationSettingsProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  currentUser,
  onUpdateUser,
  onBack
}) => {
  const [settings, setSettings] = useState(currentUser.notificationSettings || {
    // Push Notifications
    pushEnabled: true,
    pushMatches: true,
    pushMessages: true,
    pushEvents: true,
    pushLikes: true,
    pushActivityInvites: true,
    
    // Email Notifications
    emailEnabled: true,
    emailWeeklyDigest: true,
    emailNewMatches: true,
    emailMessages: false,
    emailEvents: true,
    emailPromotions: false,
    
    // SMS Notifications
    smsEnabled: false,
    smsImportantOnly: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(updated);
    
    const updatedUser = {
      ...currentUser,
      notificationSettings: updated
    };
    onUpdateUser(updatedUser);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
       {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Push Notifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-rose-500" />
                <h3 className="font-semibold text-slate-800">Push Notifications</h3>
              </div>
              <button
                onClick={() => handleToggle('pushEnabled')}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.pushEnabled ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {settings.pushEnabled && (
            <div className="divide-y divide-slate-100">
              <NotificationToggle
                icon={Heart}
                label="New Matches"
                description="When someone matches with you"
                enabled={settings.pushMatches}
                onToggle={() => handleToggle('pushMatches')}
              />
              <NotificationToggle
                icon={MessageSquare}
                label="New Messages"
                description="When you receive a message"
                enabled={settings.pushMessages}
                onToggle={() => handleToggle('pushMessages')}
              />
              <NotificationToggle
                icon={Calendar}
                label="Event Reminders"
                description="Upcoming events you joined"
                enabled={settings.pushEvents}
                onToggle={() => handleToggle('pushEvents')}
              />
              <NotificationToggle
                icon={Heart}
                label="Likes"
                description="When someone likes your profile"
                enabled={settings.pushLikes}
                onToggle={() => handleToggle('pushLikes')}
              />
              <NotificationToggle
                icon={Users}
                label="Activity Invites"
                description="When someone invites you to an activity"
                enabled={settings.pushActivityInvites}
                onToggle={() => handleToggle('pushActivityInvites')}
              />
            </div>
          )}
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-rose-500" />
                <h3 className="font-semibold text-slate-800">Email Notifications</h3>
              </div>
              <button
                onClick={() => handleToggle('emailEnabled')}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.emailEnabled ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {settings.emailEnabled && (
            <div className="divide-y divide-slate-100">
              <NotificationToggle
                icon={Mail}
                label="Weekly Digest"
                description="Summary of your activity"
                enabled={settings.emailWeeklyDigest}
                onToggle={() => handleToggle('emailWeeklyDigest')}
              />
              <NotificationToggle
                icon={Heart}
                label="New Matches"
                description="Email when you get a match"
                enabled={settings.emailNewMatches}
                onToggle={() => handleToggle('emailNewMatches')}
              />
              <NotificationToggle
                icon={MessageSquare}
                label="Messages"
                description="Email for new messages"
                enabled={settings.emailMessages}
                onToggle={() => handleToggle('emailMessages')}
              />
              <NotificationToggle
                icon={Calendar}
                label="Events"
                description="Event updates and reminders"
                enabled={settings.emailEvents}
                onToggle={() => handleToggle('emailEvents')}
              />
              <NotificationToggle
                icon={Mail}
                label="Promotions"
                description="Special offers and updates"
                enabled={settings.emailPromotions}
                onToggle={() => handleToggle('emailPromotions')}
              />
            </div>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-rose-500" />
                <h3 className="font-semibold text-slate-800">SMS Notifications</h3>
              </div>
              <button
                onClick={() => handleToggle('smsEnabled')}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.smsEnabled ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {settings.smsEnabled && (
            <div className="divide-y divide-slate-100">
              <NotificationToggle
                icon={Bell}
                label="Important Only"
                description="Only critical notifications via SMS"
                enabled={settings.smsImportantOnly}
                onToggle={() => handleToggle('smsImportantOnly')}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Notification Tip</h4>
              <p className="text-sm text-yellow-700">
                You can customize notifications to stay updated without being overwhelmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle: React.FC<{
  icon: any;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ icon: Icon, label, description, enabled, onToggle }) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-rose-500' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
