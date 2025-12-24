
import { User, Chat, AppEvent, Notification } from "../types";
import { MOCK_USERS } from "../constants";

const SESSION_KEY = 'rosematch_session_v2'; // Versioned to avoid conflicts with old plain data
const ALL_USERS_KEY = 'rosematch_users_db';
const CHATS_KEY = 'rosematch_chats';
const EVENTS_KEY = 'rosematch_events';
const SWIPED_KEY = 'rosematch_swiped_ids';
const NOTIFICATIONS_KEY = 'rosematch_notifications';

interface SessionData {
  user: User;
  expiresAt: number;
}

// --- User Management ---

export const saveUser = (user: User | null, rememberMe: boolean = true) => {
  if (user) {
    // 30 days for Remember Me, 1 day (or session duration) for standard
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const session: SessionData = {
      user,
      expiresAt: Date.now() + duration
    };

    const payload = JSON.stringify(session);

    if (rememberMe) {
        localStorage.setItem(SESSION_KEY, payload);
        // Clean up session storage to avoid conflicts
        sessionStorage.removeItem(SESSION_KEY);
    } else {
        sessionStorage.setItem(SESSION_KEY, payload);
        // Clean up local storage to ensure we respect the "don't remember" choice
        localStorage.removeItem(SESSION_KEY);
    }

    // Also update in the "DB" so we have the latest profile data
    updateUserInDb(user);
  } else {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
};

export const getUser = (): User | null => {
  // Priority 1: Active Session (SessionStorage)
  let data = sessionStorage.getItem(SESSION_KEY);
  let isPersistent = false;

  // Priority 2: Remembered Device (LocalStorage)
  if (!data) {
      data = localStorage.getItem(SESSION_KEY);
      isPersistent = true;
  }

  if (!data) return null;

  try {
    const session: SessionData = JSON.parse(data);
    
    // Check expiry
    if (Date.now() > session.expiresAt) {
      if (isPersistent) localStorage.removeItem(SESSION_KEY);
      else sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session.user;
  } catch (e) {
    // If JSON parse fails or old format
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

// Simulate a backend database of all users
export const getAllUsers = (): User[] => {
  const stored = localStorage.getItem(ALL_USERS_KEY);
  const localUsers = stored ? JSON.parse(stored) : [];
  // Combine mock users (who aren't in local DB) with local users
  // We ensure no duplicates by ID.
  const all = [...localUsers];
  MOCK_USERS.forEach(mock => {
      if (!all.find((u: User) => u.id === mock.id)) {
          all.push(mock);
      }
  });
  return all;
};

export const addUserToDb = (user: User) => {
    const users = getAllUsers();
    // Only add if not exists (check ID)
    if (!users.find(u => u.id === user.id)) {
        const stored = localStorage.getItem(ALL_USERS_KEY);
        const localUsers = stored ? JSON.parse(stored) : [];
        localUsers.push(user);
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(localUsers));
    }
};

export const updateUserInDb = (user: User) => {
    const stored = localStorage.getItem(ALL_USERS_KEY);
    let localUsers: User[] = stored ? JSON.parse(stored) : [];
    
    const index = localUsers.findIndex(u => u.id === user.id);
    if (index >= 0) {
        localUsers[index] = user;
    } else {
        localUsers.push(user);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(localUsers));
};

// --- Chats ---

export const saveChats = (chats: Chat[]) => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export const getChats = (): Chat[] => {
  const data = localStorage.getItem(CHATS_KEY);
  return data ? JSON.parse(data) : [];
}

// --- Events ---

export const saveCustomEvents = (events: AppEvent[]) => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export const getCustomEvents = (): AppEvent[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

// --- Swipes/Matches ---

export const getSwipedIds = (): string[] => {
    const data = localStorage.getItem(SWIPED_KEY);
    return data ? JSON.parse(data) : [];
}

export const addSwipedId = (id: string) => {
    const current = getSwipedIds();
    if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(SWIPED_KEY, JSON.stringify(current));
    }
}

// --- Notifications ---

export const saveNotifications = (notifications: Notification[]) => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export const getNotifications = (): Notification[] => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
}

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    // We do NOT clear ALL_USERS_KEY because that simulates the database
}
