
import React, { useState, useRef } from 'react';
import { Purpose, User } from '../types';
import { INTERESTS } from '../constants';
import { Camera, ArrowRight, X, Image as ImageIcon, Folder, PenTool, AlertCircle } from 'lucide-react';
import { CameraView } from '../components/CameraView';
import { checkCameraPermission } from '../utils/cameraUtils';

interface OnboardingProps {
  onComplete: (user: Partial<User>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [customPurpose, setCustomPurpose] = useState('');
  
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAgeChange = (value: string) => {
    setAge(value);
    const ageNum = parseInt(value, 10);
    if (!value) setAgeError(''); 
    else if (isNaN(ageNum)) setAgeError('Please enter a valid number');
    else if (ageNum < 18 || ageNum > 99) setAgeError('Age must be between 18 and 99');
    else setAgeError('');
  };

  const preventInvalidAgeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    setProfileImage(imageSrc);
    setShowCamera(false);
    setShowPhotoOptions(false);
  };

  const handleOpenCamera = async () => {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setCameraError('Camera access denied. Please enable permissions in settings.');
      return;
    }
    setCameraError('');
    setShowCamera(true);
  };

  const handleNext = () => {
    if (step === 3) {
      const finalPurpose = selectedPurpose === 'Other' ? customPurpose : selectedPurpose;
      const profileData: Partial<User> = {
        name,
        age: parseInt(age) || 18,
        bio: bio || 'Just exploring!',
        location: 'New York, NY',
        distanceMiles: 0,
        purpose: finalPurpose || Purpose.COFFEE,
        interests,
        images: profileImage ? [profileImage] : ['https://picsum.photos/400/600?random=99'],
        verified: false,
        joinedEvents: []
      };
      onComplete(profileData);
    } else {
      setStep(step + 1);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    }
  };

  const isAgeValid = age && !ageError && parseInt(age) >= 18 && parseInt(age) <= 99;
  const isPurposeValid = selectedPurpose === 'Other' ? customPurpose.trim().length > 0 : !!selectedPurpose;

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col p-6 overflow-y-auto pb-20">
      {showCamera && (
        <CameraView onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      {cameraError && (
        <div className="fixed top-4 left-4 right-4 z-[100] bg-red-500 text-white p-4 rounded-2xl shadow-xl animate-in slide-in-from-top flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-bold flex-1">{cameraError}</p>
          <button onClick={() => setCameraError('')} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={16}/></button>
        </div>
      )}

      {showPhotoOptions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
                <div className="p-4 border-b border-slate-100 text-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                    Add Photo
                </div>
                <div className="p-4 space-y-3">
                    <button 
                        onClick={() => { handleOpenCamera(); setShowPhotoOptions(false); }} 
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 transition-colors group text-left"
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm text-rose-500 group-hover:scale-110 transition-transform"><Camera size={24} /></div>
                        <div><div className="font-bold text-slate-800">Take Photo</div><div className="text-xs text-slate-500">Use your camera</div></div>
                    </button>
                    <button 
                        onClick={() => { fileInputRef.current?.click(); }} 
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 transition-colors group text-left"
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm text-rose-500 group-hover:scale-110 transition-transform"><ImageIcon size={24} /></div>
                        <div><div className="font-bold text-slate-800">Photo Library</div><div className="text-xs text-slate-500">Select from gallery</div></div>
                    </button>
                </div>
                <div className="p-4 bg-slate-50">
                    <button onClick={() => setShowPhotoOptions(false)} className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                </div>
            </div>
        </div>
      )}

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center">
        <div className="flex gap-2 mb-8 mt-4">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? 'bg-rose-500' : 'bg-rose-200'}`} />
            ))}
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-serif font-bold text-rose-900 mb-2">Welcome to RoseMatch</h1>
            <p className="text-rose-700 mb-8">First, tell us a bit about yourself.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-rose-800 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-rose-100 focus:border-rose-400 outline-none bg-white/50 text-lg font-medium"
                  placeholder="e.g., Rose"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-rose-800 mb-1">Age (18-99)</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={e => handleAgeChange(e.target.value)}
                  onKeyDown={preventInvalidAgeInput}
                  min="18"
                  max="99"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none bg-white/50 text-lg font-medium transition-colors ${ageError ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-rose-100 focus:border-rose-400'}`}
                  placeholder="25"
                />
                {ageError && <p className="text-red-500 text-xs mt-1 font-medium">{ageError}</p>}
              </div>
              
              <div className="pt-4 flex justify-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  {profileImage ? (
                    <div className="relative w-32 h-40 rounded-2xl overflow-hidden shadow-md group border-2 border-white">
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setProfileImage(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                  ) : (
                    <button 
                        onClick={() => setShowPhotoOptions(true)}
                        className="w-32 h-40 bg-rose-100 rounded-3xl border-2 border-dashed border-rose-300 flex flex-col items-center justify-center text-rose-400 cursor-pointer hover:bg-rose-200 transition-all hover:scale-105 active:scale-95 group shadow-inner"
                    >
                        <Camera size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs mt-2 font-bold uppercase tracking-wider">Add Photo</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h1 className="text-3xl font-serif font-bold text-rose-900 mb-2">What's your purpose?</h1>
             <p className="text-rose-700 mb-6">Choose how you want to connect today.</p>

             <div className="grid grid-cols-2 gap-3 mb-6">
               {Object.values(Purpose).map((p) => (
                 <button
                    key={p}
                    onClick={() => setSelectedPurpose(p)}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${
                      selectedPurpose === p 
                        ? 'border-rose-500 bg-rose-500 text-white shadow-lg scale-[1.02]' 
                        : 'border-white bg-white text-slate-600 hover:border-rose-200'
                    }`}
                 >
                   <span className="font-bold block text-sm">{p}</span>
                 </button>
               ))}
               
               <button
                  onClick={() => setSelectedPurpose('Other')}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${
                    selectedPurpose === 'Other'
                      ? 'border-rose-500 bg-rose-500 text-white shadow-lg scale-[1.02]' 
                      : 'border-white bg-white text-slate-600 hover:border-rose-200'
                  }`}
               >
                 <span className="font-bold block text-sm flex items-center gap-2">
                    <PenTool size={16} />
                    Other
                 </span>
               </button>
             </div>

             {selectedPurpose === 'Other' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-rose-800 mb-1">Enter your purpose</label>
                    <input 
                      type="text" 
                      value={customPurpose}
                      onChange={e => setCustomPurpose(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-rose-300 focus:border-rose-500 outline-none bg-white text-lg font-medium placeholder:text-gray-300"
                      placeholder="e.g., Skydiving, Language Exchange..."
                      autoFocus
                    />
                </div>
             )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h1 className="text-3xl font-serif font-bold text-rose-900 mb-2">Refine your profile</h1>
             <p className="text-rose-700 mb-6">Select up to 5 interests.</p>

             <div className="flex flex-wrap gap-2 mb-6">
                {INTERESTS.map(int => (
                  <button
                    key={int}
                    onClick={() => toggleInterest(int)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      interests.includes(int)
                      ? 'bg-rose-500 text-white shadow-md scale-105'
                      : 'bg-white text-slate-500 border border-slate-100 hover:bg-rose-50'
                    }`}
                  >
                    {int}
                  </button>
                ))}
             </div>

             <div>
                <label className="block text-sm font-medium text-rose-800 mb-1">Your Bio</label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-rose-100 focus:border-rose-400 outline-none bg-white/50 text-sm h-24 resize-none font-medium"
                  placeholder="I love hiking on weekends..."
                />
             </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={
            (step === 1 && (!name || !isAgeValid)) ||
            (step === 2 && !isPurposeValid) ||
            (step === 3 && interests.length === 0)
          }
          className="mt-8 w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
        >
          {step === 3 ? 'Start Matching' : 'Continue'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
