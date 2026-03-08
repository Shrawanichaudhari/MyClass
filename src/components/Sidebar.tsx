'use client';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_STUDENT = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'practice',  label: 'Practice',  icon: '📚' },
  { id: 'quiz',      label: 'Quiz',      icon: '⚡' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'mentor',    label: 'AI Mentor', icon: '🤖' },
];

const NAV_TEACHER = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'teacher',   label: 'Class View', icon: '📊' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'mentor',    label: 'AI Tools',  icon: '🤖' },
];

const NAV_ADMIN = [
  { id: 'dashboard', label: 'Overview',  icon: '🏠' },
  { id: 'admin',     label: 'Admin',     icon: '⚙️' },
];

const XP_PER_LEVEL = 500;

export default function Sidebar() {
  const { user, xp, level, streak, currentView, setView, logout, addNotification } = useStore();
  
  if (!user) return null;

  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      addNotification('Logged out successfully', 'info');
    } catch (error: any) {
      addNotification('Logout failed', 'warning');
    }
  };

  const navItems =
    user.role === 'teacher' ? NAV_TEACHER :
    user.role === 'admin'   ? NAV_ADMIN   : NAV_STUDENT;

  return (
    <div className="w-64 h-full flex flex-col glass border-r border-white/10 p-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xl font-black text-white shadow-lg glow">M</div>
        <div>
          <div className="font-black text-lg text-white" style={{fontFamily:'Outfit,sans-serif'}}>MY CLASS</div>
          <div className="text-xs text-purple-400">AI Learning Platform</div>
        </div>
      </div>

      {/* User card */}
      <div className="card !p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">{user.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white truncate">{user.name}</div>
          <div className="text-xs text-purple-400 uppercase tracking-wider font-bold" style={{fontSize: '9px'}}>{user.role}</div>
        </div>
      </div>

      {/* XP & Level */}
      <div className="card !p-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-300 font-semibold">⚡ Level {level}</span>
          <span className="text-yellow-400 font-bold">{xp} XP</span>
        </div>
        <div className="xp-bar">
          <motion.div
            className="xp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="text-xs text-slate-500">{xpInLevel}/{XP_PER_LEVEL} XP to Level {level + 1}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl streak-fire">🔥</span>
          <span className="text-sm font-bold text-orange-400">{streak} day streak</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`nav-item w-full text-left ${currentView === item.id ? 'active' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="nav-item w-full text-left text-red-400 hover:bg-red-400/10 transition-colors mt-auto"
      >
        <span className="text-lg">🚪</span>
        Logout
      </button>
    </div>
  );
}
