'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { StudentIntelligence } from '@/lib/ml';
import { MOCK_STUDENTS, StudentAnalytics } from '@/lib/mockStudents';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Trophy, TrendingUp, Clock, Target, Rocket, Lightbulb, Brain, Star, HeartHandshake, User, MessageSquare, ChevronRight } from 'lucide-react';

const fadeIn = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// Mock data for charts
const activityData = [
  { day: 'Mon', xp: 120, time: 45 },
  { day: 'Tue', xp: 300, time: 80 },
  { day: 'Wed', xp: 200, time: 55 },
  { day: 'Thu', xp: 450, time: 110 },
  { day: 'Fri', xp: 380, time: 90 },
  { day: 'Sat', xp: 150, time: 35 },
  { day: 'Sun', xp: 250, time: 60 },
];

export default function Dashboard() {
  const { user, xp, level, streak, badges, topicMastery, setView, addXP, addNotification, incrementStreak } = useStore();
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
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
        const combinedReal: StudentAnalytics[] = realUsers.map((u: any) => {
          const analytics = analyticsMap.get(u.id) || {};
          return {
            id: u.id,
            name: u.name || 'Anonymous',
            avatar: u.avatar || '👤',
            grade: u.grade || 'Class 8',
            accuracy: analytics.accuracy ?? 0.1,
            completionRate: analytics.completionRate ?? 0,
            engagementTime: analytics.engagementTime ?? 0,
            consistencyScore: analytics.consistencyScore ?? 0,
            topicsPerformance: analytics.topicsPerformance ?? {},
          };
        });

        // Merge with Mock
        const merged = [...combinedReal];
        MOCK_STUDENTS.forEach(mock => {
          if (!merged.find(s => s.name === mock.name || s.id === mock.id)) {
            merged.push(mock);
          }
        });

        // Filter for same grade to find relevant peers
        const sameGrade = user?.grade ? merged.filter(s => s.grade === user?.grade) : merged;
        setStudents(sameGrade);
      } catch (err) {
        setStudents(MOCK_STUDENTS);
      }
      setLoading(false);
    }
    fetchStudents();
  }, [user]);

  const weakTopics = topicMastery.filter(t => t.score < 60).sort((a,b) => a.score - b.score).slice(0, 3);
  const earnedBadges = badges.filter(b => b.earned);
  
  // Custom Analytics
  const avgAccuracy = Math.round(topicMastery.reduce((acc, t) => acc + t.score, 0) / topicMastery.length);
  const totalTimeSpent = activityData.reduce((acc, d) => acc + d.time, 0);
  const classRank = Math.max(1, 15 - Math.floor(xp / 200)); 

  // ML-Powered Insights
  const currentLevel = StudentIntelligence.predictTrend({
    id: user?.id || 'temp',
    name: user?.name || 'User',
    avatar: '👤',
    accuracy: avgAccuracy / 100,
    grade: user?.grade || 'N/A',
    completionRate: 0.8,
    engagementTime: totalTimeSpent / 60,
    consistencyScore: streak / 10,
    topicsPerformance: Object.fromEntries(topicMastery.map(t => [t.topic, t.score]))
  });

  // ML-Powered Peer Mentors
  const mentorRecs = StudentIntelligence.findMentors({
    id: user?.id || 'temp',
    name: user?.name || 'User',
    avatar: '👤',
    accuracy: avgAccuracy / 100,
    grade: user?.grade || 'N/A',
    completionRate: 0.8,
    engagementTime: totalTimeSpent / 60,
    consistencyScore: streak / 10,
    topicsPerformance: Object.fromEntries(topicMastery.map(t => [t.topic, t.score]))
  }, students);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-8 overflow-y-auto h-full scroll-smooth pb-24">
      {/* Welcome & Rank Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeIn} className="lg:col-span-2 rounded-3xl p-8 relative overflow-hidden group border border-white/10 shadow-2xl" 
          style={{background:'linear-gradient(135deg,rgba(124,58,237,0.4) 0%,rgba(59,130,246,0.3) 100%)'}}>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 backdrop-blur-md flex items-center gap-2">
                 <Brain className="w-3 h-3 text-purple-400" /> ML Level: {currentLevel}
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 backdrop-blur-md">
                 Rank #{classRank}
              </div>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight" style={{fontFamily:'Outfit,sans-serif'}}>
              Stay Focused, {user?.name.split(' ')[0]}! 🚀
            </h1>
            <p className="text-purple-200 mt-2 max-w-md text-sm font-medium">
              The AI Intelligence engine detected you are <span className="text-yellow-400 font-black">{currentLevel}</span>. 
              {currentLevel === 'Improving' ? " Keep this momentum to break into Top 3!" : " Focus on those weak areas to level up!"}
            </p>
            <div className="flex gap-4 mt-8">
              <button className="btn-primary px-8 shadow-xl shadow-purple-500/20" onClick={() => setView('quiz')}>Take a Quiz</button>
              <button className="bg-white/10 hover:bg-white/20 text-white font-black py-3 px-8 rounded-xl transition-all border border-white/10 backdrop-blur-md" onClick={() => setView('practice')}>Practice</button>
            </div>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-[180px] opacity-10 blur-sm group-hover:scale-110 transition-transform duration-700 pointer-events-none select-none">🎓</div>
        </motion.div>

        <motion.div variants={fadeIn} className="card bg-slate-900/50 flex flex-col items-center justify-center text-center p-8 border-yellow-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Star className="w-16 h-16 text-yellow-500" /></div>
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-4 border border-yellow-500/30 rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="text-xs font-black text-slate-500 mb-1 tracking-widest uppercase">Class Standing</div>
          <div className="text-6xl font-black text-white tracking-tighter">#{classRank}</div>
          <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Top {Math.round(classRank/15*100)}% Excellence</p>
        </motion.div>
      </div>

      {/* Analytics & ML Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeIn} className="card min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-white flex items-center gap-2 tracking-tight"><TrendingUp className="w-5 h-5 text-purple-400" /> Mastery Forecast</h2>
            <div className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full uppercase tracking-widest">AI Projected</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#7c3aed', fontWeight:'bold' }}
              />
              <Line type="monotone" dataKey="xp" stroke="#7c3aed" strokeWidth={4} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeIn} className="card min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-white flex items-center gap-2 tracking-tight"><Clock className="w-5 h-5 text-blue-400" /> Focus Distribution</h2>
            <div className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full uppercase tracking-widest">Live: {totalTimeSpent}m</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                cursor={{fill: '#ffffff03'}}
              />
              <Bar dataKey="time" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Peer Mentors Section */}
      {mentorRecs.length > 0 && (
        <motion.div variants={fadeIn} className="card bg-white/[0.02] border-white/5 overflow-hidden">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <HeartHandshake className="w-6 h-6 text-green-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Collaborative Scholars</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ML Powered Pairing</p>
                 </div>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed italic">&quot;Scholars are students with &gt;90% mastery in your weak areas. Connect to learn faster!&quot;</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentorRecs.slice(0, 3).map((rec, i) => (
                <div key={i} className="p-6 rounded-[32px] bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                   <div className="text-xs font-black text-purple-400 mb-4 uppercase tracking-widest">Top {rec.topic} Mentor</div>
                   <div className="space-y-4">
                      {rec.mentors.slice(0, 2).map((m, idx) => (
                        <div key={m.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="text-3xl bg-white/5 p-2 rounded-xl">{m.avatar}</span>
                              <div>
                                 <div className="font-black text-white text-sm">{m.name}</div>
                                 <div className="text-[10px] text-green-400 font-bold uppercase">{Math.round((m.topicsPerformance[rec.topic] || 0))}% Mastery</div>
                              </div>
                           </div>
                           <button onClick={() => addNotification(`Collaboration request sent to ${m.name}!`, 'success')} 
                              className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all group/btn">
                              <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Mastery Heatmap */}
        <motion.div variants={fadeIn} className="card lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.02] font-black pointer-events-none select-none italic">MASTERY</div>
          <div className="flex items-center justify-between mb-6">
             <h2 className="font-black text-white flex items-center gap-2"><Target className="w-5 h-5 text-green-400" /> Knowledge Inventory</h2>
             <div className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full uppercase tracking-widest">Avg: {avgAccuracy}%</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topicMastery.map((t, i) => {
              const score = t.score;
              const bg = score >= 80 ? 'bg-green-500/10 border-green-500/20' : 
                         score >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' : 
                         'bg-red-500/10 border-red-500/20';
              const text = score >= 80 ? 'text-green-400' : 
                           score >= 60 ? 'text-yellow-400' : 
                           'text-red-400';
              return (
                <div key={i} className={`p-5 rounded-3xl border ${bg} flex flex-col justify-between h-32 group hover:scale-[1.02] transition-transform shadow-xl`}>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{t.topic}</div>
                   <div className={`text-4xl font-black ${text} tracking-tighter`}>{score}%</div>
                   <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{t.attempts} Checkups</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ML Intelligence Panel */}
        <motion.div variants={fadeIn} className="card overflow-hidden bg-white/5 border-white/5">
          <div className="p-2 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-600/30 group-hover:rotate-6 transition-transform">
               <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white text-lg leading-tight tracking-tight">AI Diagnostic</h2>
              <div className="text-[10px] text-purple-400 font-black uppercase tracking-widest">ML Prediction Engine</div>
            </div>
          </div>
          <div className="space-y-4">
            {weakTopics.length > 0 ? (
              <>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5"><Rocket className="w-12 h-12 text-purple-400" /></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Focus</div>
                  <div className="text-sm font-black text-white uppercase italic tracking-tight">Defeat {weakTopics[0].topic}</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">ML analysis shows a <span className="text-purple-400 font-bold">42% chance</span> of rapid improvement in this area.</p>
                  <button onClick={() => setView('practice')} className="w-full mt-2 text-[10px] font-black py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest">Initiate Training</button>
                </div>
                <div className="space-y-3">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Other Conceptual Holes</div>
                   {weakTopics.slice(1, 3).map((t, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 border-l-orange-500/50 hover:bg-white/10 transition-all">
                        <div className="text-2xl">⚡</div>
                        <div className="flex-1">
                           <div className="text-xs font-black text-white uppercase tracking-tight">{t.topic}</div>
                           <div className="text-[10px] text-slate-500 font-medium">Critical concept gap detected</div>
                        </div>
                     </div>
                   ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="text-5xl animate-bounce">💎</div>
                <div className="text-lg font-black text-white italic">Absolute Mastery!</div>
                <p className="text-xs text-slate-400 leading-relaxed">ML engine can&apos;t find any weak spots. You are operating at an Elite level. Try the &quot;Competitive Challenge&quot; mode!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Persistence Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-12">
        <motion.div variants={fadeIn} className="card text-center p-8 bg-orange-500/5 border-orange-500/20 shadow-2xl relative group">
           <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="text-5xl mb-4">🔥</div>
           <div className="text-4xl font-black text-orange-400 tracking-tighter">{streak} Days</div>
           <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Persistence Streak</div>
        </motion.div>
        
        <motion.div variants={fadeIn} className="card lg:col-span-3 border-white/5">
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-white text-sm tracking-tight">ML Verified Achievements</h2>
              <button className="text-[10px] text-purple-400 font-black uppercase hover:underline tracking-widest">Hall of Fame</button>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {earnedBadges.length > 0 ? earnedBadges.slice(-8).map((b, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/5 border border-white/10 min-w-[120px] group transition-all hover:bg-white/10 hover:border-purple-500/30">
                   <span className="text-4xl group-hover:scale-125 transition-transform duration-500 shadow-2xl drop-shadow-md">{b.icon}</span>
                   <span className="text-[10px] text-white font-black text-center leading-tight uppercase tracking-tight">{b.name}</span>
                </div>
              )) : (
                <div className="text-slate-500 text-xs italic p-4 w-full text-center">Complete quizzes to unlock ML-verified achievements!</div>
              )}
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
