
import React, { useState } from 'react';
import { Shield, Camera, Mail, Phone, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

export const SafetyVerification: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [verificationStatus, setVerificationStatus] = useState({
    email: true,
    phone: false,
    photo: false,
    identity: false
  });

  return (
    <div className="h-full bg-slate-50 flex flex-col">
       {/* Header */}
      <div className="bg-white px-4 py-4 pt-8 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-600 hover:text-rose-500">
             <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Safety & Verification</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Verification Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {Object.values(verificationStatus).filter(Boolean).length}/4 Verified
          </h2>
          <p className="text-slate-600">
            Complete all verifications to increase trust and visibility
          </p>
        </div>

        {/* Verification Options */}
        <div className="space-y-3">
          <VerificationCard
            icon={Mail}
            title="Email Verification"
            description="Verify your email address"
            verified={verificationStatus.email}
            onVerify={() => {}}
          />

          <VerificationCard
            icon={Phone}
            title="Phone Verification"
            description="Verify your phone number"
            verified={verificationStatus.phone}
            onVerify={() => {}}
          />

          <VerificationCard
            icon={Camera}
            title="Photo Verification"
            description="Take a selfie to verify your photos"
            verified={verificationStatus.photo}
            onVerify={() => {}}
          />

          <VerificationCard
            icon={Shield}
            title="Identity Verification"
            description="Upload ID for enhanced trust"
            verified={verificationStatus.identity}
            onVerify={() => {}}
          />
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            Safety Tips
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span>•</span>
              <span>Never share personal information like your address or financial details</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Meet in public places for first dates</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Tell a friend where you're going</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Trust your instincts - if something feels off, it probably is</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Report suspicious behavior immediately</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const VerificationCard: React.FC<{
  icon: any;
  title: string;
  description: string;
  verified: boolean;
  onVerify: () => void;
}> = ({ icon: Icon, title, description, verified, onVerify }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          verified ? 'bg-green-100' : 'bg-slate-100'
        }`}>
          <Icon size={24} className={verified ? 'text-green-600' : 'text-slate-600'} />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        {verified ? (
          <CheckCircle size={24} className="text-green-500" />
        ) : (
          <button
            onClick={onVerify}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
};
