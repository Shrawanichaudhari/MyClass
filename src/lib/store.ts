import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface TopicMastery {
  topic: string;
  score: number; // 0-100
  attempts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  grade: string;
  board: string;
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  sessionXP: number;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  isComplete: boolean;
}

interface AppState {
  // User
  user: User | null;
  isLoggedIn: boolean;

  // Gamification
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  topicMastery: TopicMastery[];

  // Game
  gameState: GameState;
  currentView: 'dashboard' | 'practice' | 'quiz' | 'leaderboard' | 'mentor' | 'teacher' | 'admin';

  // Notifications
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'info' }[];

  // Actions
  login: (user: User) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  awardBadge: (badgeId: string) => void;
  setView: (view: AppState['currentView']) => void;
  updateGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
  updateMastery: (topic: string, correct: boolean) => void;
  addNotification: (message: string, type: 'success' | 'warning' | 'info') => void;
  dismissNotification: (id: string) => void;
}

const XP_PER_LEVEL = 500;
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

const DEFAULT_USER: User = {
  id: 'student-1',
  name: 'Arjun Sharma',
  email: 'arjun@myclass.edu',
  role: 'student',
  avatar: '🧑‍💻',
  grade: 'Class 8',
  board: 'CBSE',
};

const INITIAL_BADGES: Badge[] = [
  { id: 'first-correct', name: 'First Step', icon: '🎯', description: 'Answer your first question correctly', earned: true, earnedAt: '2024-01-01' },
  { id: 'streak-7', name: 'Week Warrior', icon: '🔥', description: 'Maintain a 7-day streak', earned: true, earnedAt: '2024-01-10' },
  { id: 'xp-500', name: 'XP Hunter', icon: '⚡', description: 'Earn 500 XP total', earned: true, earnedAt: '2024-01-15' },
  { id: 'perfect-quiz', name: 'Perfectionist', icon: '💎', description: 'Score 100% on a quiz', earned: false },
  { id: 'streak-30', name: 'Month Master', icon: '🏆', description: 'Maintain a 30-day streak', earned: false },
  { id: 'topics-10', name: 'Explorer', icon: '🗺️', description: 'Complete 10 different topics', earned: false },
  { id: 'questions-100', name: 'Century', icon: '💯', description: 'Answer 100 questions', earned: false },
  { id: 'ai-mentor', name: 'AI Friend', icon: '🤖', description: 'Use the AI mentor 10 times', earned: false },
];

const INITIAL_MASTERY: TopicMastery[] = [
  { topic: 'Algebra', score: 42, attempts: 32 },
  { topic: 'Geometry', score: 88, attempts: 25 },
  { topic: 'Fractions', score: 55, attempts: 18 },
  { topic: 'Trigonometry', score: 30, attempts: 14 },
  { topic: 'Statistics', score: 71, attempts: 20 },
  { topic: 'Probability', score: 65, attempts: 12 },
  { topic: 'Mensuration', score: 78, attempts: 16 },
  { topic: 'Linear Equations', score: 50, attempts: 22 },
];

const INITIAL_GAME_STATE: GameState = {
  currentQuestion: 0,
  totalQuestions: 10,
  score: 0,
  sessionXP: 0,
  showFeedback: false,
  lastAnswerCorrect: null,
  isComplete: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      xp: 1240,
      level: 3,
      streak: 12,
      badges: INITIAL_BADGES,
      topicMastery: INITIAL_MASTERY,
      gameState: INITIAL_GAME_STATE,
      currentView: 'dashboard',
      notifications: [],

      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),

      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = getLevel(newXP);
        const oldLevel = get().level;
        set({ xp: newXP, level: newLevel });
        if (newLevel > oldLevel) {
          get().addNotification(`🎉 Level Up! You reached Level ${newLevel}!`, 'success');
        }
      },

      incrementStreak: () => {
        const newStreak = get().streak + 1;
        set({ streak: newStreak });
        if (newStreak % 7 === 0) {
          get().addNotification(`🔥 ${newStreak}-day streak! Amazing dedication!`, 'success');
        }
      },

      awardBadge: (badgeId) => set((state) => ({
        badges: state.badges.map(b =>
          b.id === badgeId ? { ...b, earned: true, earnedAt: new Date().toISOString() } : b
        ),
      })),

      setView: (view) => set({ currentView: view }),

      updateGameState: (partial) => set((state) => ({
        gameState: { ...state.gameState, ...partial },
      })),

      resetGame: () => set({ gameState: INITIAL_GAME_STATE }),

      updateMastery: (topic, correct) => set((state) => {
        const existing = state.topicMastery.find(t => t.topic === topic);
        if (existing) {
          const newScore = correct
            ? Math.min(100, existing.score + 3)
            : Math.max(0, existing.score - 5);
          return {
            topicMastery: state.topicMastery.map(t =>
              t.topic === topic ? { ...t, score: newScore, attempts: t.attempts + 1 } : t
            ),
          };
        }
        return {
          topicMastery: [...state.topicMastery, { topic, score: correct ? 60 : 30, attempts: 1 }],
        };
      }),

      addNotification: (message, type) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, { id, message, type }],
        }));
        setTimeout(() => get().dismissNotification(id), 4000);
      },

      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
    }),
    { name: 'myclass-store', partialize: (s) => ({ xp: s.xp, level: s.level, streak: s.streak, badges: s.badges, topicMastery: s.topicMastery, user: s.user }) }
  )
);
