
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, AlertCircle, Apple, Chrome, CheckCircle, Eye, EyeOff, ArrowLeft, Search, ChevronDown, X, Phone, ArrowRight, ShieldCheck, Check, Flower2 } from 'lucide-react';
import { validateEmail, validatePasswordStrict, validateName, apiLoginEmail, apiRegisterEmail, apiSendOtp, apiVerifyOtpAndLogin, apiVerifyOtpAndRegister, apiSocialLogin, apiForgotPassword, PasswordValidationResult } from '../services/auth';
import { saveUser } from '../services/storage';

interface AuthProps {
  onComplete: (user: User, rememberMe: boolean) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';
type Method = 'EMAIL' | 'PHONE';
type Step = 'INPUT' | 'VERIFY_OTP';

const COUNTRY_CODES = [
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico' },
];

export const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [method, setMethod] = useState<Method>('EMAIL');
  const [step, setStep] = useState<Step>('INPUT');
  
  // View States
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Helpers
  const [pwdValidation, setPwdValidation] = useState<PasswordValidationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (mode === 'REGISTER' && password) {
        setPwdValidation(validatePasswordStrict(password));
    } else {
        setPwdValidation(null);
    }
  }, [password, mode]);

  const resetForm = () => {
      setError(null);
      setSuccessMsg(null);
      setPassword('');
      setOtp('');
      setStep('INPUT');
      setRememberMe(false);
  };

  const handleModeSwitch = () => {
      setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
      resetForm();
  }

  const handleSocial = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    try {
      const user = await apiSocialLogin(provider);
      saveUser(user, true); 
      onComplete(user, true);
    } catch (err) {
      setError(`${provider} sign-in failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
        if (method === 'EMAIL') {
            if (mode === 'REGISTER') {
                 if (!name) throw new Error("Please enter your name");
                 if (!validateEmail(email)) throw new Error("Invalid email format");
                 if (!pwdValidation?.isValid) throw new Error("Password does not meet requirements");
                 const user = await apiRegisterEmail(name, email, password);
                 onComplete(user, rememberMe);
            } else {
                 const user = await apiLoginEmail(email, password);
                 onComplete(user, rememberMe);
            }
        } else {
            // PHONE FLOW
            if (mode === 'REGISTER') {
                if (!name) throw new Error("Please enter your name");
                if (phone.length < 8) throw new Error("Invalid phone number");
                if (!pwdValidation?.isValid) throw new Error("Password does not meet requirements");
            }
            await apiSendOtp(selectedCountry.code, phone);
            setStep('VERIFY_OTP');
            setSuccessMsg("Verification code sent to " + selectedCountry.code + " " + phone);
        }
    } catch (err: any) {
        setError(err.message || "Action failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
      setError(null);
      setLoading(true);
      try {
          let user: User;
          if (mode === 'LOGIN') {
              user = await apiVerifyOtpAndLogin(selectedCountry.code, phone, otp);
          } else {
              user = await apiVerifyOtpAndRegister(name, selectedCountry.code, phone, otp, password);
          }
          onComplete(user, rememberMe);
      } catch (err: any) {
          setError(err.message || "Verification failed");
      } finally {
          setLoading(false);
      }
  };
  
  const handleForgotPassword = async () => {
      if (!email) {
          setError("Please enter your email address first");
          return;
      }
      setLoading(true);
      try {
          await apiForgotPassword(email);
          setSuccessMsg("Reset link sent to your email.");
      } catch (e) {
          setError("Failed to send reset link");
      } finally {
          setLoading(false);
      }
  };

  const PasswordStrengthMeter = () => {
      if (!pwdValidation) return null;
      
      const requirements = [
          { label: '8+ chars', met: pwdValidation.hasMinLength },
          { label: 'Uppercase', met: pwdValidation.hasUpper },
          { label: 'Number', met: pwdValidation.hasNumber },
          { label: 'Symbol !@#$', met: pwdValidation.hasSpecial },
      ];

      return (
          <div className="space-y-3 pt-1">
              <div className="flex gap-1 h-1">
                  {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= pwdValidation.score ? (pwdValidation.score < 3 ? 'bg-orange-400' : 'bg-green-500') : 'bg-gray-100'}`} />
                  ))}
              </div>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {requirements.map((req, i) => (
                      <span 
                        key={i} 
                        className={`text-[10px] font-bold px-1.5 py-1 rounded-md border transition-all duration-300 whitespace-nowrap flex-1 text-center ${
                            req.met 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                          {req.label}
                      </span>
                  ))}
              </div>
          </div>
      )
  };

  const CountryModal = () => (
      <div className="fixed inset-0 z-[1005] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <span className="font-bold text-lg text-gray-800">Select Country</span>
                  <button onClick={() => setShowCountryModal(false)}><X size={24} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                  {COUNTRY_CODES.map((c) => (
                      <button 
                        key={c.name}
                        onClick={() => { setSelectedCountry(c); setShowCountryModal(false); }}
                        className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                          <span className="text-2xl mr-4">{c.flag}</span>
                          <span className="flex-1 text-left font-medium text-gray-700">{c.name}</span>
                          <span className="text-gray-400 font-bold">{c.code}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 pb-20 font-sans relative overflow-y-auto">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[30%] bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />

      {showCountryModal && <CountryModal />}
      
      <div className="w-full max-w-md relative z-10 my-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-rose border border-rose-50 relative overflow-hidden group transform -rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-100/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <Flower2 size={48} className="text-rose-500 relative z-10 drop-shadow-sm" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {step === 'VERIFY_OTP' ? 'Verify Code' : (mode === 'LOGIN' ? 'Welcome to RoseMatch' : 'Create Account')}
            </h1>
            <p className="text-rose-500 font-medium tracking-wide text-sm">
                {step === 'VERIFY_OTP' 
                    ? `Enter code sent to ${selectedCountry.code} ${phone}`
                    : (mode === 'LOGIN' ? 'Log in to find your match' : 'Join the exclusive community')
                }
            </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-rose-lg border border-white/50 backdrop-blur-sm">
            <div className="space-y-5">
                 {/* Social Buttons (Only on Input step) */}
                {step === 'INPUT' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleSocial('google')} className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
                                <Chrome size={20} className="text-blue-500" />
                                <span className="font-bold text-gray-700 text-sm">Google</span>
                            </button>
                            <button onClick={() => handleSocial('apple')} className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-95">
                                <Apple size={20} />
                                <span className="font-bold text-sm">Apple</span>
                            </button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Or continue with</span></div>
                        </div>

                        {/* Method Toggle */}
                        <div className="flex p-1 bg-gray-50 rounded-xl mb-4">
                            <button 
                                onClick={() => setMethod('EMAIL')}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${method === 'EMAIL' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Email
                            </button>
                            <button 
                                onClick={() => setMethod('PHONE')}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${method === 'PHONE' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Phone
                            </button>
                        </div>
                    </>
                )}

                {/* --- FORMS --- */}

                {/* REGISTER NAME */}
                {step === 'INPUT' && mode === 'REGISTER' && (
                    <div className="relative group animate-in slide-in-from-bottom-2 fade-in">
                        <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><UserIcon size={20} /></div>
                        <input 
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                            placeholder="Full Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                )}

                {/* EMAIL INPUT */}
                {step === 'INPUT' && method === 'EMAIL' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><Mail size={20} /></div>
                            <input 
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                             <div className="relative group">
                                <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><Lock size={20} /></div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-rose-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                            {mode === 'REGISTER' && <PasswordStrengthMeter />}
                        </div>
                        
                        {/* Options: Remember Me (Login Only) / Forgot Password */}
                        {mode === 'LOGIN' && (
                            <div className="flex items-center justify-between min-h-[40px]">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-300 group-hover:border-rose-300'}`}>
                                        {rememberMe ? <Check size={14} className="text-white" /> : null}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                    <div className="text-left">
                                        <span className="text-xs font-bold text-gray-600 block">Remember me</span>
                                        <span className="text-[10px] text-gray-400 hidden sm:block">Stay signed in on this device</span>
                                    </div>
                                </label>
                                <button onClick={handleForgotPassword} className="text-xs font-bold text-rose-500 hover:text-rose-600">Forgot Password?</button>
                            </div>
                        )}
                    </div>
                )}

                {/* PHONE INPUT */}
                {step === 'INPUT' && method === 'PHONE' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setShowCountryModal(true)}
                                className="w-24 px-3 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 flex items-center justify-between"
                             >
                                 <span className="text-xl">{selectedCountry.flag}</span>
                                 <span className="text-sm font-bold text-gray-600">{selectedCountry.code}</span>
                             </button>
                             <div className="flex-1 relative group">
                                <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><Phone size={20} /></div>
                                <input 
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                    placeholder="Mobile Number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    type="tel"
                                />
                             </div>
                        </div>

                        {mode === 'REGISTER' && (
                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><Lock size={20} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                        placeholder="Create Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                <PasswordStrengthMeter />
                            </div>
                        )}
                        
                        {/* Options: Remember Me (Login Only) */}
                        {mode === 'LOGIN' && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-300 group-hover:border-rose-300'}`}>
                                        {rememberMe ? <Check size={14} className="text-white" /> : null}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                    <div>
                                        <span className="text-xs font-bold text-gray-600 block">Remember me</span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {/* VERIFY OTP */}
                {step === 'VERIFY_OTP' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="relative group">
                             <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors"><ShieldCheck size={20} /></div>
                             <input 
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 transition-all font-bold text-gray-800 placeholder:text-gray-400 tracking-widest text-lg"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                type="tel"
                            />
                        </div>
                        <button 
                            onClick={() => setStep('INPUT')}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                            Wrong number? Go back
                        </button>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in-95">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                 {successMsg && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in-95">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}

                <button 
                    onClick={step === 'INPUT' ? handleSubmit : handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-rose-gradient text-white py-4 rounded-xl font-bold text-lg shadow-rose hover:shadow-rose-lg transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : (
                        step === 'INPUT' 
                            ? (method === 'PHONE' ? 'Send Code' : (mode === 'LOGIN' ? 'Log In' : 'Create Account'))
                            : 'Verify & Continue'
                    )}
                    {!loading && <ArrowRight size={20} />}
                </button>
            </div>
            
            {/* Footer */}
            {step === 'INPUT' && (
                <div className="text-center mt-6">
                    <button onClick={handleModeSwitch} className="text-sm font-medium text-gray-500">
                        {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"} <span className="text-rose-500 font-bold hover:underline">{mode === 'LOGIN' ? 'Sign Up' : 'Log In'}</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
