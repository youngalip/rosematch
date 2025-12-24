
import React, { useState, useRef, useMemo } from 'react';
import { User, AppEvent } from '../types';
import { 
    Edit2, Camera as CameraIcon, Check, X, Crown, 
    Image as ImageIcon, Settings as SettingsIcon, 
    ArrowLeft, MapPin, Plus, Star, Calendar, Clock, 
    ChevronRight, Lock, Edit3, Sparkles, Briefcase, 
    GraduationCap, Languages, Ruler, AlertCircle
} from 'lucide-react';
import { INTERESTS, MOCK_EVENTS } from '../constants';
import { calculateProfileScore } from '../services/auth';
import { CameraView } from '../components/CameraView';
import { getCustomEvents } from '../services/storage';
import { checkCameraPermission } from '../utils/cameraUtils';

interface ProfileProps {
  user: User;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  onJoinEvent: (event: AppEvent) => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
    user, isEditing, onEdit, onSave, onCancel, onOpenSettings, onOpenSubscription, onJoinEvent 
}) => {
  const [formData, setFormData] = useState<User>(user);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'hosting'>('upcoming');
  
  // Photo Editing State
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const score = calculateProfileScore(user);
  const isPro = user.subscriptionTier !== 'free';

  const handleSave = () => {
     const updatedUser = { 
        ...formData, 
        profileScore: calculateProfileScore(formData) 
     };
     onSave(updatedUser);
  };

  const handleUpgradeFromModal = (tier: 'rosegold' | 'roseplatinum') => {
    const now = new Date();
    let expirationDate: Date;
    
    if (tier === 'rosegold') {
        expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
        expirationDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    
    const updatedUser: User = { 
        ...user, 
        subscriptionTier: tier,
        subscriptionExpires: expirationDate.toISOString(),
        subscriptionStartDate: now.toISOString()
    };
    onSave(updatedUser);
    setShowUpgradeModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (editingImageIndex !== null) {
          const newImages = [...formData.images];
          newImages[editingImageIndex] = result;
          setFormData(prev => ({ ...prev, images: newImages }));
        } else if (formData.images.length < 6) {
          setFormData(prev => ({ ...prev, images: [...prev.images, result] }));
        }
        setShowPhotoOptions(false);
        setEditingImageIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    if (editingImageIndex !== null) {
      const newImages = [...formData.images];
      newImages[editingImageIndex] = imageSrc;
      setFormData(prev => ({ ...prev, images: newImages }));
    } else if (formData.images.length < 6) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageSrc] }));
    }
    setShowCamera(false);
    setShowPhotoOptions(false);
    setEditingImageIndex(null);
  };

  const handleOpenCamera = async () => {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setCameraError('Camera access denied. Please enable permissions in settings.');
      return;
    }
    setCameraError('');
    setShowCamera(true);
  };

  const handlePhotoSlotClick = (index: number) => {
    setEditingImageIndex(index);
    setShowPhotoOptions(true);
  };

  const removeImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, idx) => idx !== index)
      }));
  };

  const toggleInterest = (interest: string) => {
      setFormData(prev => {
          if (prev.interests.includes(interest)) {
              return { ...prev, interests: prev.interests.filter(i => i !== interest) };
          }
          if (prev.interests.length >= 5) return prev;
          return { ...prev, interests: [...prev.interests, interest] };
      });
  };

  const filteredEvents = useMemo(() => {
        const allEvents = [...MOCK_EVENTS, ...getCustomEvents()];
        const now = new Date();

        switch (activeTab) {
            case 'upcoming':
                return allEvents.filter(e => 
                    (user.joinedEvents || []).includes(e.id) && new Date(e.date) > now
                ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            case 'past':
                return allEvents.filter(e => 
                    (user.joinedEvents || []).includes(e.id) && new Date(e.date) < now
                ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            case 'hosting':
                return allEvents.filter(e => e.creatorId === user.id);
            
            default: 
                return [];
        }
    }, [activeTab, user]);

  const stats = {
    events: user.joinedEvents?.length || 0,
    hosted: user.stats?.eventsHosted || 0, 
    connections: user.stats?.connections || 0
  };

  const getSubscriptionDisplay = (user: User) => {
    if (!user.subscriptionExpires || user.subscriptionTier === 'free') {
        return null;
    }
    const expiryDate = new Date(user.subscriptionExpires);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { status: 'expired', message: 'Subscription expired', color: 'text-red-100' };
    const formattedDate = expiryDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    return { status: 'active', message: `Expires ${formattedDate}`, daysRemaining, color: daysRemaining < 7 ? 'text-orange-100' : 'text-white/80' };
  };

  const subscriptionInfo = getSubscriptionDisplay(user);

  if (isEditing) {
      return (
        <div className="min-h-screen bg-white flex flex-col relative">
             <div className="h-auto bg-white flex items-center justify-between px-4 sticky top-0 z-10 border-b border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.05)] pt-safe">
                <div className="flex w-full items-center justify-between py-3">
                    <button onClick={onCancel} className="p-2 -ml-2 text-gray-800 font-medium flex items-center gap-1 hover:text-rose-500">
                        Cancel
                    </button>
                    <div className="font-serif font-bold text-gray-800 text-xl">
                        Edit Profile
                    </div>
                    <button onClick={handleSave} className="text-rose-500 font-bold text-base px-2 hover:opacity-70">Save</button>
                </div>
             </div>
             
             {showCamera && (
                <div className="fixed inset-0 z-[1002]">
                    <CameraView onCapture={handleCameraCapture} onClose={() => { setShowCamera(false); setEditingImageIndex(null); }} />
                </div>
             )}

             {cameraError && (
              <div className="fixed bottom-24 left-4 right-4 z-[1001] bg-red-500 text-white p-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="text-sm font-bold flex-1">{cameraError}</p>
                <button onClick={() => setCameraError('')} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={16}/></button>
              </div>
             )}
             
             {showPhotoOptions && (
                 <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end justify-center">
                     <div className="bg-white w-full rounded-t-3xl p-6 space-y-3 animate-in slide-in-from-bottom duration-300 pb-20 max-w-md">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Update Photo</h3>
                         <button onClick={() => { handleOpenCamera(); setShowPhotoOptions(false); }} className="w-full p-4 bg-gray-50 rounded-xl font-bold flex gap-4 items-center hover:bg-rose-50 transition-colors">
                            <div className="p-2 bg-white rounded-full shadow-sm text-rose-500"><CameraIcon size={20}/></div>
                            <span>Take Photo</span>
                         </button>
                         <button onClick={() => { fileInputRef.current?.click(); setShowPhotoOptions(false); }} className="w-full p-4 bg-gray-50 rounded-xl font-bold flex gap-4 items-center hover:bg-rose-50 transition-colors">
                            <div className="p-2 bg-white rounded-full shadow-sm text-rose-500"><ImageIcon size={20}/></div>
                            <span>Photo Library</span>
                         </button>
                         <button onClick={() => { setShowPhotoOptions(false); setEditingImageIndex(null); }} className="w-full p-4 bg-gray-100 rounded-xl font-bold text-gray-600">Cancel</button>
                     </div>
                 </div>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

             <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[120px]">
                 <section>
                     <h3 className="text-xs font-black text-gray-400 uppercase mb-2 ml-1">Photos</h3>
                     <div className="grid grid-cols-3 gap-2">
                        {[0,1,2,3,4,5].map(i => (
                            <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl relative overflow-hidden border border-dashed border-gray-300 shadow-inner group">
                                {formData.images[i] ? (
                                    <>
                                    <img src={formData.images[i]} className="w-full h-full object-cover" alt="" onClick={() => handlePhotoSlotClick(i)} />
                                    <button onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-white/80 backdrop-blur rounded-full p-1.5 text-red-500 shadow-sm active:scale-90 transition-all"><X size={12} strokeWidth={3}/></button>
                                    <div className="absolute bottom-2 left-2 p-1.5 bg-black/20 backdrop-blur rounded-full text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={12}/></div>
                                    </>
                                ) : (
                                    <button onClick={() => handlePhotoSlotClick(i)} className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1 active:scale-95 transition-all">
                                        <Plus size={24}/>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Add</span>
                                    </button>
                                )}
                            </div>
                        ))}
                     </div>
                 </section>

                 <section>
                     <h3 className="text-xs font-black text-gray-400 uppercase mb-2 ml-1">About Me</h3>
                     <div className="space-y-4">
                         <textarea 
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})} 
                            className="w-full p-4 bg-rose-50/50 rounded-2xl text-sm h-28 border border-rose-100 outline-none focus:border-rose-400 focus:bg-white transition-all font-medium"
                            placeholder="Tell us about yourself..."
                         />
                         
                         <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Age</label>
                                     <input type="number" value={formData.age} onChange={e=>setFormData({...formData, age: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300"/>
                                </div>
                                <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Height (cm)</label>
                                     <input 
                                        type="number" 
                                        value={formData.heightCm || ''} 
                                        onChange={e => setFormData({...formData, heightCm: e.target.value ? parseInt(e.target.value) : undefined})} 
                                        placeholder="170" 
                                        className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300"
                                     />
                                </div>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Occupation</label>
                                 <input value={formData.job||''} onChange={e=>setFormData({...formData, job: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300" placeholder="Job Title"/>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Education</label>
                                 <select value={formData.education||''} onChange={e=>setFormData({...formData, education: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300">
                                    <option value="">Select...</option>
                                    {['High School', 'Undergrad', 'Postgrad', 'PhD', 'Trade School'].map(o => <option key={o} value={o}>{o}</option>)}
                                 </select>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Smoking</label>
                                    <select value={formData.smoking||''} onChange={e=>setFormData({...formData, smoking: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300">
                                        <option value="">Select...</option>
                                        {['No', 'Yes', 'Socially', 'Trying to quit'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Drinking</label>
                                    <select value={formData.drinking||''} onChange={e=>setFormData({...formData, drinking: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 outline-none focus:border-rose-300">
                                        <option value="">Select...</option>
                                        {['No', 'Yes', 'Socially', 'Rarely'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                             </div>
                         </div>
                     </div>
                 </section>

                 <section>
                     <h3 className="text-xs font-black text-gray-400 uppercase mb-2 ml-1">Interests <span className="font-normal text-gray-300 ml-1">({formData.interests.length}/5)</span></h3>
                     <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(interest => (
                            <button 
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    formData.interests.includes(interest) 
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
                                }`}
                            >
                                {interest}
                            </button>
                        ))}
                     </div>
                 </section>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <div className="bg-white border-b border-slate-100 shadow-sm z-10 sticky top-0 pt-safe">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="w-10"></div> 
          <h1 className="text-2xl font-serif font-bold text-slate-800">Profile</h1>
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors -mr-2 text-slate-600"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[120px]">
        <div className="flex flex-col items-center pt-4">
             <div className="relative mb-3">
                 <img src={user.images[0]} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                 {isPro && (
                     <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                         <Crown size={14} fill="currentColor" />
                     </div>
                 )}
             </div>
             <h2 className="text-2xl font-bold text-slate-800">{user.name}, {user.age}</h2>
             <p className="text-sm text-slate-500 mb-2">{user.location}</p>
        </div>

        {score < 100 && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Complete your profile to get more connections!
                </p>
                <div className="mt-2 h-2 bg-white rounded-full overflow-hidden border border-rose-100">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {score}% complete
                </p>
              </div>
            </div>
          </div>
        )}

        {!isPro && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-white border border-rose-100 rounded-2xl p-4 transition-all hover:shadow-lg active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-rose-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <Crown size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-bold text-slate-800">Upgrade to Pro</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                    SAVE 33%
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Unlimited activities • See who liked you
                </p>
              </div>
              <div className="text-rose-500 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={20} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-slate-800">$9.99</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <span className="text-xs text-slate-500">Best value annual plan</span>
            </div>
          </button>
        )}

        {isPro && subscriptionInfo && (
          <div className="bg-gradient-to-r from-amber-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg shadow-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-lg">
                  {user.subscriptionTier === 'roseplatinum' ? 'Pro Annual' : 'Pro Monthly'}
                </h3>
                <p className={`text-sm ${subscriptionInfo.color}`}>
                  {subscriptionInfo.message}
                </p>
                {subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining < 7 && subscriptionInfo.status === 'active' && (
                  <p className="text-xs mt-1 text-orange-100 flex items-center gap-1">
                    <Clock size={10} /> Renews in {subscriptionInfo.daysRemaining} days
                  </p>
                )}
              </div>
              <button 
                onClick={onOpenSubscription}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{stats.events}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Events</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{stats.hosted}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Hosted</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{stats.connections}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Conn.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              About Me
            </h3>
            <button 
              onClick={onEdit}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors -mr-2 text-slate-400 hover:text-rose-500"
            >
              <Edit3 size={16} />
            </button>
          </div>

          <p className="text-slate-700 leading-relaxed mb-4 text-sm font-medium">
            {user.bio || 'No bio yet'}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-slate-400" />
              <span className="text-slate-700 font-medium">{user.location}</span>
            </div>
            {user.heightCm && (
              <div className="flex items-center gap-3 text-sm">
                <Ruler size={16} className="text-slate-400" />
                <span className="text-slate-700 font-medium">{user.heightCm} cm</span>
              </div>
            )}
            {user.job && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase size={16} className="text-slate-400" />
                <span className="text-slate-700 font-medium">{user.job}</span>
              </div>
            )}
            {user.education && (
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap size={16} className="text-slate-400" />
                <span className="text-slate-700 font-medium">{user.education}</span>
              </div>
            )}
            {user.languages && user.languages.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Languages size={16} className="text-slate-400" />
                <span className="text-slate-700 font-medium">
                  {user.languages.map(l => l.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          {user.interests && user.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-100 shadow-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            My Activities
          </h3>

          <div className="flex gap-1 mb-4 border-b border-slate-100">
            {['upcoming', 'past', 'hosting'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 pb-2 text-xs font-bold capitalize relative transition-colors ${
                  activeTab === tab 
                    ? 'text-rose-500' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
             {activeTab === 'hosting' && !isPro ? (
                 <div className="text-center py-6">
                    <Lock size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 mb-3">Hosting is a Pro feature.</p>
                    <button onClick={() => setShowUpgradeModal(true)} className="text-xs font-bold text-rose-500">Upgrade to Host</button>
                 </div>
             ) : (
                <>
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2 opacity-30">📅</div>
                            <p className="text-slate-400 text-sm">No events found.</p>
                            <div className="text-xs text-slate-400 mt-1">Check the Events tab to join one!</div>
                        </div>
                    ) : (
                        filteredEvents.map(evt => (
                            <div key={evt.id} className="border border-slate-100 rounded-xl p-3 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                <img src={evt.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{evt.title}</h4>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1 font-medium">
                                        <Calendar size={10} className="text-rose-400" />
                                        <span>{new Date(evt.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </>
             )}
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgradeFromModal} />
      )}
    </div>
  );
};

const UpgradeModal: React.FC<{ onClose: () => void, onUpgrade: (tier: 'rosegold' | 'roseplatinum') => void }> = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const handleSelectPlan = (tier: 'rosegold' | 'roseplatinum') => onUpgrade(tier);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[1001] animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-serif font-bold text-slate-800">Upgrade to Pro</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <button onClick={() => setSelectedPlan('monthly')} className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${selectedPlan === 'monthly' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-800">PRO MONTHLY</h3>
                <div className="flex items-baseline gap-2 mt-1"><span className="text-3xl font-serif font-bold text-rose-500">$9.99</span><span className="text-slate-500">/mo</span></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">Renews every 30 days</span>
              {selectedPlan === 'monthly' && <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2 font-medium"><Check size={16} className="text-rose-500" />Create unlimited activities</li>
              <li className="flex items-center gap-2 font-medium"><Check size={16} className="text-rose-500" />See who liked you</li>
              <li className="flex items-center gap-2 font-medium"><Check size={16} className="text-rose-500" />No ads</li>
            </ul>
          </button>
          <button onClick={() => setSelectedPlan('annual')} className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${selectedPlan === 'annual' ? 'border-amber-400 bg-slate-900 shadow-lg' : 'border-slate-300 bg-slate-800 hover:border-amber-400'}`}>
            <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black tracking-widest uppercase">SAVE 33%</div>
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <div className="flex items-center gap-2"><h3 className="text-lg font-serif font-bold text-white">PRO ANNUAL</h3><Crown size={20} className="text-amber-400" /></div>
                <div className="flex items-baseline gap-2 mt-1"><span className="text-3xl font-serif font-bold text-amber-400">$79.99</span><span className="text-white/70">/yr</span></div>
                <p className="text-[10px] text-white/60 mt-1 font-bold uppercase tracking-widest">Only $6.67/month</p>
                <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-1 rounded inline-block mt-2 font-bold uppercase tracking-wider">Renews annually</span>
              </div>
              {selectedPlan === 'annual' && <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"><Check size={14} className="text-slate-900" /></div>}
            </div>
            <ul className="space-y-2 text-sm text-white/90 font-medium">
              <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" />Everything in Monthly</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" />2 months FREE</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" />Exclusive Gold Badge</li>
            </ul>
          </button>
          <button onClick={() => handleSelectPlan(selectedPlan === 'annual' ? 'roseplatinum' : 'rosegold')} className="w-full py-4 bg-rose-gradient text-white rounded-2xl font-bold text-lg hover:shadow-rose-lg transition-all shadow-rose active:scale-[0.98] mt-2">Subscribe Now</button>
          <p className="text-[10px] text-center text-slate-500 px-4 leading-relaxed font-medium">By subscribing, you agree to our <button className="text-rose-500 underline">Terms of Service</button> and <button className="text-rose-500 underline">Privacy Policy</button></p>
        </div>
      </div>
    </div>
  );
};
