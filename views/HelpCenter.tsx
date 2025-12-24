
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const HelpCenter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const helpTopics = [
    {
      category: 'Getting Started',
      questions: [
        'How do I create an account?',
        'How do I set up my profile?',
        'How does matching work?',
        'What are the different purposes?'
      ]
    },
    {
      category: 'Safety & Privacy',
      questions: [
        'How do I report someone?',
        'How do I block a user?',
        'Is my data secure?',
        'How do I verify my profile?'
      ]
    },
    {
      category: 'Events & Activities',
      questions: [
        'How do I create an event?',
        'How do I join an activity?',
        'Can I cancel my RSVP?',
        'How do I invite people?'
      ]
    },
    {
      category: 'Subscription & Billing',
      questions: [
        'What are the subscription tiers?',
        'How do I upgrade my account?',
        'How do I cancel my subscription?',
        'What payment methods are accepted?'
      ]
    }
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col">
       {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Help Center</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
          />
        </div>

        {/* Topics */}
        {helpTopics.map((topic, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">{topic.category}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {topic.questions.map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-slate-700">{q}</span>
                  <span className="text-slate-400">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <h4 className="font-semibold text-rose-900 mb-2">Still need help?</h4>
          <button className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
