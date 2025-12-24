
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Info, X, DollarSign, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { AppEvent } from '../types';

interface EventCardProps {
  event: AppEvent;
  onJoin: (event: AppEvent) => void;
  isJoined?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin, isJoined }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Normalize images
  const images = event.images && event.images.length > 0 ? event.images : [event.image];
  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;

  // Format Date & Time
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Handle tap on left/right side of image for navigation
  const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;

    const imageContainer = e.currentTarget;
    const rect = imageContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Left third = previous image
    if (clickX < containerWidth / 3 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setImageLoaded(false);
    }
    // Right third = next image
    else if (clickX > (containerWidth * 2) / 3 && currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageLoaded(false);
    }
  };

  return (
    <>
      {/* ========== EVENT CARD ========== */}
      <div className="bg-white rounded-[24px] shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 border border-gray-100/50">
        
        {/* ========== IMAGE SECTION WITH GALLERY ========== */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          
          {/* Image Container */}
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={handleImageTap}
          >
            {/* Main Image */}
            <img
              key={`${event.id}-${currentImageIndex}`}
              src={images[currentImageIndex]}
              alt={`${event.title} - Photo ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />

             {/* Loading Spinner */}
             {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500" />
              </div>
            )}

            {/* ========== IMAGE PROGRESS INDICATORS ========== */}
            {hasMultipleImages && (
              <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 rounded-full overflow-hidden bg-black/20 backdrop-blur-sm"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white w-full'
                          : index < currentImageIndex
                          ? 'bg-white/70 w-full'
                          : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Visual arrows removed as per request, navigation still works via handleImageTap */}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full z-20">
                <span className="text-[10px] font-bold text-white">
                  {currentImageIndex + 1}/{totalImages}
                </span>
              </div>
            )}
          </div>

          {/* ========== CATEGORY BADGE ========== */}
          <div className="absolute top-3 right-3 z-20" style={{ marginTop: hasMultipleImages ? '20px' : '0' }}>
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-rose-600 text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wide border border-rose-100">
              {event.purpose}
            </span>
          </div>

          {/* ========== INFO BUTTON ========== */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoModal(true);
            }}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors z-20"
            style={{ marginTop: hasMultipleImages ? '20px' : '0' }}
          >
            <Info size={16} className="text-white" />
          </button>
        </div>

        {/* ========== CARD CONTENT ========== */}
        <div className="p-5">
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {event.title}
            </h3>
            {event.cost !== undefined && (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    {event.cost === 0 ? 'Free' : `$${event.cost}`}
                </span>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} className="text-rose-400 flex-shrink-0" />
              <span>{dateStr} • {timeStr}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} className="text-rose-400 flex-shrink-0" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={14} className="text-rose-400 flex-shrink-0" />
              <span>
                {event.attendees} going
                {event.maxAttendees && ` • ${event.maxAttendees} max`}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-5 leading-relaxed">
            {event.description}
          </p>

          <button
            onClick={() => onJoin(event)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 ${
                isJoined 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose'
            }`}
          >
            {isJoined ? 'Open Group Chat' : 'Join Event'}
          </button>

        </div>
      </div>

      {/* ========== INFO MODAL ========== */}
      {showInfoModal && (
        <EventInfoModal 
          event={event} 
          images={images}
          dateStr={dateStr}
          timeStr={timeStr}
          onClose={() => setShowInfoModal(false)} 
          onJoin={() => { setShowInfoModal(false); onJoin(event); }}
          isJoined={isJoined}
        />
      )}
    </>
  );
};

interface EventInfoModalProps {
  event: AppEvent;
  images: string[];
  dateStr: string;
  timeStr: string;
  onClose: () => void;
  onJoin: () => void;
  isJoined?: boolean;
}

export const EventInfoModal: React.FC<EventInfoModalProps> = ({ event, images, dateStr, timeStr, onClose, onJoin, isJoined }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;

    const imageContainer = e.currentTarget;
    const rect = imageContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;

    if (clickX < containerWidth / 3 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
    else if (clickX > (containerWidth * 2) / 3 && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-[32px] md:rounded-[32px] shadow-2xl max-h-[90vh] h-[90vh] md:h-auto overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
        
        {/* ========== MODAL HEADER WITH IMAGE GALLERY ========== */}
        <div 
            className="relative h-72 shrink-0 bg-gray-100 cursor-pointer"
            onClick={handleImageTap}
        >
          <img
            src={images[currentImageIndex]}
            alt={event.title}
            className="w-full h-full object-cover"
          />

          {/* Navigation Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors z-40 pointer-events-auto"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Progress Indicators */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 right-16 flex gap-1.5 z-30 pointer-events-none">
                {images.map((_, index) => (
                <div key={index} className="flex-1 h-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm">
                    <div className={`h-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-full' : 'bg-transparent w-0'}`} />
                </div>
                ))}
            </div>
          )}

          {/* Visual arrows removed as per request, navigation still works via handleImageTap on the container */}

          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
             <span className="inline-block px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wide mb-2">
                {event.purpose}
             </span>
             <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                {event.title}
             </h2>
          </div>
        </div>

        {/* ========== SCROLLABLE CONTENT ========== */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-rose-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                <p className="text-sm font-bold text-gray-900">{dateStr}</p>
                <p className="text-xs text-gray-500">{timeStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-rose-500">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{event.location}</p>
                <p className="text-xs text-blue-500 font-medium cursor-pointer">View Map</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-rose-500">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attendees</p>
                <p className="text-sm font-bold text-gray-900">{event.attendees} Going</p>
                {event.maxAttendees && <p className="text-xs text-gray-500">{event.maxAttendees - event.attendees} spots left</p>}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-green-500">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cost</p>
                <p className="text-sm font-bold text-gray-900">{event.cost === 0 ? 'Free' : `$${event.cost}`}</p>
                <p className="text-xs text-gray-500">Per person</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">About Event</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    {event.description}
                </p>
            </section>

            {event.details && (
                <>
                    {event.details.whatToBring && event.details.whatToBring.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">What to Bring</h3>
                            <ul className="grid grid-cols-2 gap-2">
                                {event.details.whatToBring.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                         {event.details.ageRange && (
                            <section>
                                <h3 className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Age Range</h3>
                                <p className="font-medium text-gray-800">{event.details.ageRange}</p>
                            </section>
                         )}
                         {event.details.dresscode && (
                            <section>
                                <h3 className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Dress Code</h3>
                                <p className="font-medium text-gray-800">{event.details.dresscode}</p>
                            </section>
                         )}
                    </div>
                    
                    {event.details.additionalInfo && (
                        <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                <Info size={14}/> Need to know
                            </h3>
                            <p className="text-sm text-blue-900">{event.details.additionalInfo}</p>
                        </section>
                    )}
                </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3 sticky bottom-0 z-10 pb-safe">
            <button className="p-3.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <Share2 size={20} />
            </button>
            <button
              onClick={onJoin}
              className={`flex-1 py-3.5 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 ${
                isJoined
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                  : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
              }`}
            >
              {isJoined ? 'Open Chat' : 'Join Event'}
            </button>
        </div>
      </div>
    </div>
  );
};
