
import { Purpose, User, AppEvent, Chat, Activity } from './types';

export const INTERESTS = [
  'Music', 'Travel', 'Foodie', 'Fitness', 'Art', 'Tech', 
  'Hiking', 'Photography', 'Gaming', 'Reading', 'Movies',
  'Cooking', 'Dancing', 'Yoga', 'Politics', 'Fashion',
  'Wine', 'Pets', 'Shopping', 'Home & DIY'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Isabella',
    age: 24,
    heightCm: 165,
    bio: 'Looking for someone to explore the indie music scene with. I love vinyl records and spicy food.',
    location: 'Downtown',
    distanceMiles: 2.5,
    purpose: Purpose.CONCERT,
    interests: ['Music', 'Travel', 'Art'],
    images: [
      'https://picsum.photos/400/600?random=1',
      'https://picsum.photos/400/600?random=2',
      'https://picsum.photos/400/600?random=13'
    ],
    verified: true,
    job: 'Graphic Designer',
    education: 'Bachelor of Fine Arts',
    smoking: 'No',
    drinking: 'Socially',
    subscriptionTier: 'free',
    joinedEvents: [],
    languages: [{ code: 'en', name: 'English', level: 'Native' }, { code: 'es', name: 'Spanish', level: 'Intermediate' }],
    stats: {
        eventsJoined: 12,
        eventsHosted: 0,
        connections: 156,
        rating: 4.8,
        reviewCount: 24,
        attendanceRate: 89
    },
    reviews: [
        { id: 'r1', reviewerName: 'Sarah M.', reviewerImage: 'https://picsum.photos/100/100?random=50', rating: 5, text: "Great person to do activities with! Very friendly.", date: "2 days ago" },
        { id: 'r2', reviewerName: 'Mike R.', reviewerImage: 'https://picsum.photos/100/100?random=51', rating: 5, text: "Had a blast at the hiking trip!", date: "1 week ago" }
    ]
  },
  {
    id: 'u2',
    name: 'Marcus',
    age: 27,
    heightCm: 183,
    bio: 'Training for a half-marathon and need a running buddy who can keep up!',
    location: 'Westside',
    distanceMiles: 5.1,
    purpose: Purpose.EXERCISE,
    interests: ['Fitness', 'Hiking', 'Tech'],
    images: [
      'https://picsum.photos/400/600?random=3',
      'https://picsum.photos/400/600?random=4'
    ],
    verified: true,
    job: 'Software Engineer',
    subscriptionTier: 'rosegold',
    joinedEvents: [],
    languages: [{ code: 'en', name: 'English', level: 'Native' }],
    stats: { eventsJoined: 5, eventsHosted: 2, connections: 45, rating: 4.9, reviewCount: 10, attendanceRate: 100 }
  },
  {
    id: 'u3',
    name: 'Sophia',
    age: 23,
    heightCm: 160,
    bio: 'Coffee addict looking for the best latte in town. Let\'s study or just chat.',
    location: 'University District',
    distanceMiles: 1.2,
    purpose: Purpose.COFFEE,
    interests: ['Reading', 'Coffee', 'Politics'],
    images: [
      'https://picsum.photos/400/600?random=5',
      'https://picsum.photos/400/600?random=6'
    ],
    verified: false,
    job: 'Grad Student',
    subscriptionTier: 'free',
    joinedEvents: []
  },
   {
    id: 'u4',
    name: 'James',
    age: 29,
    heightCm: 185,
    bio: 'New in town. Want to check out the local art galleries and museums.',
    location: 'North End',
    distanceMiles: 8.0,
    purpose: Purpose.HANGOUT,
    interests: ['Art', 'Photography', 'Travel'],
    images: [
      'https://picsum.photos/400/600?random=7',
      'https://picsum.photos/400/600?random=8'
    ],
    verified: true,
    job: 'Architect',
    subscriptionTier: 'roseplatinum',
    joinedEvents: []
  }
];

