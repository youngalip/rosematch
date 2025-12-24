
import React, { useState } from 'react';
import { User } from '../types';
import { Check, X, Star, Crown, Shield } from 'lucide-react';

interface SubscriptionProps {
  user: User;
  onUpgrade: (tier: 'rosegold' | 'roseplatinum') => void;
  onBack: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ user, onUpgrade, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="h-full bg-slate-50 flex flex-col relative overflow-y-auto pb-8">
      <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-20 flex justify-between items-center shadow-sm">
         <h1 className="text-2xl font-serif font-bold text-slate-900">Choose Your Plan</h1>
         <button onClick={onBack} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
             <X size={24} />
         </button>
      </div>

      <div className="p-6 space-y-6">
          
          {/* Pro Monthly Card */}
          <div 
            onClick={() => setSelectedPlan('monthly')}
            className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer relative ${selectedPlan === 'monthly' ? 'border-rose-500 shadow-xl shadow-rose-100' : 'border-slate-100 shadow-sm'}`}
          >
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-lg font-serif font-bold text-slate-800 uppercase tracking-wide">Pro Monthly</h3>
                      <div className="text-3xl font-serif font-bold text-rose-500">$9.99<span className="text-sm text-slate-400 font-sans font-medium">/mo</span></div>
                  </div>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider font-bold">
                      Renews every 30 days
                  </span>
                  {selectedPlan === 'monthly' && <div className="bg-rose-500 text-white rounded-full p-1"><Check size={16} /></div>}
              </div>
              
              <ul className="space-y-3">
                  {[
                      'Create unlimited activities',
                      'See who liked you',
                      'Priority in search',
                      'Advanced filters',
                      'Unlimited messaging',
                      'No ads'
                  ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <Check size={16} className="text-rose-500" />
                          {feat}
                      </li>
                  ))}
              </ul>
          </div>

          {/* Pro Annual Card */}
          <div 
            onClick={() => setSelectedPlan('annual')}
            className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border-2 transition-all cursor-pointer relative overflow-hidden ${selectedPlan === 'annual' ? 'border-gold-400 shadow-xl shadow-slate-400/50' : 'border-transparent shadow-md'}`}
          >
              <div className="absolute top-0 right-0 bg-gold-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Best Value - Save 33%
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                      <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide flex items-center gap-2">
                          Pro Annual <Crown size={18} className="text-gold-400" />
                      </h3>
                      <div className="text-3xl font-serif font-bold text-gold-400">$79.99<span className="text-sm text-slate-400 font-sans font-medium">/yr</span></div>
                      <div className="text-xs text-slate-400 font-medium mt-1">($6.67/month)</div>
                  </div>
                  <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-1 rounded uppercase tracking-wider font-bold">
                      Renews annually
                  </span>
                  {selectedPlan === 'annual' && <div className="bg-gold-400 text-slate-900 rounded-full p-1"><Check size={16} /></div>}
              </div>
              
              <ul className="space-y-3 relative z-10">
                  <li className="flex items-center gap-3 text-sm text-white font-bold">
                       <Check size={16} className="text-gold-400" />
                       Everything in Monthly
                  </li>
                  {[
                      '2 months FREE',
                      'Exclusive Gold Badge',
                      'Early feature access'
                  ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                          <Check size={16} className="text-gold-400" />
                          {feat}
                      </li>
                  ))}
              </ul>
          </div>

          <button 
              onClick={() => onUpgrade(selectedPlan === 'annual' ? 'roseplatinum' : 'rosegold')}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 text-white ${selectedPlan === 'annual' ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-rose-500 to-rose-600'}`}
          >
              {selectedPlan === 'annual' ? 'Get Pro Annual' : 'Get Pro Monthly'}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 px-4 leading-relaxed">
              By subscribing, you agree to our Terms of Service. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
          </p>
      </div>
    </div>
  );
};
