
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple-pay' | 'google-pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export const PaymentMethods: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col">
       {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Payment Methods</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Add New Button */}
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-colors"
        >
          <Plus size={20} className="text-rose-500" />
          <span className="font-semibold text-slate-700">Add Payment Method</span>
        </button>

        {/* Payment Methods List */}
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="bg-white rounded-2xl p-4 shadow-sm border-2 border-transparent hover:border-rose-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                  <CreditCard size={24} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">
                      {pm.brand} •••• {pm.last4}
                    </p>
                    {pm.isDefault && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Expires {pm.expiryMonth}/{pm.expiryYear}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!pm.isDefault && (
                    <button
                      onClick={() => handleSetDefault(pm.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Set as default"
                    >
                      <Check size={20} className="text-slate-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Secure Payments</h4>
              <p className="text-sm text-green-700">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <AddCardModal onClose={() => setShowAddCard(false)} />
      )}
    </div>
  );
};

// Add Card Modal Component
const AddCardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process card addition
    console.log('Adding card:', cardData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add Card</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};
