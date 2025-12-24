
import React, { useState } from 'react';
import { Activity, User } from '../types';
import { MOCK_ACTIVITIES } from '../constants';
import { Plus, MapPin, Calendar, Users, Filter } from 'lucide-react';

interface ActivitiesProps {
  currentUser: User;
}

export const Activities: React.FC<ActivitiesProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'MY_ACTIVITIES'>('DISCOVER');
  const [isCreating, setIsCreating] = useState(false);
  
  // Creation Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const renderCreateModal = () => (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-800">New Activity</h2>
                  <button onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:text-slate-600">Close</button>
              </div>

              <div className="space-y-4">
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
                    placeholder="Activity Title (e.g., Sunset Yoga)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 h-24 resize-none"
                    placeholder="Describe what you want to do..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />
                  <div className="flex gap-3">
                      <input 
                        type="datetime-local"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-xs"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                      />
                  </div>
                   <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
                    placeholder="Location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-500/20 mt-4"
                  >
                      Post Activity
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col relative">
      {isCreating && renderCreateModal()}
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-serif font-bold text-rose-900">Activities</h1>
            <button onClick={() => setIsCreating(true)} className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors">
                <Plus size={24} />
            </button>
        </div>
        
        <div className="flex gap-6 border-b border-rose-100">
            <button 
                onClick={() => setActiveTab('DISCOVER')}
                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'DISCOVER' ? 'text-rose-600' : 'text-slate-400'}`}
            >
                Discover
                {activeTab === 'DISCOVER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-t-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('MY_ACTIVITIES')}
                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'MY_ACTIVITIES' ? 'text-rose-600' : 'text-slate-400'}`}
            >
                My Activities
                {activeTab === 'MY_ACTIVITIES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-t-full" />}
            </button>
        </div>
      </div>

      {/* Filters (Mock) */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-rose-100 rounded-full text-xs font-bold text-rose-600 shadow-sm">
              <Filter size={14} />
              Filter
          </button>
          {['Fitness', 'Arts', 'Food', 'Outdoors'].map(cat => (
              <button key={cat} className="px-3 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-medium text-slate-600 whitespace-nowrap">
                  {cat}
              </button>
          ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-[120px]">
         {MOCK_ACTIVITIES.map(activity => (
             <div key={activity.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-rose-50/50">
                 <div className="h-32 relative">
                     <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                         {activity.category}
                     </div>
                 </div>
                 <div className="p-4">
                     <h3 className="text-lg font-bold text-slate-800 mb-1">{activity.title}</h3>
                     <p className="text-slate-500 text-sm mb-4 line-clamp-2">{activity.description}</p>
                     
                     <div className="flex flex-col gap-2 mb-4">
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Calendar size={14} className="text-rose-400" />
                             {activity.date}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <MapPin size={14} className="text-rose-400" />
                             {activity.location}
                         </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Users size={14} className="text-rose-400" />
                             {activity.currentParticipants} / {activity.maxParticipants} participants
                         </div>
                     </div>

                     <button className="w-full py-2.5 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition-colors">
                         Join Activity
                     </button>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
};
