
import React, { useState, useEffect } from 'react';
import { AppEvent, Purpose, User } from '../types';
import { MOCK_EVENTS } from '../constants';
import { getCustomEvents, saveCustomEvents } from '../services/storage';
import { MapPin, Plus, X, Crown, Search, Calendar as CalendarIcon, Lock, DollarSign, Users } from 'lucide-react';
import { EventCard } from '../components/EventCard';

interface EventsProps {
  currentUser: User;
  onJoinEvent: (event: AppEvent) => void;
  onUpgrade: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const Events: React.FC<EventsProps> = ({ currentUser, onJoinEvent, onUpgrade, onOpenNotifications, notificationCount }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Creation State - Basic Info
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  
  // Creation State - Purpose
  const [newPurpose, setNewPurpose] = useState<string>(Purpose.HANGOUT);
  const [isCustomPurpose, setIsCustomPurpose] = useState(false);
  const [customPurpose, setCustomPurpose] = useState('');

  // Creation State - New Fields
  const [cost, setCost] = useState<number>(0);
  const [isFree, setIsFree] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState<number>(10);
  const [isNoLimit, setIsNoLimit] = useState(false);
  const [whatToBring, setWhatToBring] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [dresscode, setDresscode] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const custom = getCustomEvents();
    setEvents([...MOCK_EVENTS, ...custom]);
  }, []);

  const validateForm = () => {
      const errs: Record<string, string> = {};
      if (newTitle.length < 5) errs.title = "Title too short";
      if (newDesc.length < 20) errs.desc = "Description must be detailed";
      if (!newLocation) errs.location = "Location required";
      
      if (!newDate) {
          errs.date = "Date required";
      } else {
          const selectedDate = new Date(newDate);
          const now = new Date();
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          
          if (isNaN(selectedDate.getTime())) {
              errs.date = "Invalid date format";
          } else if (selectedDate < oneHourFromNow) {
              errs.date = "Event must be at least 1 hour in the future";
          }
      }

      if (!isNoLimit && maxAttendees < 2) errs.maxAttendees = "At least 2 attendees required";
      if (!isFree && cost <= 0) errs.cost = "Cost must be greater than 0";
      
      if (isCustomPurpose && !customPurpose.trim()) errs.purpose = "Purpose required";

      setErrors(errs);
      return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
      if (!validateForm()) return;
      
      const finalPurpose = isCustomPurpose ? customPurpose : newPurpose;

      const newEvent: AppEvent = {
          id: `custom_${Date.now()}`,
          title: newTitle,
          description: newDesc,
          location: newLocation,
          date: newDate || new Date().toISOString(),
          purpose: finalPurpose,
          attendees: 1,
          maxAttendees: isNoLimit ? undefined : maxAttendees,
          participantIds: [currentUser.id],
          image: `https://picsum.photos/600/400?random=${Date.now()}`,
          images: [`https://picsum.photos/600/400?random=${Date.now()}`],
          tags: ['User Activity'],
          isUserCreated: true,
          creatorId: currentUser.id,
          cost: isFree ? 0 : cost,
          details: {
              whatToBring: whatToBring.length > 0 ? whatToBring : undefined,
              ageRange: ageRange || undefined,
              dresscode: dresscode || undefined,
              additionalInfo: additionalInfo || undefined
          }
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      const custom = getCustomEvents();
      saveCustomEvents([...custom, newEvent]);
      
      setIsCreating(false);
      onJoinEvent(newEvent);
      
      // Reset
      setNewTitle(''); setNewDesc(''); setNewLocation(''); setNewDate(''); setErrors({});
      setIsCustomPurpose(false); setCustomPurpose('');
      setCost(0); setIsFree(true); setMaxAttendees(10); setIsNoLimit(false); setWhatToBring([]);
      setNewItem(''); setAgeRange(''); setDresscode(''); setAdditionalInfo('');
  };

  const handleCreateClick = () => {
    if (currentUser.subscriptionTier === 'free') {
        setShowUpgradeModal(true);
    } else {
        setIsCreating(true);
    }
  };

  const filteredEvents = events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || e.purpose === filterCategory;
      return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col relative">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
          <div className="fixed inset-0 z-[1002] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner">
                      <Crown size={32} fill="currentColor" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Unlock Hosting</h2>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      Create and host your own activities to connect with others. This feature is exclusive to Rose Gold members.
                  </p>
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => { setShowUpgradeModal(false); onUpgrade(); }} 
                          className="w-full py-3.5 bg-rose-gradient text-white rounded-xl font-bold shadow-rose hover:shadow-rose-lg transition-all active:scale-95"
                      >
                          Upgrade to Host
                      </button>
                      <button 
                          onClick={() => setShowUpgradeModal(false)} 
                          className="py-2 text-gray-400 font-bold text-sm hover:text-gray-600"
                      >
                          Maybe Later
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Create Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-[1001] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl animate-in slide-in-from-bottom duration-300 shadow-2xl pb-10 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-6 sticky top-0 bg-white border-b border-gray-100 z-10">
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Host Activity</h2>
                    <button onClick={() => setIsCreating(false)} className="p-2 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Basic Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                            Basic Information
                        </h3>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Event Title</label>
                            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-300 font-bold text-gray-800" placeholder="e.g., Rooftop Jazz Night" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            {errors.title && <span className="text-xs text-red-500 ml-1">{errors.title}</span>}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-300 font-bold text-gray-800" 
                                    value={isCustomPurpose ? 'OTHER' : newPurpose} 
                                    onChange={e => {
                                        if (e.target.value === 'OTHER') {
                                            setIsCustomPurpose(true);
                                        } else {
                                            setIsCustomPurpose(false);
                                            setNewPurpose(e.target.value);
                                        }
                                    }}
                                >
                                    {Object.values(Purpose).map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="OTHER">Other (Custom)</option>
                                </select>
                                
                                {isCustomPurpose && (
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-300 mt-2 animate-in slide-in-from-top-1 font-bold text-gray-800" 
                                        placeholder="Enter custom category..." 
                                        value={customPurpose} 
                                        onChange={e => setCustomPurpose(e.target.value)} 
                                        autoFocus
                                    />
                                )}
                                {errors.purpose && <span className="text-xs text-red-500 ml-1">{errors.purpose}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Location</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3.5 text-rose-400" />
                                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-rose-300 font-bold text-gray-800" placeholder="Venue Name / Address" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                                </div>
                                {errors.location && <span className="text-xs text-red-500 ml-1">{errors.location}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date & Time</label>
                            <input 
                              type="datetime-local" 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-rose-300 font-bold text-gray-800" 
                              value={newDate} 
                              onChange={e => setNewDate(e.target.value)} 
                              min={new Date().toISOString().slice(0, 16)}
                            />
                            {errors.date && <span className="text-xs text-red-500 ml-1">{errors.date}</span>}
                        </div>
                    </section>

                    {/* Details Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                            Event Details
                        </h3>
                        
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none h-28 resize-none focus:border-rose-300 text-sm font-medium text-gray-700" placeholder="Tell potential attendees what to expect..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                            {errors.desc && <span className="text-xs text-red-500 ml-1">{errors.desc}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Cost Column */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1 mb-1">
                                    <DollarSign size={10} /> Cost
                                </label>
                                
                                <div className="h-6 flex items-center mb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isFree} 
                                            onChange={(e) => {
                                                setIsFree(e.target.checked);
                                                if (e.target.checked) setCost(0);
                                            }}
                                            className="w-4 h-4 accent-rose-500 rounded border-gray-300"
                                        />
                                        <span className="text-xs font-bold text-slate-600">Free Event</span>
                                    </label>
                                </div>

                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={cost}
                                        disabled={isFree}
                                        onChange={e => setCost(parseFloat(e.target.value) || 0)}
                                        className={`w-full pl-7 pr-3 py-3 rounded-xl outline-none border transition-all font-bold text-gray-700 ${isFree ? 'bg-gray-100 border-transparent text-gray-300 opacity-50' : 'bg-gray-50 border-gray-200 focus:border-rose-300'}`}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-4 text-gray-400 text-[8px] font-bold uppercase pointer-events-none">PER PERSON</span>
                                </div>
                                {errors.cost && <span className="text-[10px] text-red-500 mt-1 ml-1 leading-tight">{errors.cost}</span>}
                            </div>

                            {/* Capacity Column */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1 mb-1">
                                    <Users size={10} /> Capacity
                                </label>
                                
                                <div className="h-6 flex items-center mb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isNoLimit} 
                                            onChange={(e) => {
                                                setIsNoLimit(e.target.checked);
                                            }}
                                            className="w-4 h-4 accent-rose-500 rounded border-gray-300"
                                        />
                                        <span className="text-xs font-bold text-slate-600">No Limit</span>
                                    </label>
                                </div>

                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="2"
                                        max="1000"
                                        value={maxAttendees}
                                        disabled={isNoLimit}
                                        onChange={e => setMaxAttendees(parseInt(e.target.value) || 10)}
                                        className={`w-full px-4 py-3 rounded-xl outline-none border transition-all font-bold text-gray-700 ${isNoLimit ? 'bg-gray-100 border-transparent text-gray-300 opacity-50' : 'bg-gray-50 border-gray-200 focus:border-rose-300'}`}
                                        placeholder="10"
                                    />
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1 ml-1 leading-tight">Max attendees including host</p>
                                {errors.maxAttendees && <span className="text-[10px] text-red-500 mt-1 ml-1 leading-tight">{errors.maxAttendees}</span>}
                            </div>
                        </div>
                    </section>

                    {/* Additional Details Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                            Additional Details <span className="text-[10px] font-normal text-gray-400 lowercase">(Optional)</span>
                        </h3>
                        
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">What to Bring</label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {whatToBring.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-100 animate-in zoom-in-95">
                                            <span className="text-xs font-bold">{item}</span>
                                            <button 
                                                onClick={() => setWhatToBring(whatToBring.filter((_, i) => i !== idx))}
                                                className="text-rose-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        value={newItem}
                                        onChange={e => setNewItem(e.target.value)}
                                        onKeyPress={e => {
                                            if (e.key === 'Enter' && newItem.trim()) {
                                                setWhatToBring([...whatToBring, newItem.trim()]);
                                                setNewItem('');
                                            }
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-rose-300 outline-none font-medium"
                                        placeholder="Add requirement (e.g., ID, Towel)"
                                    />
                                    <button 
                                        onClick={() => {
                                            if (newItem.trim()) {
                                                setWhatToBring([...whatToBring, newItem.trim()]);
                                                setNewItem('');
                                            }
                                        }}
                                        className="px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors shadow-sm active:scale-95"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Age Range</label>
                                <select 
                                    value={ageRange}
                                    onChange={e => setAgeRange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-300 text-sm font-bold text-gray-700"
                                >
                                    <option value="">Any Age</option>
                                    <option value="18+">18+</option>
                                    <option value="21+">21+</option>
                                    <option value="18-25">18-25</option>
                                    <option value="25-35">25-35</option>
                                    <option value="35+">35+</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Dress Code</label>
                                <input 
                                    value={dresscode}
                                    onChange={e => setDresscode(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-300 text-sm font-bold text-gray-700"
                                    placeholder="e.g., Casual"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Need to Know</label>
                            <textarea 
                                value={additionalInfo}
                                onChange={e => setAdditionalInfo(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none text-sm focus:border-rose-300 font-medium text-gray-700"
                                placeholder="Any final instructions for your guests..."
                            />
                        </div>
                    </section>

                    <div className="pt-4 border-t border-gray-100">
                        <button onClick={handleCreate} className="w-full bg-rose-gradient text-white py-4 rounded-2xl font-bold shadow-rose hover:shadow-rose-lg transition-all active:scale-95 text-lg">Create Activity</button>
                        <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed font-medium">
                            By hosting an activity, you agree to our Community Guidelines and Safety Standards.
                        </p>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* Unified Sticky Header with pt-safe */}
      <div className="sticky top-0 z-40 bg-white pt-safe shadow-sm border-b border-gray-50">
          <div className="px-6 h-[72px] flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold text-rose-900">Events</h1>
            <div className="flex gap-3">
                 <button 
                    onClick={handleCreateClick} 
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95 ${currentUser.subscriptionTier === 'free' ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-rose-gradient text-white shadow-rose'}`}
                 >
                    {currentUser.subscriptionTier === 'free' ? <Lock size={14} /> : <Plus size={16}/>} 
                    Create
                 </button>
            </div>
          </div>
          
          {/* Search & Filter Bar unified in header */}
          <div className="px-4 py-3 border-t border-gray-50">
              <div className="flex gap-2 mb-3">
                  <div className="flex-1 bg-gray-50 rounded-xl flex items-center px-3 py-2 border border-gray-100">
                      <Search size={16} className="text-gray-400 mr-2" />
                      <input className="bg-transparent outline-none text-sm w-full font-medium" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button onClick={() => setFilterCategory('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filterCategory === 'ALL' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'}`}>All</button>
                  {Object.values(Purpose).map(p => (
                       <button key={p} onClick={() => setFilterCategory(p)} className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${filterCategory === p ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'}`}>{p}</button>
                  ))}
              </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[120px]">
          {filteredEvents.map((event) => {
             const isJoined = currentUser.joinedEvents?.includes(event.id);
             return (
                <EventCard 
                    key={event.id}
                    event={event}
                    onJoin={onJoinEvent}
                    isJoined={!!isJoined}
                />
             );
          })}
          {filteredEvents.length === 0 && (
              <div className="text-center py-20">
                  <p className="text-gray-400 font-medium">No events found matching your search.</p>
              </div>
          )}
      </div>
    </div>
  );
};
