
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowLeft } from 'lucide-react';

export const BlockedUsers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);

  const handleUnblock = (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
       {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Blocked Users</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {blockedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <p className="text-slate-500">No blocked users</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map(user => (
              <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <img src={user.images[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">Blocked</p>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
