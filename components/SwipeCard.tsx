
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';
import { 
  MapPin, CheckCircle, Info, User as UserIcon, X,
  Briefcase, GraduationCap, Ruler, Heart, Wine, Cigarette, Church, Vote, Target, Star, Dumbbell, Sparkles
} from 'lucide-react';
import { checkCompatibility } from '../services/geminiService';

interface SwipeCardProps {
  user: User;
  currentUser: User;
  onSwipe?: (direction: 'left' | 'right' | 'up') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, currentUser, onSwipe }) => {
  // AI Match State
  const [matchData, setMatchData] = useState<{ score: number; reason: string } | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  const totalImages = user.images.length;
  const hasMultipleImages = totalImages > 1;

  // Reset state when user changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setImageError(false);
    setMatchData(null);
  }, [user.id]);

  const handleCompatibilityCheck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchData) return;
    setLoadingMatch(true);
    const data = await checkCompatibility(currentUser, user);
    setMatchData(data);
    setLoadingMatch(false);
  };

  const nextImage = useCallback(() => {
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  }, [currentImageIndex, totalImages]);

  const prevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  }, [currentImageIndex]);

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.35) {
      prevImage();
    } else if (x > width * 0.65) {
      nextImage();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    else if (distance < -50) prevImage();
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-white shadow-xl select-none border border-rose-100/50 flex flex-col group">
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={handleCardTap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
            {/* Progress Indicators */}
            {hasMultipleImages && (
              <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-30">
                {user.images.map((_, index) => (
                  <div key={index} className="flex-1 h-1 rounded-full bg-black/20 overflow-hidden backdrop-blur-sm">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        index === currentImageIndex ? 'bg-white' : index < currentImageIndex ? 'bg-white/60' : 'bg-transparent'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {!imageLoaded && !imageError && (
                 <div className="absolute inset-0 bg-rose-50 flex items-center justify-center z-0">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-500" />
                 </div>
            )}

            {imageError ? (
                 <div className="absolute inset-0 bg-rose-50 flex flex-col items-center justify-center text-rose-300">
                     <UserIcon size={64} className="mb-2 opacity-50" />
                     <p className="text-sm font-medium">Image not available</p>
                 </div>
            ) : (
                  <img
                      key={`${user.id}-${currentImageIndex}`} 
                      src={user.images[currentImageIndex]}
                      alt={`${user.name} photo`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      draggable={false}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                  />
            )}
            
            <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
              <button 
                  onClick={handleCompatibilityCheck}
                  className="pointer-events-auto px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-rose-700 flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors border border-rose-100"
              >
                  <span className={`w-1.5 h-1.5 rounded-full ${matchData ? (matchData.score > 80 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-rose-500'}`}></span>
                  {loadingMatch ? 'Analyzing...' : matchData ? `${matchData.score}% Match` : 'AI Match'}
              </button>
              <span className="px-4 py-1.5 bg-rose-500 rounded-full text-xs font-semibold text-white shadow-md uppercase tracking-wide">
                  {user.purpose}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-x-0 bottom-0 z-20 p-6 pb-8 pointer-events-none">
              <div className="mb-3">
                <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2 drop-shadow-md">
                  {user.name}, {user.age}
                  {user.verified && (
                    <CheckCircle size={24} className="text-blue-500" fill="currentColor" stroke="white" strokeWidth={3} />
                  )}
                </h2>
                <p className="text-white/90 text-sm flex items-center gap-1.5 font-medium drop-shadow-sm">
                  <MapPin size={14} className="text-white/80" />
                  {user.location} • {user.distanceMiles} miles
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 max-w-[calc(100%-60px)]">
                {user.interests.slice(0, 4).map((interest, index) => {
                  const isShared = currentUser.interests.includes(interest);
                  return (
                    <span 
                      key={index} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                        isShared 
                        ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(183,110,121,0.5)]' 
                        : 'bg-white/20 backdrop-blur-sm text-white border-white/30'
                      }`}
                    >
                      {isShared && <Sparkles size={10} fill="currentColor" />}
                      {interest}
                    </span>
                  );
                })}
              </div>

              <div className="max-h-[60px] overflow-y-auto no-scrollbar pointer-events-auto pr-8">
                  <p className="text-white/90 text-sm leading-relaxed font-medium drop-shadow-sm line-clamp-2">
                  {user.bio}
                  </p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowProfileModal(true); }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg active:scale-95"
                >
                    <Info size={20} className="text-white" />
                </button>
            </div>
        </div>
      </div>

      {showProfileModal && (
        <ProfilePortal 
          user={user} 
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSwipe={onSwipe}
        />
      )}
    </>
  );
};

interface ProfilePortalProps {
  user: User;
  currentUser: User;
  onClose: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up') => void;
}

const ProfilePortal: React.FC<ProfilePortalProps> = ({ user, currentUser, onClose, onSwipe }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = user.images.length;
  const hasMultipleImages = totalImages > 1;

  const hasBasics = user.job || user.education || user.heightCm || user.purpose || user.gender;
  const hasLifestyle = user.smoking || user.drinking || user.exercise || user.religion || user.politics;

  const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.35) {
      if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
    } else if (x > width * 0.65) {
      if (currentImageIndex < totalImages - 1) setCurrentImageIndex(prev => prev + 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col">
            
            {/* Modal Image Header */}
            <div 
              className="relative h-[45vh] shrink-0 bg-gray-100 cursor-pointer"
              onClick={handleImageTap}
            >
                <img src={user.images[currentImageIndex]} alt={user.name} className="w-full h-full object-cover transition-all duration-300" />
                
                {/* Progress Indicators */}
                {hasMultipleImages && (
                  <div className="absolute top-4 left-4 right-16 flex gap-1.5 z-30 pointer-events-none">
                    {user.images.map((_, index) => (
                      <div key={index} className="flex-1 h-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white' : index < currentImageIndex ? 'bg-white/60' : 'bg-transparent'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors z-40"
                >
                    <X size={24} />
                </button>

                <div className="absolute bottom-8 left-8 text-white pointer-events-none">
                    <h2 className="text-4xl font-bold flex items-center gap-2 mb-1">
                        {user.name}, {user.age}
                        {user.verified && (
                            <CheckCircle size={24} className="text-blue-500" fill="currentColor" stroke="white" strokeWidth={3} />
                        )}
                    </h2>
                    <p className="flex items-center gap-1.5 opacity-90 text-sm font-medium">
                        <MapPin size={18} />
                        {user.location} • {user.distanceMiles} miles
                    </p>
                </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white no-scrollbar">
                
                {/* About Section */}
                <section>
                    <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-3 font-serif">About</h3>
                    <p className="text-slate-700 leading-relaxed text-base font-medium">{user.bio}</p>
                </section>

                {/* The Basics Section */}
                {hasBasics && (
                    <section>
                        <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-4 font-serif">The Basics</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {user.job && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Briefcase size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.job}</span>
                                </div>
                            )}
                            {user.education && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <GraduationCap size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.education}</span>
                                </div>
                            )}
                            {user.heightCm && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Ruler size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.heightCm} cm</span>
                                </div>
                            )}
                            {user.purpose && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Target size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.purpose}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Lifestyle Section */}
                {hasLifestyle && (
                    <section>
                        <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-4 font-serif">Lifestyle</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {user.smoking && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Cigarette size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">Smoking: {user.smoking}</span>
                                </div>
                            )}
                            {user.drinking && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Wine size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">Drinking: {user.drinking}</span>
                                </div>
                            )}
                            {user.exercise && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Dumbbell size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.exercise}</span>
                                </div>
                            )}
                            {user.religion && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Church size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.religion}</span>
                                </div>
                            )}
                            {user.religion && (
                                <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <Vote size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-700">{user.politics}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Interests Section */}
                <section>
                    <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] mb-4 font-serif">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest, index) => {
                          const isShared = currentUser.interests.includes(interest);
                          return (
                            <span 
                              key={index} 
                              className={`px-4 py-2 text-xs font-bold rounded-full border shadow-sm transition-all duration-300 flex items-center gap-1.5 ${
                                isShared 
                                ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(183,110,121,0.4)]' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}
                            >
                                {isShared && <Sparkles size={12} fill="currentColor" />}
                                {interest}
                            </span>
                          );
                        })}
                    </div>
                </section>
                
                {/* Prompts Section */}
                {user.prompts && user.prompts.length > 0 && (
                    <section className="space-y-6">
                        {user.prompts.map((prompt, i) => (
                            <div key={i} className="p-6 bg-rose-50/40 rounded-[24px] border border-rose-100/50 shadow-inner">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 font-serif">{prompt.question}</p>
                                <p className="text-xl font-serif font-bold text-slate-800 leading-tight italic">"{prompt.answer}"</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-center items-center gap-6 pb-12 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => { onClose(); onSwipe?.('left'); }}
                    className="w-16 h-16 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-rose-400 hover:border-rose-100 active:scale-90 transition-all shadow-sm"
                >
                    <X size={32} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={() => { onClose(); onSwipe?.('up'); }}
                    className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                >
                    <Star size={24} fill="white" />
                </button>
                <button 
                    onClick={() => { onClose(); onSwipe?.('right'); }}
                    className="w-16 h-16 rounded-full bg-rose-gradient flex items-center justify-center text-white shadow-rose hover:shadow-rose-lg active:scale-90 transition-all"
                >
                    <Heart size={32} fill="white" />
                </button>
            </div>
        </div>
    </div>,
    document.body
  );
};
