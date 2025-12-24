
export enum Purpose {
  CONCERT = 'Concert Partner',
  COFFEE = 'Coffee Date',
  EXERCISE = 'Exercise Buddy',
  STUDY = 'Study Together',
  HANGOUT = 'Hangout',
  EVENT = 'Event Companion'
}

export type AuthProvider = 'email' | 'phone' | 'google' | 'apple';
export type SubscriptionTier = 'free' | 'rosegold' | 'roseplatinum';

export interface UserPreferences {
  radius: number;
  strictMatch: boolean;
  ageRange: [number, number];
  genderPreference?: 'Male' | 'Female' | 'Everyone';
  showVerifiedOnly?: boolean;
}

export interface UserPrivacySettings {
  profileVisibility: string;
  locationPrecision: string;
  showDistance: boolean;
  showLastActive: boolean;
  showOnlineStatus: boolean;
  allowProfileViews: boolean;
  allowMessageRequests: boolean;
  showVerifiedOnly: boolean;
}

export interface UserNotificationSettings {
  pushEnabled: boolean;
  pushMatches: boolean;
  pushMessages: boolean;
  pushEvents: boolean;
  pushLikes: boolean;
  pushActivityInvites: boolean;
  emailEnabled: boolean;
  emailWeeklyDigest: boolean;
  emailNewMatches: boolean;
  emailMessages: boolean;
  emailEvents: boolean;
  emailPromotions: boolean;
  smsEnabled: boolean;
  smsImportantOnly: boolean;
}

export interface Language {
  code: string;
  name: string;
  level: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic' | 'Learning';
}

export interface UserStats {
  eventsJoined: number;
  eventsHosted: number;
  connections: number;
  rating: number;
  reviewCount: number;
  attendanceRate: number;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  text: string;
  date: string;
}

export interface Prompt {
  question: string;
  answer: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  heightCm?: number;
  bio: string;
  location: string;
  distanceMiles: number;
  purpose: string; // Changed from Purpose to string to allow custom values
  interests: string[];
  images: string[];
  verified: boolean;
  job?: string;
  education?: string;
  smoking?: string;
  drinking?: string;
  gender?: string;
  exercise?: string;
  religion?: string;
  politics?: string;
  lookingFor?: string;
  prompts?: Prompt[];
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  countryCode?: string;
  phoneVerified?: boolean;
  password?: string;
  providers?: AuthProvider[];
  preferences?: UserPreferences;
  privacySettings?: UserPrivacySettings;
  notificationSettings?: UserNotificationSettings;
  subscriptionTier: SubscriptionTier;
  subscriptionExpires?: string;
  subscriptionStartDate?: string; // Track when subscription started
  subscriptionAutoRenew?: boolean; // Track if auto-renew is enabled
  joinedEvents: string[]; // List of Event IDs
  profileScore?: number;
  profileComplete?: boolean;
  languages?: Language[];
  stats?: UserStats;
  reviews?: Review[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface Chat {
  id: string;
  userId: string; // The other user (or group ID)
  isGroup?: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  messages: Message[];
}

export interface EventDetails {
  whatToBring?: string[];
  ageRange?: string;
  dresscode?: string;
  additionalInfo?: string;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string; // ISO string
  location: string;
  attendees: number;
  maxAttendees?: number;
  participantIds?: string[]; // Array of User IDs who joined
  image: string;
  images?: string[]; // Array of images
  purpose: string; // Changed from Purpose to string
  description: string;
  tags: string[];
  isUserCreated?: boolean;
  creatorId?: string;
  cost?: number;
  details?: EventDetails;
}

export interface Activity {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  image: string;
  tags: string[];
}

export enum AppView {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  DISCOVER = 'DISCOVER',
  EVENTS = 'EVENTS',
  CHATS = 'CHATS',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  CHAT_DETAIL = 'CHAT_DETAIL',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SETTINGS = 'SETTINGS',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PRIVACY_SETTINGS = 'PRIVACY_SETTINGS',
  NOTIFICATION_SETTINGS = 'NOTIFICATION_SETTINGS',
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  SAFETY_VERIFICATION = 'SAFETY_VERIFICATION',
  HELP_CENTER = 'HELP_CENTER',
  BLOCKED_USERS = 'BLOCKED_USERS'
}

export interface Notification {
  id: string;
  type: 'MATCH' | 'MESSAGE' | 'EVENT' | 'ACTIVITY' | 'SYSTEM';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}
