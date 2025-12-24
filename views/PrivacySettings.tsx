
import React, { useState } from 'react';
import { User, UserPrivacySettings } from '../types';
import { Eye, MapPin, Clock, Shield, ArrowLeft, Check } from 'lucide-react';

interface PrivacySettingsProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  currentUser,
  onUpdateUser,
  onBack
}) => {
  // Initialize state from user's existing settings or defaults
  const [settings, setSettings] = useState<UserPrivacySettings>(currentUser.privacySettings || {
    profileVisibility: 'public', // public, private, friends-only
    locationPrecision: 'exact', // exact, city, hidden
    showDistance: true,
    showLastActive: true,
    showOnlineStatus: true,
    allowProfileViews: true,
    allowMessageRequests: true,
    showVerifiedOnly: false
  });

  // Save settings to user profile WITHOUT navigating away
  const saveSettings = (newSettings: Partial<UserPrivacySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    const updatedUser: User = {
      ...currentUser,
      privacySettings: updatedSettings
    };

    // Update parent component state WITHOUT triggering navigation
    onUpdateUser(updatedUser);
  };

  const handleSelect = (key: keyof UserPrivacySettings, value: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    saveSettings({ [key]: value });
  };

  const handleToggle = (key: keyof UserPrivacySettings, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    saveSettings({ [key]: !settings[key] });
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Privacy Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Profile Visibility Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Eye size={20} className="text-rose-500" />
            <h3 className="font-semibold text-slate-800">Profile Visibility</h3>
          </div>
          
          <div className="space-y-3">
            {['public', 'private', 'friends-only'].map((option) => (
              <button
                key={option}
                onClick={(e) => handleSelect('profileVisibility', option, e)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  settings.profileVisibility === option
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-slate-800 capitalize">
                    {option.replace('-', ' ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {option === 'public' && 'Anyone can see your profile'}
                    {option === 'private' && 'Only you can see your profile'}
                    {option === 'friends-only' && 'Only matched users can see'}
                  </p>
                </div>
                {settings.profileVisibility === option && (
                  <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location Precision Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-rose-500" />
            <h3 className="font-semibold text-slate-800">Location Precision</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { value: 'exact', label: 'Exact Location', desc: 'Show precise distance' },
              { value: 'city', label: 'City Only', desc: 'Show only city name' },
              { value: 'hidden', label: 'Hidden', desc: 'Don\'t show location' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => handleSelect('locationPrecision', option.value, e)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  settings.locationPrecision === option.value
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-slate-800">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.desc}</p>
                </div>
                {settings.locationPrecision === option.value && (
                  <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="bg-white rounded-2xl divide-y divide-slate-100 shadow-sm">
          <ToggleSetting
            icon={MapPin}
            label="Show Distance"
            description="Display how far away you are"
            enabled={settings.showDistance}
            onToggle={(e) => handleToggle('showDistance', e)}
          />
          
          <ToggleSetting
            icon={Clock}
            label="Show Last Active"
            description="Let others see when you were last online"
            enabled={settings.showLastActive}
            onToggle={(e) => handleToggle('showLastActive', e)}
          />
          
          <ToggleSetting
            icon={Eye}
            label="Show Online Status"
            description="Display green dot when you're active"
            enabled={settings.showOnlineStatus}
            onToggle={(e) => handleToggle('showOnlineStatus', e)}
          />
          
          <ToggleSetting
            icon={Shield}
            label="Allow Profile Views"
            description="Let others see who viewed their profile"
            enabled={settings.allowProfileViews}
            onToggle={(e) => handleToggle('allowProfileViews', e)}
          />
          
          <ToggleSetting
            icon={Shield}
            label="Allow Message Requests"
            description="Receive messages from non-matches"
            enabled={settings.allowMessageRequests}
            onToggle={(e) => handleToggle('allowMessageRequests', e)}
          />
          
          <ToggleSetting
            icon={Shield}
            label="Show Verified Only"
            description="Only see verified profiles in discovery"
            enabled={settings.showVerifiedOnly}
            onToggle={(e) => handleToggle('showVerifiedOnly', e)}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="text-2xl shrink-0">ℹ️</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Privacy Tip</h4>
              <p className="text-sm text-blue-700">
                Your privacy is important. You can always adjust these settings to control who sees your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
const ToggleSetting: React.FC<{
  icon: any;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (e: React.MouseEvent) => void;
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
        className={`relative w-14 h-8 rounded-full transition-colors ${
          enabled ? 'bg-rose-500' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
