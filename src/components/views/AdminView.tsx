import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { seedStudentData, db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { MOCK_STUDENTS } from '@/lib/mockStudents';

const ADMIN_STATS = [
  { label: 'Total Users', value: '12,480', icon: '👥', color: 'text-blue-400', delta: '+128 this week' },
  { label: 'Active Students', value: '8,342', icon: '🧑‍🎓', color: 'text-green-400', delta: '+89 today' },
  { label: 'Questions Generated', value: '4.2M', icon: '❓', color: 'text-purple-400', delta: '+12K today' },
  { label: 'XP Distributed', value: '98.6M', icon: '⚡', color: 'text-yellow-400', delta: '+840K today' },
];

const BOARDS = [
  { name: 'CBSE', students: 7200, color: '#7c3aed' },
  { name: 'State Board (MH)', students: 3100, color: '#3b82f6' },
  { name: 'State Board (UP)', students: 1560, color: '#10b981' },
  { name: 'State Board (TN)', students: 620, color: '#f59e0b' },
];

const RECENT_ACTIVITY = [
  { action: 'New user signup', detail: 'Priya Sharma – Class 9', time: '2m ago', icon: '👤' },
  { action: 'AI Mentor used', detail: 'Query: "Explain trigonometry"', time: '5m ago', icon: '🤖' },
  { action: 'Badge awarded', detail: 'Rohit Kumar – "10-Day Streak"', time: '8m ago', icon: '🏅' },
  { action: 'Quiz completed', detail: 'Class 8A – Algebra Quiz – 67% avg', time: '12m ago', icon: '📝' },
  { action: 'Teacher alert sent', detail: '12 students struggling with Algebra', time: '15m ago', icon: '🚨' },
];

export default function AdminView() {
  const { user, addNotification } = useStore();
  const [seeding, setSeeding] = useState(false);
  const [realStats, setRealStats] = useState({ users: 0, students: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users')));
        const studentsSnap = await getDocs(query(collection(db, 'students')));
        setRealStats({
           users: usersSnap.size + 12400, // Merging real with base mock count for visual "scale"
           students: studentsSnap.size + 8300
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-6xl text-red-500">🛡️</div>
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-slate-400">Only administrators can access this console.</p>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    addNotification("Starting database seeding...", "info");
    try {
      await seedStudentData(MOCK_STUDENTS);
      addNotification("Database seeded successfully with 50 students!", "success");
    } catch (error) {
      console.error(error);
      addNotification("Seeding failed. Check console.", "warning");
    }
    setSeeding(false);
  };

  const handleQuickAction = (action: string) => {
    addNotification(`Action initiated: ${action}`, "info");
  };
  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>👑 Admin Panel</h1>
        <p className="text-slate-400 mt-1">Platform health and global analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: realStats.users.toLocaleString(), icon: '👥', color: 'text-blue-400', delta: '+128 this week' },
          { label: 'Active Students', value: realStats.students.toLocaleString(), icon: '🧑‍🎓', color: 'text-green-400', delta: '+89 today' },
          { label: 'Questions Generated', value: '4.2M', icon: '❓', color: 'text-purple-400', delta: '+12K today' },
          { label: 'XP Distributed', value: '98.6M', icon: '⚡', color: 'text-yellow-400', delta: '+840K today' },
        ].map((s, i) => (
          <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="card text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-xs text-green-400 mt-1">{s.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Board distribution */}
        <div className="card">
          <h2 className="font-bold text-white mb-4">🏫 Board Distribution</h2>
          <div className="space-y-3">
            {BOARDS.map((b, i) => {
              const total = BOARDS.reduce((s, x) => s + x.students, 0);
              const pct = Math.round((b.students / total) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{b.name}</span>
                    <span className="text-slate-400">{b.students.toLocaleString()} students ({pct}%)</span>
                  </div>
                  <div className="xp-bar">
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:i*0.1, duration:0.7}}
                      className="h-full rounded-full" style={{background:b.color}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="font-bold text-white mb-4">⚡ Real-time Activity</h2>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((a, i) => (
              <motion.div key={i} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm flex-shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{a.action}</div>
                  <div className="text-xs text-slate-500 truncate">{a.detail}</div>
                </div>
                <div className="text-xs text-slate-600 flex-shrink-0">{a.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin quick actions */}
      <div className="card">
        <h2 className="font-bold text-white mb-4">🛠️ Admin Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', icon: '👥' },
            { label: 'Manage Content', icon: '📚' },
            { label: 'AI Configuration', icon: '🤖' },
            { label: 'View Logs', icon: '📋' },
            { label: 'Security Settings', icon: '🔒' },
            { label: 'Announcements', icon: '📢' },
            { label: 'Export Reports', icon: '📊' },
            { label: 'System Health', icon: '💚' },
          ].map((a, i) => (
            <button 
              key={i} 
              onClick={() => handleQuickAction(a.label)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 hover:bg-white/10 transition-all group text-center"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{a.icon}</span>
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{a.label}</span>
            </button>
          ))}
          <button 
            disabled={seeding}
            onClick={handleSeed}
            className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 flex flex-col items-center gap-2 hover:bg-purple-600/30 transition-all group text-center col-span-2 lg:col-span-1"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">{seeding ? '⏳' : '📥'}</span>
            <span className="text-xs text-purple-400 font-bold">{seeding ? 'Seeding...' : 'Seed Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
