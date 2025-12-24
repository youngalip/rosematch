
import React, { useState, useMemo, useEffect } from 'react';
import { User, Purpose, UserPreferences, AppView } from '../types';
import { SwipeCard } from '../components/SwipeCard';
import { getAllUsers, getSwipedIds, addSwipedId } from '../services/storage';
import { SlidersHorizontal, RefreshCw, Bell, X, Heart, Star, RotateCcw, CheckCircle, Flower2 } from 'lucide-react';
import { Navigation } from '../components/Navigation';

interface DiscoverProps {
  currentUser: User;
  onMatch: (user: User) => void;
  onEditSettings: () => void;
  onUpdateUser: (user: User) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const Discover: React.FC<DiscoverProps> = ({ currentUser, onMatch, onEditSettings, onUpdateUser, onOpenNotifications, notificationCount }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [history, setHistory] = useState<User[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter State (initialized from user preferences)
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>({
      radius: currentUser.preferences?.radius || 50,
      ageRange: currentUser.preferences?.ageRange || [18, 50],
      strictMatch: currentUser.preferences?.strictMatch || false,
      showVerifiedOnly: currentUser.preferences?.showVerifiedOnly || false,
      genderPreference: currentUser.preferences?.genderPreference || 'Everyone'
  });
  const [tempPurpose, setTempPurpose] = useState<string>(currentUser.purpose);

  useEffect(() => {
    if (showFilterModal) {
      setTempPreferences({
          radius: currentUser.preferences?.radius || 50,
          ageRange: currentUser.preferences?.ageRange || [18, 50],
          strictMatch: currentUser.preferences?.strictMatch || false,
          showVerifiedOnly: currentUser.preferences?.showVerifiedOnly || false,
          genderPreference: currentUser.preferences?.genderPreference || 'Everyone'
      });
      setTempPurpose(currentUser.purpose);
    }
  }, [showFilterModal, currentUser]);

  const candidates = useMemo(() => {
      const allUsers = getAllUsers();
      const swipedIds = getSwipedIds();
      
      const radius = currentUser.preferences?.radius || 50;
      const strict = currentUser.preferences?.strictMatch || false;
      const ageMin = currentUser.preferences?.ageRange[0] || 18;
      const ageMax = currentUser.preferences?.ageRange[1] || 99;
      const showVerifiedOnly = currentUser.preferences?.showVerifiedOnly || false;
      const purpose = currentUser.purpose;

      return allUsers.filter(u => {
          if (u.id === currentUser.id) return false;
          if (swipedIds.includes(u.id)) return false;
          if (u.distanceMiles > radius) return false;
          if (u.age < ageMin || u.age > ageMax) return false;
          if (strict && u.purpose !== purpose) return false;
          if (showVerifiedOnly && !u.verified) return false;
          return true;
      }).sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [currentUser]);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= candidates.length) return;
    
    setLastDirection(direction);
    const targetUser = candidates[currentIndex];
    addSwipedId(targetUser.id);
    setHistory(prev => [...prev, targetUser]);

    if (direction === 'right' || direction === 'up') {
      if (Math.random() > 0.6 || direction === 'up') {
          onMatch(targetUser);
      }
    }

    setTimeout(() => {
        setLastDirection(null);
        setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const handleUndo = () => {
      if (history.length === 0) return;
      if (currentIndex === 0) return;
      const prevUser = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentIndex(prev => prev - 1);
  };
  
  const applyFilters = () => {
      const updatedUser: User = {
          ...currentUser,
          purpose: tempPurpose,
          preferences: tempPreferences
      };
      onUpdateUser(updatedUser);
      setShowFilterModal(false);
      setCurrentIndex(0);
  };

  const isFinished = currentIndex >= candidates.length;

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col">
      
      {/* ========== HEADER SECTION ========== */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pt-safe">
        
        {/* Title Bar */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-rose-900">
              Discover
            </h1>
            <p className="text-sm text-rose-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"/>
                {currentUser.purpose}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
                onClick={onOpenNotifications}
                className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors relative"
            >
              <Bell size={20} className="text-rose-700" />
              {notificationCount > 0 && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <button 
                onClick={() => setShowFilterModal(true)}
                className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <SlidersHorizontal size={20} className="text-rose-700" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold whitespace-nowrap">
            Max {currentUser.preferences?.radius || 50} mi
          </button>
          <button className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold whitespace-nowrap">
            Age {currentUser.preferences?.ageRange[0]}-{currentUser.preferences?.ageRange[1]}
          </button>
          {currentUser.preferences?.showVerifiedOnly && (
            <button className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1">
                <CheckCircle size={12} /> Verified
            </button>
          )}
        </div>
      </div>

      {/* ========== CARD CONTAINER ========== */}
      {/* Alignment changed to justify-start and added pt-8 to prevent upward overlap with sticky header */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 px-4 pb-[200px]">
        
        {isFinished ? (
           <div className="text-center p-8 animate-in fade-in zoom-in duration-500 max-w-xs relative z-10 my-auto">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-rose-lg border-4 border-rose-50">
                  <Flower2 size={40} className="text-rose-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">No more profiles</h2>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">Adjust your settings to see more people nearby.</p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                    onClick={() => setShowFilterModal(true)}
                    className="w-full py-3.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-bold shadow-sm hover:bg-rose-50 transition-colors text-sm"
                >
                    Adjust Filters
                </button>
                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full py-3.5 bg-rose-gradient text-white rounded-xl font-bold shadow-rose hover:shadow-rose-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                    <RefreshCw size={16} />
                    Refresh Results
                </button>
              </div>
           </div>
        ) : (
            /* Card Wrapper with Proper Constraints */
            <div className="
              w-full 
              max-w-[420px]              /* Max width for card */
              h-[calc(100vh-380px)]      /* Height accounting for header + buttons + safe areas */
              min-h-[480px]              /* Minimum usable height */
              max-h-[640px]              /* Maximum height for large screens */
              relative
            ">
                {/* Next Card (Stacked below) */}
                {currentIndex + 1 < candidates.length && (
                    <div className="absolute inset-x-4 inset-y-0 transform scale-95 translate-y-3 opacity-60 z-0">
                        <SwipeCard 
                            user={candidates[currentIndex + 1]} 
                            currentUser={currentUser}
                        />
                    </div>
                )}
                
                {/* Active Card */}
                <div className={`absolute inset-0 z-10 transition-transform duration-300 origin-bottom ${lastDirection === 'left' ? '-translate-x-[120%] rotate-[-10deg] opacity-0' : lastDirection === 'right' || lastDirection === 'up' ? 'translate-x-[120%] rotate-[10deg] opacity-0' : ''}`}>
                    <SwipeCard 
                        user={candidates[currentIndex]}
                        currentUser={currentUser}
                        onSwipe={handleSwipe}
                    />
                </div>
            </div>
        )}
      </div>

      {/* ========== SWIPE ACTION BUTTONS ========== */}
      {!isFinished && (
        <div className="fixed bottom-[100px] left-0 right-0 z-50 px-4">
            <div className="max-w-[420px] mx-auto flex justify-center items-center gap-4">
            
            {/* Undo Button */}
            <button 
                onClick={handleUndo}
                disabled={history.length === 0}
                className="
                w-14 h-14 
                rounded-full 
                bg-white 
                shadow-lg 
                border border-gray-100
                flex items-center justify-center
                active:scale-95 
                hover:bg-gray-50
                transition-all
                disabled:opacity-50
                "
            >
                <RotateCcw size={22} className="text-gray-400" />
            </button>

            {/* Dislike Button */}
            <button 
                onClick={() => handleSwipe('left')}
                className="
                w-16 h-16 
                rounded-full 
                bg-white 
                shadow-lg 
                border border-rose-100
                flex items-center justify-center
                active:scale-95 
                hover:bg-rose-50
                transition-all
                "
            >
                <X size={32} className="text-rose-400" strokeWidth={2.5} />
            </button>

            {/* Super Like Button */}
            <button 
                onClick={() => handleSwipe('up')}
                className="
                w-14 h-14 
                rounded-full 
                bg-blue-500 
                shadow-lg 
                flex items-center justify-center
                active:scale-95 
                hover:bg-blue-600
                transition-all
                "
            >
                <Star size={22} className="text-white" fill="white" />
            </button>

            {/* Like Button */}
            <button 
                onClick={() => handleSwipe('right')}
                className="
                w-16 h-16 
                rounded-full 
                bg-rose-500 
                shadow-lg 
                flex items-center justify-center
                active:scale-95 
                hover:bg-rose-600
                transition-all
                "
            >
                <Heart size={32} className="text-white" fill="white" />
            </button>

            </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {showFilterModal && (
          <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full sm:max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-xl font-serif font-bold text-gray-900">Discovery Filters</h2>
                      <button onClick={() => setShowFilterModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      <section>
                          <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3">I'm looking for</h3>
                          <div className="grid grid-cols-2 gap-2">
                              {Object.values(Purpose).map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setTempPurpose(p)}
                                    className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${
                                        tempPurpose === p 
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300'
                                    }`}
                                  >
                                      {p}
                                  </button>
                              ))}
                          </div>
                      </section>

                      <section>
                          <div className="flex justify-between items-center mb-2">
                              <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider">Max Distance</h3>
                              <span className="text-sm font-bold text-gray-700">{tempPreferences.radius} miles</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={tempPreferences.radius}
                            onChange={(e) => setTempPreferences({...tempPreferences, radius: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                      </section>

                      <section>
                          <div className="flex justify-between items-center mb-2">
                               <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider">Age Range</h3>
                               <span className="text-sm font-bold text-gray-700">{tempPreferences.ageRange[0]} - {tempPreferences.ageRange[1]}</span>
                          </div>
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 font-bold mb-1 block">Min Age</label>
                                  <input 
                                    type="number"
                                    min="18"
                                    max={tempPreferences.ageRange[1]}
                                    value={tempPreferences.ageRange[0]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                            setTempPreferences({
                                                ...tempPreferences, 
                                                ageRange: [val, tempPreferences.ageRange[1]]
                                            });
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-center outline-none focus:border-rose-300"
                                  />
                              </div>
                              <div className="flex-1">
                                  <label className="text-[10px] text-gray-400 font-bold mb-1 block">Max Age</label>
                                  <input 
                                    type="number"
                                    min={tempPreferences.ageRange[0]}
                                    max="99"
                                    value={tempPreferences.ageRange[1]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                            setTempPreferences({
                                                ...tempPreferences, 
                                                ageRange: [tempPreferences.ageRange[0], val]
                                            });
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-center outline-none focus:border-rose-300"
                                  />
                              </div>
                          </div>
                      </section>

                      <section className="space-y-4">
                          <div className="flex items-center justify-between">
                              <div>
                                  <h3 className="font-bold text-gray-800 text-sm">Strict Match</h3>
                                  <p className="text-xs text-gray-500">Only show people with the same purpose</p>
                              </div>
                              <button 
                                onClick={() => setTempPreferences({...tempPreferences, strictMatch: !tempPreferences.strictMatch})}
                                className={`w-12 h-7 rounded-full transition-colors relative ${tempPreferences.strictMatch ? 'bg-rose-500' : 'bg-gray-300'}`}
                              >
                                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${tempPreferences.strictMatch ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                          </div>
                          
                           <div className="flex items-center justify-between">
                              <div>
                                  <h3 className="font-bold text-gray-800 text-sm">Verified Profiles Only</h3>
                                  <p className="text-xs text-gray-500">Only show users with verified photo/ID</p>
                              </div>
                              <button 
                                onClick={() => setTempPreferences({...tempPreferences, showVerifiedOnly: !tempPreferences.showVerifiedOnly})}
                                className={`w-12 h-7 rounded-full transition-colors relative ${tempPreferences.showVerifiedOnly ? 'bg-rose-500' : 'bg-gray-300'}`}
                              >
                                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${tempPreferences.showVerifiedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                          </div>
                      </section>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <button 
                        onClick={applyFilters}
                        className="w-full py-4 bg-rose-gradient text-white font-bold rounded-xl shadow-rose hover:shadow-rose-lg transition-all active:scale-95"
                      >
                          Apply Filters
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
