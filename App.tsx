
import React, { useState, useEffect } from 'react';
import { AppView, User, Chat, Message, Notification, AppEvent } from './types';
import { Auth } from './views/Auth';
import { Onboarding } from './views/Onboarding';
import { Discover } from './views/Discover';
import { Events } from './views/Events';
import { Chats } from './views/Chats';
import { ChatView } from './views/ChatView';
import { Profile } from './views/Profile';
import { NotificationsView } from './views/NotificationsView';
import { Settings } from './views/Settings';
import { Subscription } from './views/Subscription';
import { PrivacySettings } from './views/PrivacySettings';
import { NotificationSettings } from './views/NotificationSettings';
import { PaymentMethods } from './views/PaymentMethods';
import { SafetyVerification } from './views/SafetyVerification';
import { HelpCenter } from './views/HelpCenter';
import { BlockedUsers } from './views/BlockedUsers';
import { Activities } from './views/Activities';
import { Navigation } from './components/Navigation';
import { INITIAL_CHATS } from './constants';
import { saveUser, getUser, saveChats, getChats, clearSession, saveNotifications, getNotifications, updateUserInDb } from './services/storage';
import { calculateProfileScore } from './services/auth';
import { Flower2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [previousView, setPreviousView] = useState<AppView>(AppView.DISCOVER);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Data State
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]); 
  
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      setChats(getChats());
      setNotifications(getNotifications());
      
      if (savedUser.age === 0 || !savedUser.purpose) {
        setCurrentView(AppView.ONBOARDING);
      } else {
        setCurrentView(AppView.DISCOVER);
      }
    } else {
        setCurrentView(AppView.LOGIN);
    }

    setIsInitializing(false);
  }, []);

  // Expiration Check Effect
  useEffect(() => {
    if (currentUser && currentUser.subscriptionTier !== 'free') {
        const expiryDate = currentUser.subscriptionExpires 
            ? new Date(currentUser.subscriptionExpires) 
            : null;
        
        if (expiryDate && new Date() > expiryDate) {
            // Subscription expired - downgrade to free
            const downgradedUser: User = {
                ...currentUser,
                subscriptionTier: 'free',
                subscriptionExpires: undefined
            };
            
            setCurrentUser(downgradedUser);
            updateUserInDb(downgradedUser);
            saveUser(downgradedUser, !!localStorage.getItem('rosematch_session_v2'));
            
            // Show notification
            addNotification(
                'Subscription Expired', 
                'Your premium subscription has ended. Upgrade to continue enjoying premium features.', 
                'SYSTEM'
            );
        }
    }
  }, [currentUser]);

  const addNotification = (title: string, body: string, type: Notification['type']) => {
      const id = `n_${Date.now()}`;
      const newNotif: Notification = { id, type, title, body, timestamp: Date.now(), read: false };
      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      saveNotifications(updated);
      setToasts(prev => [newNotif, ...prev]);
      setTimeout(() => {
          setToasts(prev => prev.filter(n => n.id !== id));
      }, 4000);
  };

  const handleClearNotifications = () => {
      setNotifications([]);
      saveNotifications([]);
  };

  const handleOpenNotifications = () => {
      // Save the origin view so we can go back to it
      setPreviousView(currentView);
      
      // Mark all as read immediately when opening
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      saveNotifications(updated);
      setCurrentView(AppView.NOTIFICATIONS);
  };

  const handleAuthComplete = (user: User, rememberMe: boolean = true) => {
      setCurrentUser(user);
      saveUser(user, rememberMe);
      setChats(getChats());
      setNotifications(getNotifications());
      if (user.age === 0 || !user.purpose) {
          setCurrentView(AppView.ONBOARDING);
      } else {
          setCurrentView(AppView.DISCOVER);
      }
  };

  const handleOnboardingComplete = (profileData: Partial<User>) => {
      if (!currentUser) return;
      const mergedUser: User = { 
          ...currentUser, 
          ...profileData,
          id: currentUser.id,
          email: currentUser.email,
          password: currentUser.password,
          providers: currentUser.providers
      };
      mergedUser.profileScore = calculateProfileScore(mergedUser);
      setCurrentUser(mergedUser);
      const isPersistent = !!localStorage.getItem('rosematch_session_v2');
      saveUser(mergedUser, isPersistent);
      setCurrentView(AppView.DISCOVER);
  };

  const handleMatch = (matchedUser: User) => {
    const existing = chats.find(c => c.userId === matchedUser.id);
    if (!existing) {
        const newChat: Chat = {
            id: `c_${Date.now()}`,
            userId: matchedUser.id,
            lastMessage: "You matched! Say hello.",
            timestamp: Date.now(),
            unreadCount: 1,
            messages: []
        };
        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        saveChats(updatedChats);
        addNotification('New Match!', `You matched with ${matchedUser.name}`, 'MATCH');
    }
  };

  const handleJoinEvent = (event: AppEvent) => {
      if (!currentUser) return;
      
      const chatId = `group_${event.id}`;
      const existing = chats.find(c => c.id === chatId);

      if (!currentUser.joinedEvents?.includes(event.id)) {
          const updatedUser = { 
              ...currentUser, 
              joinedEvents: [...(currentUser.joinedEvents || []), event.id] 
          };
          setCurrentUser(updatedUser);
          const isPersistent = !!localStorage.getItem('rosematch_session_v2');
          saveUser(updatedUser, isPersistent);
      }

      if (existing) {
          setActiveChatId(chatId);
          setCurrentView(AppView.CHAT_DETAIL);
          const updatedChats = chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c);
          setChats(updatedChats);
          saveChats(updatedChats);
      } else {
          const newChat: Chat = {
              id: chatId,
              userId: `event_${event.id}`, 
              isGroup: true,
              groupName: event.title,
              groupImage: event.image,
              lastMessage: `You joined the group for ${event.title}`,
              timestamp: Date.now(),
              unreadCount: 0,
              messages: [{
                  id: 'sys_1',
                  senderId: 'system',
                  text: 'Welcome to the group chat! Plan your meetup here.',
                  timestamp: Date.now()
              }]
          };
          const updatedChats = [newChat, ...chats];
          setChats(updatedChats);
          saveChats(updatedChats);
          setActiveChatId(chatId);
          setCurrentView(AppView.CHAT_DETAIL);
          addNotification('Event Joined', `Joined ${event.title}`, 'EVENT');
      }
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
        id: `m_${Date.now()}`,
        senderId: 'me',
        text,
        timestamp: Date.now()
    };
    const updatedChats = chats.map(c => {
        if (c.id === chatId) {
            return {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessage: text,
                timestamp: Date.now()
            };
        }
        return c;
    }).sort((a, b) => b.timestamp - a.timestamp);
    setChats(updatedChats);
    saveChats(updatedChats);
  };

  const handleChatSelect = (chat: Chat) => {
      setActiveChatId(chat.id);
      if (chat.unreadCount > 0) {
          const updatedChats = chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c);
          setChats(updatedChats);
          saveChats(updatedChats);
      }
      setCurrentView(AppView.CHAT_DETAIL);
  };

  const handleLogout = () => {
      clearSession();
      setCurrentUser(null);
      setCurrentView(AppView.LOGIN);
      setChats([]);
      setNotifications([]);
      setActiveChatId(null);
  };

  const handleSaveProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      const isPersistent = !!localStorage.getItem('rosematch_session_v2');
      saveUser(updatedUser, isPersistent);
      setCurrentView(AppView.PROFILE);
  };

  const handleUpdateUserSilent = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      const isPersistent = !!localStorage.getItem('rosematch_session_v2');
      saveUser(updatedUser, isPersistent);
  };
  
  const handleUpgrade = (tier: 'rosegold' | 'roseplatinum') => {
    if (!currentUser) return;
    const now = new Date();
    let expirationDate: Date;
    
    // Calculate expiration based on tier
    if (tier === 'rosegold') {
        expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
        expirationDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    
    const updatedUser: User = { 
        ...currentUser, 
        subscriptionTier: tier,
        subscriptionExpires: expirationDate.toISOString(),
        subscriptionStartDate: now.toISOString()
    };
    setCurrentUser(updatedUser);
    const isPersistent = !!localStorage.getItem('rosematch_session_v2');
    saveUser(updatedUser, isPersistent);
    setCurrentView(AppView.PROFILE);
  };

  if (isInitializing) {
      return (
        <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center animate-pulse">
          <div className="w-24 h-24 bg-white rounded-full mb-6 flex items-center justify-center shadow-rose border border-rose-50">
              <Flower2 size={48} className="text-rose-500" strokeWidth={1.5} />
          </div>
          <div className="text-rose-500 font-bold font-serif text-xl tracking-wide">RoseMatch</div>
        </div>
      );
  }

  const renderContent = () => {
    if (!currentUser) return <Auth onComplete={handleAuthComplete} />;

    switch (currentView) {
      case AppView.LOGIN: return <Auth onComplete={handleAuthComplete} />;
      case AppView.ONBOARDING: return <Onboarding onComplete={handleOnboardingComplete} />;
      case AppView.DISCOVER:
        return <Discover 
                currentUser={currentUser} 
                onMatch={handleMatch} 
                onEditSettings={() => setCurrentView(AppView.EDIT_PROFILE)}
                onUpdateUser={handleUpdateUserSilent}
                onOpenNotifications={handleOpenNotifications}
                notificationCount={notifications.filter(n => !n.read).length}
              />;
      case AppView.EVENTS:
        return <Events 
                  currentUser={currentUser} 
                  onJoinEvent={handleJoinEvent} 
                  onUpgrade={() => setCurrentView(AppView.SUBSCRIPTION)} 
                  onOpenNotifications={handleOpenNotifications}
                  notificationCount={notifications.filter(n => !n.read).length}
               />;
      case AppView.CHATS:
        return <Chats 
                  chats={chats} 
                  onSelectChat={handleChatSelect} 
                  onOpenNotifications={handleOpenNotifications}
                  notificationCount={notifications.filter(n => !n.read).length}
               />;
      case AppView.CHAT_DETAIL:
        const activeChat = chats.find(c => c.id === activeChatId);
        if (!activeChat) return <Chats chats={chats} onSelectChat={handleChatSelect} onOpenNotifications={handleOpenNotifications} notificationCount={notifications.length} />;
        return <ChatView 
                  chat={activeChat} 
                  currentUser={currentUser} 
                  onBack={() => setCurrentView(AppView.CHATS)} 
                  onSendMessage={handleSendMessage} 
               />;
      case AppView.PROFILE:
      case AppView.EDIT_PROFILE:
        return <Profile 
            user={currentUser} 
            isEditing={currentView === AppView.EDIT_PROFILE}
            onEdit={() => setCurrentView(AppView.EDIT_PROFILE)}
            onSave={handleSaveProfile}
            onCancel={() => setCurrentView(AppView.PROFILE)}
            onOpenSettings={() => setCurrentView(AppView.SETTINGS)}
            onOpenSubscription={() => setCurrentView(AppView.SUBSCRIPTION)}
            onJoinEvent={handleJoinEvent}
        />;
      case AppView.NOTIFICATIONS:
          return <NotificationsView notifications={notifications} onBack={() => setCurrentView(previousView)} onClear={handleClearNotifications} />;
      case AppView.SETTINGS:
          return <Settings currentUser={currentUser} onNavigate={setCurrentView} onLogout={handleLogout} onUpdateUser={handleSaveProfile} />;
      case AppView.SUBSCRIPTION:
          return <Subscription user={currentUser} onUpgrade={handleUpgrade} onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.PRIVACY_SETTINGS:
          return <PrivacySettings currentUser={currentUser} onUpdateUser={handleUpdateUserSilent} onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.NOTIFICATION_SETTINGS:
          return <NotificationSettings currentUser={currentUser} onUpdateUser={handleUpdateUserSilent} onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.PAYMENT_METHODS:
          return <PaymentMethods onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.SAFETY_VERIFICATION:
          return <SafetyVerification onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.HELP_CENTER:
          return <HelpCenter onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.BLOCKED_USERS:
          return <BlockedUsers onBack={() => setCurrentView(AppView.SETTINGS)} />;
      default:
        return <Discover currentUser={currentUser} onMatch={handleMatch} onEditSettings={() => setCurrentView(AppView.EDIT_PROFILE)} onUpdateUser={handleUpdateUserSilent} onOpenNotifications={handleOpenNotifications} notificationCount={notifications.filter(n => !n.read).length} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen shadow-2xl relative font-sans bg-rose-50 text-gray-800 flex flex-col overflow-x-hidden">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md mx-auto">
          {toasts.map(n => (
              <div key={n.id} className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-rose-lg border border-rose-100 flex gap-4 items-center animate-in slide-in-from-top-2 fade-in">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-rose-50 shrink-0 shadow-sm">
                      <Flower2 size={16} className="text-rose-500" strokeWidth={2} />
                  </div>
                  <div>
                      <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>
                      <p className="text-xs text-gray-500">{n.body}</p>
                  </div>
              </div>
          ))}
      </div>

      <div className="flex-1 relative flex flex-col">
         {renderContent()}
      </div>
      
      {/* Navigation Layer */}
      {currentUser && 
       currentView !== AppView.ONBOARDING && 
       currentView !== AppView.CHAT_DETAIL && 
       currentView !== AppView.NOTIFICATIONS && 
       currentView !== AppView.SETTINGS &&
       currentView !== AppView.SUBSCRIPTION && 
       currentView !== AppView.PRIVACY_SETTINGS &&
       currentView !== AppView.NOTIFICATION_SETTINGS &&
       currentView !== AppView.PAYMENT_METHODS &&
       currentView !== AppView.SAFETY_VERIFICATION &&
       currentView !== AppView.HELP_CENTER &&
       currentView !== AppView.BLOCKED_USERS && (
        <Navigation currentView={currentView} onChange={setCurrentView} />
      )}
    </div>
  );
};

export default App;
