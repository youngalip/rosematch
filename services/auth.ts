
import { User, Purpose, AuthProvider } from '../types';
import { getAllUsers, addUserToDb, saveUser } from './storage';

// --- Crypto Helpers ---

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Validation Helpers ---

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const validatePasswordStrict = (password: string): PasswordValidationResult => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Comprehensive special character check
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push("Min 8 chars");
  if (!hasUpper) errors.push("Uppercase letter");
  if (!hasLower) errors.push("Lowercase letter");
  if (!hasNumber) errors.push("Number");
  if (!hasSpecial) errors.push("Symbol");

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return {
    isValid: errors.length === 0,
    errors,
    score, 
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  };
};

export const validateName = (name: string): boolean => {
  const re = /^[a-zA-Z\s'-]{2,50}$/;
  return re.test(name.trim());
};

// --- API Simulations ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiCheckEmail = async (email: string): Promise<boolean> => {
  await delay(500);
  const allUsers = getAllUsers();
  return !allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
};

export const apiLoginEmail = async (email: string, password: string): Promise<User> => {
  await delay(1000); 
  
  const allUsers = getAllUsers();
  const foundUser = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!foundUser) {
      throw new Error("Invalid email or password");
  }

  // Handle mock users or social users without passwords
  if (!foundUser.password) {
       throw new Error("Please login with the method you used to sign up (Social/Phone)");
  }

  const inputHash = await hashPassword(password);
  if (foundUser.password !== inputHash) {
      throw new Error("Invalid email or password");
  }
  
  return foundUser;
};

export const apiRegisterEmail = async (name: string, email: string, password: string): Promise<User> => {
  await delay(1500);
  
  const available = await apiCheckEmail(email);
  if (!available) {
      throw new Error("Email already in use.");
  }

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    age: 0,
    bio: '',
    location: 'Unknown',
    distanceMiles: 0,
    purpose: Purpose.HANGOUT,
    interests: [],
    images: ['https://picsum.photos/400/600?grayscale'],
    verified: false,
    providers: ['email'],
    preferences: { radius: 50, strictMatch: false, ageRange: [18, 50], genderPreference: 'Everyone' },
    subscriptionTier: 'free',
    joinedEvents: [],
    profileScore: 20,
    profileComplete: false
  };

  addUserToDb(newUser);
  return newUser;
};

// --- Phone Auth ---

export const apiCheckPhone = async (countryCode: string, phone: string): Promise<boolean> => {
  await delay(500);
  const allUsers = getAllUsers();
  const cleanPhone = phone.replace(/\D/g, '');
  return !allUsers.find(u => u.phone === cleanPhone && u.countryCode === countryCode);
}

// 1. Send OTP
export const apiSendOtp = async (countryCode: string, phone: string): Promise<string> => {
  await delay(1000);
  // In production, trigger SMS here
  console.log(`[RoseMatch Mock SMS] Code for ${countryCode}${phone} is 123456`);
  return "verification_id_" + Date.now();
};

// 2. Verify OTP and Login/Register
export const apiVerifyOtpAndLogin = async (countryCode: string, phone: string, otp: string): Promise<User> => {
  await delay(1500);
  if (otp !== '123456') throw new Error("Invalid verification code");
  
  const cleanPhone = phone.replace(/\D/g, '');
  const allUsers = getAllUsers();
  const foundUser = allUsers.find(u => u.phone === cleanPhone && u.countryCode === countryCode);
  
  if (!foundUser) throw new Error("Account not found. Please sign up.");
  
  return foundUser;
};

export const apiVerifyOtpAndRegister = async (name: string, countryCode: string, phone: string, otp: string, password?: string): Promise<User> => {
    await delay(1500);
    if (otp !== '123456') throw new Error("Invalid verification code");
    
    const available = await apiCheckPhone(countryCode, phone);
    if (!available) throw new Error("Phone number already registered. Please log in.");
    
    const cleanPhone = phone.replace(/\D/g, '');
    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await hashPassword(password);
    }
    
    const newUser: User = {
       id: `u_ph_${Date.now()}`,
       name,
       countryCode,
       phone: cleanPhone,
       phoneVerified: true,
       password: hashedPassword,
       age: 0,
       bio: '',
       location: 'Unknown',
       distanceMiles: 0,
       purpose: Purpose.HANGOUT,
       interests: [],
       images: ['https://picsum.photos/400/600?grayscale'],
       verified: true,
       providers: ['phone'],
       preferences: { radius: 50, strictMatch: false, ageRange: [18, 50], genderPreference: 'Everyone' },
       subscriptionTier: 'free',
       joinedEvents: [],
       profileScore: 20,
       profileComplete: false
    };
    addUserToDb(newUser);
    return newUser;
};


// --- Social ---

export const apiSocialLogin = async (provider: 'google' | 'apple'): Promise<User> => {
  await delay(1500);
  
  const email = `demo_${provider}@example.com`;
  const allUsers = getAllUsers();
  let user = allUsers.find(u => u.email === email);

  if (!user) {
      user = {
        id: `u_${provider}_${Date.now()}`,
        name: provider === 'google' ? 'Google User' : 'Apple User',
        email,
        emailVerified: true,
        age: 0, 
        bio: '',
        location: 'Unknown',
        distanceMiles: 0,
        purpose: Purpose.HANGOUT,
        interests: [],
        images: ['https://picsum.photos/400/600'],
        verified: true,
        providers: [provider],
        preferences: { radius: 50, strictMatch: false, ageRange: [18, 50] },
        subscriptionTier: 'free',
        joinedEvents: [],
        profileScore: 30,
        profileComplete: false
      };
      addUserToDb(user);
  }
  
  return user;
};

// --- Reset Password ---

export const apiForgotPassword = async (email: string): Promise<void> => {
    await delay(1000);
    // Simulate sending email
};

export const calculateProfileScore = (user: User): number => {
    let score = 0;
    if (user.images.length > 0) score += 20;
    if (user.age > 0) score += 15;
    if (user.bio.length >= 20) score += 15;
    if (user.interests.length >= 3) score += 20;
    if (user.purpose) score += 10;
    if (user.preferences) score += 10;
    if (user.verified) score += 10;
    return Math.min(score, 100);
}