// Helper for dynamic future dates
const futureDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const MOCK_EVENTS: AppEvent[] = [
  {
    id: 'e1',
    title: 'Neon Nights Concert',
    date: futureDate(5), // 5 days from now
    location: 'The Rose Arena',
    attendees: 142,
    maxAttendees: 200,
    image: 'https://picsum.photos/600/400?random=10',
    images: [
        'https://picsum.photos/600/400?random=10',
        'https://picsum.photos/600/400?random=20',
        'https://picsum.photos/600/400?random=30'
    ],
    purpose: Purpose.CONCERT,
    description: 'An electric evening of synth-pop and neon lights. Meet up with fellow music lovers! We will be meeting at the main entrance before the show.',
    tags: ['Live Music', 'Nightlife'],
    cost: 45,
    details: {
        whatToBring: ['Ticket', 'ID', 'Earplugs'],
        ageRange: '18+',
        dresscode: 'Neon & Casual',
        additionalInfo: 'Doors open at 7PM. Show starts at 8PM.'
    }
  },
  {
    id: 'e2',
    title: 'Sunrise Yoga in the Park',
    date: futureDate(1), // Tomorrow
    location: 'Central Park',
    attendees: 56,
    maxAttendees: 60,
    image: 'https://picsum.photos/600/400?random=11',
    images: [
        'https://picsum.photos/600/400?random=11',
        'https://picsum.photos/600/400?random=21'
    ],
    purpose: Purpose.EXERCISE,
    description: 'Start your weekend with zen. All levels welcome. Bring your own mat and water. We will meet near the fountain.',
    tags: ['Wellness', 'Fitness'],
    cost: 0,
    details: {
        whatToBring: ['Yoga Mat', 'Water Bottle', 'Towel'],
        ageRange: 'All ages',
        dresscode: 'Athletic wear',
        additionalInfo: 'In case of rain, event will be moved to the community center.'
    }
  },
  {
    id: 'e3',
    title: 'Tech & Coffee Mixer',
    date: futureDate(3),
    location: 'Brew Lab',
    attendees: 89,
    maxAttendees: 100,
    image: 'https://picsum.photos/600/400?random=12',
    images: [
        'https://picsum.photos/600/400?random=12',
        'https://picsum.photos/600/400?random=22',
        'https://picsum.photos/600/400?random=32'
    ],
    purpose: Purpose.COFFEE,
    description: 'Network with local devs and designers over artisan coffee. A great way to meet potential co-founders or just chat about the latest tech.',
    tags: ['Networking', 'Tech'],
    cost: 5,
    details: {
        whatToBring: ['Business Cards', 'Laptop (optional)'],
        ageRange: '21+',
        dresscode: 'Smart Casual',
        additionalInfo: 'First coffee is on the house!'
    }
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    hostId: 'u2',
    title: 'Saturday Morning 5K',
    description: 'Easy pace run along the river. Coffee afterwards!',
    category: 'Fitness',
    date: 'Sat, 9:00 AM',
    location: 'Riverside Park',
    maxParticipants: 5,
    currentParticipants: 3,
    image: 'https://images.unsplash.com/photo-1552674605-46d53169014d?auto=format&fit=crop&q=80&w=400',
    tags: ['Running', 'Social']
  },
  {
    id: 'a2',
    hostId: 'u4',
    title: 'Gallery Hopping',
    description: 'Checking out the new modern art exhibit downtown.',
    category: 'Arts',
    date: 'Sun, 2:00 PM',
    location: 'Modern Art Museum',
    maxParticipants: 4,
    currentParticipants: 2,
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&q=80&w=400',
    tags: ['Art', 'Museum']
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'c1',
    userId: 'u1',
    lastMessage: 'That sounds amazing! I love Tame Impala too.',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! I saw you like indie music.', timestamp: Date.now() - 1000 * 60 * 60 },
      { id: 'm2', senderId: 'me', text: 'Yes! Huge fan. Going to any concerts soon?', timestamp: Date.now() - 1000 * 60 * 55 },
      { id: 'm3', senderId: 'u1', text: 'That sounds amazing! I love Tame Impala too.', timestamp: Date.now() - 1000 * 60 * 30 }
    ]
  }
];
