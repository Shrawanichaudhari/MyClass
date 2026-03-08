import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { StudentAnalytics, MOCK_STUDENTS } from '@/lib/mockStudents';

const MOCK_LEADERS = [
  { id: 'l1', name: 'Priya Patel',   xp: 4820, streak: 32, badge: '🏆', grade: 'Class 10', avatar: '👩‍💻' },
  { id: 'l2', name: 'Rohit Kumar',   xp: 4210, streak: 28, badge: '🥈', grade: 'Class 9',  avatar: '👨‍🎓' },
  { id: 'l3', name: 'Sneha Iyer',    xp: 3980, streak: 21, badge: '🥉', grade: 'Class 10', avatar: '👩‍🎓' },
  { id: 'l4', name: 'Ayesha Khan',   xp: 1120, streak: 10, badge: '🌟', grade: 'Class 8',  avatar: '👩' },
  { id: 'l5', name: 'Vikram Singh',  xp: 890,  streak: 8,  badge: '💫', grade: 'Class 9',  avatar: '👨' },
  { id: 'l6', name: 'Ankit Gupta',   xp: 620,  streak: 4,  badge: '⭐', grade: 'Class 8',  avatar: '👨‍💻' },
];

export default function Leaderboard() {
  const { user, xp } = useStore();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      setLoading(true);
      try {
        // Fetch real students from 'users'
        const usersQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const usersSnapshot = await getDocs(usersQuery);
        const realUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch analytics
        const analyticsSnapshot = await getDocs(collection(db, 'students'));
        const analyticsMap = new Map();
        analyticsSnapshot.forEach(doc => analyticsMap.set(doc.id, doc.data()));

        // Combine
        const combinedReal: any[] = realUsers.map((u: any) => {
          const analytics = analyticsMap.get(u.id) || {};
          return {
            id: u.id,
            name: u.name || 'Anonymous',
            avatar: u.avatar || '👤',
            xp: (analytics.accuracy * 1000) + (analytics.engagementTime * 10) || 0,
            streak: analytics.consistencyScore * 20 || 0,
            badge: '🔥',
            grade: u.grade || 'Class 8',
            isYou: u.id === user?.id
          };
        });

        // Add current user if not in combined (e.g. if they are the teacher but we want to show 'You' and they have XP)
        // Actually leaderboard is for students.

        // Merge with MOCK_LEADERS
        const merged = [...combinedReal];
        MOCK_LEADERS.forEach(mock => {
            if (!merged.find(m => m.name === mock.name || m.id === mock.id)) {
                merged.push(mock);
            }
        });

        // Sort by XP
        const sorted = merged.sort((a, b) => b.xp - a.xp).map((p, i) => ({
            ...p,
            rank: i + 1,
        }));

        setLeaders(sorted);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchLeaders();
  }, [user]);

  if (loading) return <div className="p-6 text-white animate-pulse">Calculating rankings...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>🏆 Leaderboard</h1>
        <p className="text-slate-400 mt-1">Class 8 – Mathematics – This Week</p>
      </div>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {[leaders[1], leaders[0], leaders[2]].map((p, i) => {
            const heights = ['h-28', 'h-36', 'h-24'];
            const ranks = [2, 1, 3];
            return (
              <motion.div key={p.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                className="flex flex-col items-center gap-2">
                <div className="text-3xl">{p.avatar}</div>
                <div className="text-sm font-bold text-white text-center">{p.name.split(' ')[0]}</div>
                <div className="text-xs text-purple-400">{Math.round(p.xp).toLocaleString()} XP</div>
                <div className={`${heights[i]} w-20 rounded-t-xl flex items-center justify-center text-2xl font-black
                  ${ranks[i]===1 ? 'gradient-gold text-white glow-gold' :
                    ranks[i]===2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                    'bg-gradient-to-br from-amber-700 to-amber-900 text-white'}`}>
                  {ranks[i] === 1 ? '🏆' : ranks[i] === 2 ? '🥈' : '🥉'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {leaders.map((p, i) => (
          <motion.div key={p.id}
            initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay: i * 0.05}}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              p.isYou ? 'bg-purple-500/15 border border-purple-500/40' : 'card !p-4 hover:bg-white/7'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
              ${p.rank === 1 ? 'bg-yellow-500 text-black' :
                p.rank === 2 ? 'bg-slate-300 text-black' :
                p.rank === 3 ? 'bg-amber-700 text-white' :
                'bg-white/10 text-slate-400'}`}>
              {p.rank}
            </div>
            <div className="text-2xl">{p.avatar}</div>
            <div className="flex-1">
              <div className="font-semibold text-white flex items-center gap-2">
                {p.name}
                {p.isYou && <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">You</span>}
              </div>
              <div className="text-xs text-slate-500">{p.grade} • 🔥 {Math.round(p.streak)} day streak</div>
            </div>
            <div className="text-right">
              <div className="font-black text-purple-400">{Math.round(p.xp).toLocaleString()}</div>
              <div className="text-xs text-slate-500">XP</div>
            </div>
            <div className="text-2xl">{p.badge}</div>
          </motion.div>
        ))}
      </div>

      <div className="card text-center p-4">
        <div className="text-slate-400 text-sm">🏅 Complete more quizzes to climb the leaderboard!</div>
      </div>
    </div>
  );
}
