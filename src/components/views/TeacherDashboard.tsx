'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, AlertCircle, BookOpen, Brain, Zap, Search, Target, TrendingUp, X, CheckCircle2, ChevronRight, Wand2, Eye, User, LayoutGrid, List } from 'lucide-react';
import { StudentIntelligence, ClusterResult, StudentLevel } from '@/lib/ml';
import { MOCK_STUDENTS, StudentAnalytics } from '@/lib/mockStudents';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { MessageSquare, HeartHandshake } from 'lucide-react';

const SUBJECT_PERFORMANCE = [
  { topic: 'Algebra',      avg: 42, students: 35 },
  { topic: 'Geometry',     avg: 78, students: 35 },
  { topic: 'Fractions',    avg: 55, students: 35 },
  { topic: 'Trigonometry', avg: 38, students: 35 },
  { topic: 'Statistics',   avg: 71, students: 35 },
];

export default function TeacherDashboard() {
  const { user, addNotification } = useStore();
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [clusters, setClusters] = useState<ClusterResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterResult | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [isClassReporting, setIsClassReporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'clusters' | 'directory'>('clusters');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch real students from 'users' collection
        const usersQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const usersSnapshot = await getDocs(usersQuery);
        const realUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch analytics from 'students' collection
        const analyticsSnapshot = await getDocs(collection(db, 'students'));
        const analyticsMap = new Map();
        analyticsSnapshot.forEach(doc => analyticsMap.set(doc.id, doc.data()));

        // Combine Users + Analytics
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

        // Merge with Mock data, avoiding duplicates
        const merged = [...combinedReal];
        MOCK_STUDENTS.forEach(mock => {
          if (!merged.find(s => s.name === mock.name || s.id === mock.id)) {
            merged.push(mock);
          }
        });

        // Filter by teacher's grade
        const filtered = user?.grade && user?.grade !== 'N/A' 
          ? merged.filter(s => s.grade === user?.grade)
          : merged;

        setStudents(filtered);
        const results = await StudentIntelligence.clusterStudents(filtered);
        setClusters(results);
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents(MOCK_STUDENTS);
        const results = await StudentIntelligence.clusterStudents(MOCK_STUDENTS);
        setClusters(results);
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const classAvg = students.length > 0 
    ? Math.round((students.reduce((acc, s) => acc + s.accuracy, 0) / students.length) * 100) 
    : 0;
  const eliteCount = clusters.find(c => c.level === 'Elite')?.students.length || 0;
  const atRiskCount = clusters.find(c => c.level === 'At Risk')?.students.length || 0;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scatterData = students.map(s => ({
    name: s.name,
    accuracy: s.accuracy * 100,
    engagement: s.engagementTime,
    level: StudentIntelligence.predictTrend(s)
  }));

  const handleToolAction = (tool: string) => {
     setActiveTool(tool);
     setToolResult(null);
     if (clusters.length > 0) setSelectedCluster(clusters[0]);
  };

  const runToolLogic = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));

    if (activeTool === 'Cluster-Based Quiz' && selectedCluster) {
      setToolResult({
        message: `Quiz generated for ${selectedCluster.level} students!`,
        topic: 'Algebra Fundamentals',
        questions: 5,
        link: '#'
      });
    } else if (activeTool === 'Weakness Analysis' && selectedCluster) {
      const weaknesses = StudentIntelligence.getClusterWeaknesses(selectedCluster.students);
      setToolResult({
        data: Object.entries(weaknesses).map(([topic, count]) => ({ topic, count }))
      });
    } else if (activeTool === 'Syllabus Redesign' && selectedCluster) {
      const tips = StudentIntelligence.getSyllabusAdjustments(selectedCluster);
      setToolResult({ tips });
    } else if (activeTool === 'Mastery Forecast' && selectedCluster) {
      const forecast = StudentIntelligence.projectMastery(selectedCluster.students);
      setToolResult({ forecast, current: Math.round(selectedCluster.students.reduce((a,b)=>a+b.accuracy,0)/selectedCluster.students.length*100) });
    } else if (activeTool === 'Peer Connect' && selectedCluster) {
      const pairings: any[] = [];
      const struggling = selectedCluster.students.filter(s => s.accuracy < 0.6);
      struggling.slice(0, 5).forEach(s => {
        const mentors = StudentIntelligence.findMentors(s, students);
        if (mentors.length > 0) {
           pairings.push({ student: s, topic: mentors[0].topic, mentor: mentors[0].mentors[0] });
        }
      });
      setToolResult({ pairings });
    }
    setProcessing(false);
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8 scroll-smooth pb-24 relative bg-[#020617]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>👨‍🏫 Educator Console</h1>
          <p className="text-slate-400 mt-1">Class 8 Mathematics (Batch A) • <span className="text-purple-400 font-bold">ML Engine 2.0 Active</span></p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                type="text" 
                placeholder="Find a student..." 
                className="bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-48 md:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
             <button onClick={() => setIsClassReporting(true)} className="btn-primary text-sm px-4">Generate Report</button>
        </div>
      </div>

      {/* Class Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Class Average', value: `${classAvg}%`, icon: <Brain className="w-6 h-6 text-purple-400"/>, trend: '+4%' },
          { label: 'Elite Segment', value: eliteCount.toString(), icon: <Target className="w-6 h-6 text-yellow-400"/>, trend: 'High Achievers' },
          { label: 'Avg Study Time', value: '42m', icon: <BookOpen className="w-6 h-6 text-green-400"/>, trend: 'Active Engagement' },
          { label: 'Critical Risk', value: atRiskCount.toString(), icon: <AlertCircle className="w-6 h-6 text-red-400"/>, trend: 'Pending Action' },
        ].map((s, i) => (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay: i*0.1}} key={i} className="card p-5 space-y-3 border-white/5 bg-white/[0.02]">
             <div className="flex items-center justify-between">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">{s.icon}</div>
                <div className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">{s.trend}</div>
             </div>
             <div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{s.label}</div>
                <div className="text-3xl font-black text-white">{s.value}</div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Toggle View Mode */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
         <button onClick={() => setViewMode('clusters')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'clusters' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <LayoutGrid className="w-4 h-4" /> Class Insights
         </button>
         <button onClick={() => setViewMode('directory')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'directory' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <List className="w-4 h-4" /> Student Directory
         </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'clusters' ? (
          <motion.div key="clusters" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
            {/* ML Intelligence Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2 relative overflow-hidden bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] font-black pointer-events-none select-none italic">MAP</div>
                <h2 className="font-black text-white mb-6 flex items-center gap-2">🧠 ML Student Clustering Map</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis type="number" dataKey="engagement" name="Engagement" unit="h" stroke="#64748b" fontSize={12} />
                      <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" stroke="#64748b" fontSize={12} />
                      <ZAxis type="number" range={[100, 400]} />
                      <Tooltip 
                         cursor={{ strokeDasharray: '3 3' }}
                         contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Scatter name="Students" data={scatterData} fill="#7c3aed">
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.accuracy > 80 ? '#10b981' : entry.accuracy > 50 ? '#3b82f6' : '#ef4444'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest justify-center">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"/> Elite</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Rising</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Critical</span>
                </div>
              </div>

              {/* AI Master Tools Quick Links */}
              <div className="card space-y-4 bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <h2 className="font-black text-white text-lg">AI Master Suite</h2>
                </div>
                <div className="space-y-2">
                   {[
                     { title: 'Cluster-Based Quiz', icon: '🎲', color: 'text-blue-400' },
                     { title: 'Weakness Analysis', icon: '📉', color: 'text-red-400' },
                     { title: 'Peer Connect', icon: '🤝', color: 'text-green-400' },
                     { title: 'Syllabus Redesign', icon: '🧩', color: 'text-purple-400' },
                     { title: 'Mastery Forecast', icon: '🔮', color: 'text-yellow-400' }
                   ].map((tool, i) => (
                     <button key={i} onClick={() => handleToolAction(tool.title)} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <span className="text-xl">{tool.icon}</span>
                           <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{tool.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                     </button>
                   ))}
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 mt-4">
                   <p className="text-[10px] text-purple-300 font-bold leading-relaxed">
                      AI recommendation: 7 students in &quot;At Risk&quot; are showing declining trends in Geometry. Run Weakness Analysis to intervene.
                   </p>
                </div>
              </div>
            </div>

            {/* Cluster Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clusters.filter(c => c.students.length > 0).map((cluster, i) => (
                <div key={i} className="card bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-white flex items-center gap-2">
                      <span className="text-2xl">{cluster.level === 'Elite' ? '🏆' : cluster.level === 'Rising Star' ? '🌟' : cluster.level === 'Struggling' ? '🔥' : '⚠️'}</span>
                      {cluster.level} Segment
                    </h3>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cluster.students.length} Total</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {cluster.students.slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setSelectedStudent(s)}>
                           <span className="text-2xl bg-white/5 p-2 rounded-xl">{s.avatar}</span>
                           <div>
                              <div className="font-bold text-white text-xs truncate w-24">{s.name}</div>
                              <div className="text-[10px] text-purple-400 font-black">{Math.round(s.accuracy*100)}% Acc</div>
                           </div>
                           <Eye className="w-3 h-3 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                     ))}
                  </div>
                  <button onClick={() => setViewMode('directory')} className="w-full mt-4 py-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">View full segment list</button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="directory" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((s, i) => {
                  const trend = StudentIntelligence.predictTrend(s);
                  const weakAreas = StudentIntelligence.getWeakAreas(s);
                  return (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: i*0.05}} key={s.id} onClick={() => setSelectedStudent(s)}
                      className="card p-5 space-y-4 bg-white/[0.02] border-white/5 group hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none italic font-black text-4xl">{i+1}</div>
                       <div className="flex items-center gap-4">
                          <span className="text-4xl bg-white/5 p-3 rounded-2xl group-hover:bg-purple-600/20 transition-all">{s.avatar}</span>
                          <div>
                             <div className="font-black text-white text-lg tracking-tight">{s.name}</div>
                             <div className={`text-[10px] font-bold uppercase tracking-widest ${trend === 'Improving' ? 'text-green-400' : trend === 'Declining' ? 'text-red-400' : 'text-slate-400'}`}>
                                {trend} Trend
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Accuracy</div>
                             <div className="text-xl font-black text-white">{Math.round(s.accuracy*100)}%</div>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Consistency</div>
                             <div className="text-xl font-black text-white">{Math.round(s.consistencyScore*100)}%</div>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mastery Status</div>
                          <div className="xp-bar h-1.5 bg-white/5 overflow-hidden">
                             <motion.div initial={{width:0}} animate={{width:`${s.accuracy*100}%`}} className="h-full bg-purple-600" />
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-1">
                          {weakAreas.length > 0 ? weakAreas.slice(0, 2).map((w, idx) => (
                             <span key={idx} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20">Weak: {w}</span>
                          )) : (
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Stable Mastery</span>
                          )}
                       </div>
                    </motion.div>
                  );
                })}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
               onClick={() => setSelectedStudent(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0,y:20}}
               className="relative w-full max-w-4xl card p-10 border border-white/10 shadow-3xl bg-[#0f172a] overflow-y-auto max-h-[90vh]">
                
                <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-all"><X className="w-8 h-8"/></button>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center text-7xl border border-white/10 relative">
                      {selectedStudent.avatar}
                      <div className="absolute -bottom-2 -right-2 bg-purple-600 p-2 rounded-xl border-4 border-[#0f172a]"><User className="w-4 h-4 text-white"/></div>
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-4xl font-black text-white tracking-tighter" style={{fontFamily:'Outfit,sans-serif'}}>{selectedStudent.name}</h2>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-black uppercase tracking-widest">
                            <Brain className="w-3 h-3"/> {StudentIntelligence.predictTrend(selectedStudent)} Trend
                         </div>
                         <div className="text-sm font-bold text-slate-400">Student ID: {selectedStudent.id}</div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="card bg-white/5 border-white/5">
                         <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400"/> Topic Performance Radar</h3>
                         <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={Object.entries(selectedStudent.topicsPerformance).map(([topic, score]) => ({ topic, score }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                  <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                     {Object.entries(selectedStudent.topicsPerformance).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry[1] > 80 ? '#10b981' : entry[1] > 50 ? '#7c3aed' : '#ef4444'} />
                                     ))}
                                  </Bar>
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="card bg-white/5 border-white/5 p-6">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Engaged Learning</div>
                            <div className="text-3xl font-black text-white">{selectedStudent.engagementTime}h</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Total time spent in interactive modules this term.</p>
                         </div>
                         <div className="card bg-white/5 border-white/5 p-6">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">AI Recommendation</div>
                            <p className="text-xs text-purple-300 font-bold leading-relaxed">
                               {selectedStudent.accuracy < 0.6 ? `High intervention suggested for ${StudentIntelligence.getWeakAreas(selectedStudent)[0] || 'core concepts'}.` : 'Student is ready for advanced syllabus module 4B.'}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="card bg-white/5 border-white/5">
                         <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">ML Level Diagnostic</div>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-300">Accuracy</span>
                               <span className="text-lg font-black text-white">{Math.round(selectedStudent.accuracy*100)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-300">Completion</span>
                               <span className="text-lg font-black text-white">{Math.round(selectedStudent.completionRate*100)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-bold text-slate-300">Consistency</span>
                               <span className="text-lg font-black text-white">{Math.round(selectedStudent.consistencyScore*100)}%</span>
                            </div>
                         </div>
                         <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Detected Weak Areas</div>
                            <div className="flex flex-wrap gap-2">
                               {StudentIntelligence.getWeakAreas(selectedStudent).map((w, i) => (
                                 <span key={i} className="px-3 py-1.5 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 text-[10px] font-black uppercase">{w}</span>
                               ))}
                               {StudentIntelligence.getWeakAreas(selectedStudent).length === 0 && <span className="text-xs text-green-400 font-bold">No critical weaknesses detected.</span>}
                            </div>
                         </div>
                      </div>
                       <button onClick={() => setIsReporting(true)}
                          className="w-full py-4 bg-purple-600 text-white font-black rounded-3xl shadow-xl shadow-purple-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                          <Wand2 className="w-4 h-4"/> Generate Full Student Report
                       </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Intelligence Tool Modal */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
               onClick={() => setActiveTool(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0,y:20}}
               className="relative w-full max-w-lg card p-8 border border-white/10 shadow-4xl bg-[#0f172a] overflow-hidden">
                
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 font-black pointer-events-none select-none italic tracking-tighter uppercase">{activeTool.split(' ')[0]}</div>
                
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-600/30">
                         <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-white">{activeTool}</h2>
                         <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Master Intelligence Tool</div>
                      </div>
                   </div>
                   <button onClick={() => setActiveTool(null)} className="p-2 text-slate-500 hover:text-white transition-all"><X className="w-6 h-6"/></button>
                </div>

                {!toolResult && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select target cluster</label>
                       <div className="grid grid-cols-2 gap-2">
                          {clusters.map((c, i) => (
                             <button key={i} onClick={() => setSelectedCluster(c)} 
                                className={`p-4 rounded-2xl border transition-all text-left ${selectedCluster?.level === c.level ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
                                <div className="text-sm font-black">{c.level}</div>
                                <div className="text-[10px] font-bold opacity-70">{c.students.length} Students</div>
                             </button>
                          ))}
                       </div>
                    </div>
                    <button onClick={runToolLogic} disabled={processing}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                      {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform"/> Run AI Analysis</>}
                    </button>
                  </div>
                )}

                {toolResult && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
                     {activeTool === 'Cluster-Based Quiz' && (
                       <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-6 h-6"/></div>
                             <div className="text-lg font-black text-white">{toolResult.message}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                             <div className="text-xs font-bold text-slate-500 uppercase">Quiz Details</div>
                             <div className="text-sm font-bold text-white flex items-center justify-between">Topic <span>{toolResult.topic}</span></div>
                             <div className="text-sm font-bold text-white flex items-center justify-between">Questions <span>{toolResult.questions}</span></div>
                          </div>
                          <button className="btn-primary w-full py-3 text-sm">Preview Quiz Content</button>
                       </div>
                     )}

                     {activeTool === 'Weakness Analysis' && (
                       <div className="space-y-4">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Conceptual Struggles Found</div>
                          <div className="space-y-2">
                             {toolResult.data.map((item: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 border-l-red-500/50">
                                  <div className="text-sm font-bold text-white">{item.topic}</div>
                                  <div className="text-xs font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-full">{item.count} students struggling</div>
                               </div>
                             ))}
                          </div>
                       </div>
                     )}

                     {activeTool === 'Syllabus Redesign' && (
                       <div className="space-y-4">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">AI Curated Adjustments</div>
                          <div className="space-y-2">
                             {toolResult.tips.map((tip: string, i: number) => (
                               <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                  <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform"/>
                                  <div className="text-sm font-bold text-white leading-tight">{tip}</div>
                               </div>
                             ))}
                          </div>
                          <button className="w-full py-4 border border-purple-500/30 text-purple-400 font-black rounded-2xl hover:bg-purple-500/10 transition-all text-xs uppercase tracking-widest">Apply to Class Timeline</button>
                       </div>
                     )}

                     {activeTool === 'Mastery Forecast' && (
                        <div className="space-y-6 text-center">
                           <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projected End-of-Term Score</div>
                              <div className="text-7xl font-black text-white tracking-tighter">{toolResult.forecast}%</div>
                              <div className="text-xs font-bold text-green-400 mt-2">Predicted improvement: +{toolResult.forecast - toolResult.current}%</div>
                           </div>
                           <div className="h-48 w-full mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                  { month: 'Now', val: toolResult.current },
                                  { month: '+1mo', val: Math.round((toolResult.current + toolResult.forecast)/2) },
                                  { month: 'Target', val: toolResult.forecast },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                                  <Line type="monotone" dataKey="val" stroke="#7c3aed" strokeWidth={4} dot={{ r: 6, fill: '#7c3aed' }} />
                                </LineChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     )}

                     {activeTool === 'Peer Connect' && (
                       <div className="space-y-4">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">AI Suggested Study Pairings</div>
                          <div className="space-y-3">
                             {toolResult.pairings.map((p: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
                                  <div className="flex items-center gap-3">
                                     <span className="text-2xl">{p.student.avatar}</span>
                                     <div className="text-sm font-bold text-white leading-tight">
                                        {p.student.name}
                                        <div className="text-[10px] text-red-400">Needs help in {p.topic}</div>
                                     </div>
                                  </div>
                                  <div className="h-px w-8 bg-white/10" />
                                  <div className="flex items-center gap-3 text-right">
                                     <div className="text-sm font-bold text-white leading-tight">
                                        {p.mentor.name}
                                        <div className="text-[10px] text-green-400">Scholar Mentor</div>
                                     </div>
                                     <span className="text-2xl">{p.mentor.avatar}</span>
                                  </div>
                               </div>
                             ))}
                             {toolResult.pairings.length === 0 && (
                               <div className="text-center py-8 text-slate-500 text-sm italic">No optimal pairings found for this cluster.</div>
                             )}
                          </div>
                          {toolResult.pairings.length > 0 && (
                            <button className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 transition-all flex items-center justify-center gap-2">
                               <HeartHandshake className="w-5 h-5"/> Send Collaboration invites
                            </button>
                          )}
                       </div>
                     )}

                     <button onClick={() => setToolResult(null)} className="w-full py-3 text-slate-500 hover:text-white transition-all text-xs font-bold">← Select Different Cluster</button>
                  </motion.div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Student Report Overlay */}
      <AnimatePresence>
        {isReporting && selectedStudent && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-[#050810] overflow-y-auto">
             <motion.div initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} exit={{opacity:0,y:50}} className="max-w-5xl mx-auto w-full p-8 md:p-16 space-y-12">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="text-7xl">{selectedStudent.avatar}</div>
                      <div>
                         <h1 className="text-5xl font-black text-white tracking-tighter" style={{fontFamily:'Outfit,sans-serif'}}>{selectedStudent.name}</h1>
                         <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Student ID: {selectedStudent.id}</span>
                            <span className="text-slate-500 text-xs font-bold">Class of 2026 • Mid-Term Performance Report</span>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setIsReporting(false)} className="p-4 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all"><X className="w-8 h-8"/></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Left: Quick Stats & AI Summary */}
                   <div className="lg:col-span-1 space-y-8">
                      <div className="card p-8 bg-white/[0.02] border-white/5 space-y-6">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Summative Assessment</div>
                         <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                            &quot;{StudentIntelligence.getStudentSummary(selectedStudent)}&quot;
                         </p>
                         <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><TrendingUp className="w-4 h-4 text-purple-400"/> Learning Velocity</div>
                               <div className="text-xl font-black text-white">{StudentIntelligence.getLearningVelocity(selectedStudent)} units/wk</div>
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Target className="w-4 h-4 text-green-400"/> Goal Accuracy</div>
                               <div className="text-xl font-black text-white">92%</div>
                            </div>
                         </div>
                      </div>

                      <div className="card p-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-white/10 text-center">
                         <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Diagnostic Score</div>
                         <div className="text-7xl font-black text-white tracking-tighter mb-2">{Math.round(selectedStudent.accuracy * 100)}%</div>
                         <div className="text-xs font-bold text-slate-400">Weighted Mid-Term Average</div>
                      </div>
                   </div>

                   {/* Center/Right: Radar, Topic Detail, Growth */}
                   <div className="lg:col-span-2 space-y-8">
                      <div className="card p-8 bg-white/[0.02] border-white/5">
                         <h2 className="text-lg font-black text-white mb-8 tracking-tight flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400"/> Conceptual Competency Radar</h2>
                         <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={Object.entries(selectedStudent.topicsPerformance).map(([topic, score]) => ({ topic, score }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                  <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                     {Object.entries(selectedStudent.topicsPerformance).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry[1] > 80 ? '#10b981' : entry[1] > 50 ? '#7c3aed' : '#ef4444'} />
                                     ))}
                                  </Bar>
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="card bg-white/[0.02] border-white/5 p-6">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Persistence Score</div>
                            <div className="text-3xl font-black text-white">{Math.round(selectedStudent.consistencyScore * 100)}%</div>
                            <p className="text-[10px] text-slate-500 mt-2">Measures frequency and session length of active learning.</p>
                         </div>
                         <div className="card bg-white/[0.02] border-white/5 p-6">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Module Completion</div>
                            <div className="text-3xl font-black text-white">{Math.round(selectedStudent.completionRate * 100)}%</div>
                            <p className="text-[10px] text-slate-500 mt-2">Tracks progress through the prescribed syllabus path.</p>
                         </div>
                      </div>

                      <div className="flex gap-4 print:hidden">
                         <button onClick={() => {
                            addNotification("Optimizing for Print...", "info");
                            setTimeout(() => window.print(), 1000);
                         }} 
                            className="flex-1 py-5 bg-white text-black font-black rounded-[24px] hover:bg-slate-200 transition-all shadow-2xl flex items-center justify-center gap-3">
                            <BookOpen className="w-6 h-6"/> Download PDF Report
                         </button>
                         <button 
                            disabled={isSharing}
                            onClick={() => {
                               setIsSharing(true);
                               addNotification("Connecting to parent portal...", "info");
                               setTimeout(() => {
                                  setIsSharing(false);
                                  addNotification("Report shared with parents successfully!", "success");
                               }, 2500);
                            }}
                            className="px-8 py-5 border border-white/10 text-white font-black rounded-[24px] hover:bg-white/5 transition-all flex items-center justify-center gap-3 relative overflow-hidden">
                            {isSharing ? (
                               <motion.div initial={{width:0}} animate={{width:'100%'}} transition={{duration:2.5}} className="absolute inset-0 bg-white/10" />
                            ) : null}
                            <Users className="w-6 h-6"/> {isSharing ? 'Sharing...' : 'Share with Parents'}
                         </button>
                      </div>
                   </div>
                </div>

                {/* Footer Insight */}
                <div className="p-8 rounded-[40px] bg-purple-600/10 border border-purple-500/20 text-center">
                   <div className="text-2xl mb-2">⚡</div>
                   <div className="text-lg font-black text-white tracking-tight">AI Predicted Trajectory: <span className="text-green-400 font-extrabold">+12% mastery improvement</span> within next 30 days.</div>
                   <p className="text-xs text-slate-400 mt-1">Predictions are based on current time-on-task and consistency metrics.</p>
                </div>

                <div className="text-center pb-12">
                   <button onClick={() => setIsReporting(false)} className="text-slate-500 hover:text-white font-bold transition-all uppercase tracking-widest text-[10px]">← Close Report View</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Class Performance Report Overlay */}
      <AnimatePresence>
        {isClassReporting && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-[#050810] overflow-y-auto">
             <motion.div initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} exit={{opacity:0,y:50}} className="max-w-5xl mx-auto w-full p-8 md:p-16 space-y-12">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-purple-600 flex items-center justify-center text-4xl shadow-2xl shadow-purple-600/30">📊</div>
                      <div>
                         <h1 className="text-5xl font-black text-white tracking-tighter" style={{fontFamily:'Outfit,sans-serif'}}>Class Performance Report</h1>
                         <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Section A • Batch 2026</span>
                            <span className="text-slate-500 text-xs font-bold">Mid-Term Analytical Summary</span>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setIsClassReporting(false)} className="p-4 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all"><X className="w-8 h-8"/></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1 space-y-8">
                      <div className="card p-8 bg-white/[0.02] border-white/5 space-y-6">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ML Class Summary</div>
                         <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                            &quot;{StudentIntelligence.getClassSummary(students)}&quot;
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="card bg-white/[0.02] border-white/5 p-6 text-center">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Class Accuracy</div>
                            <div className="text-3xl font-black text-white">{classAvg}%</div>
                         </div>
                         <div className="card bg-white/[0.02] border-white/5 p-6 text-center">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Growth Trend</div>
                            <div className="text-3xl font-black text-green-400">+4.2%</div>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-2 space-y-8">
                      <div className="card p-8 bg-white/[0.02] border-white/5">
                         <h2 className="text-lg font-black text-white mb-8 tracking-tight flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400"/> Subject-Wise Performance</h2>
                         <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={SUBJECT_PERFORMANCE}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                  <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                                  <Area type="monotone" dataKey="avg" stroke="#7c3aed" fill="#7c3aed20" strokeWidth={4} dot={{ r: 6, fill: '#7c3aed' }} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                      
                      <div className="flex gap-4 print:hidden">
                         <button onClick={() => {
                            addNotification("Preparing Class Summary for Print...", "info");
                            setTimeout(() => window.print(), 1000);
                         }} 
                            className="flex-1 py-5 bg-white text-black font-black rounded-[24px] hover:bg-slate-200 transition-all shadow-2xl flex items-center justify-center gap-3">
                            <BookOpen className="w-6 h-6"/> Download Class Report
                         </button>
                         <button onClick={() => addNotification("Class report shared with administration.", "success")}
                            className="px-8 py-5 border border-white/10 text-white font-black rounded-[24px] hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                            <Users className="w-6 h-6"/> Share with Admin
                         </button>
                      </div>
                   </div>
                </div>

                <div className="text-center pb-12">
                   <button onClick={() => setIsClassReporting(false)} className="text-slate-500 hover:text-white font-bold transition-all uppercase tracking-widest text-[10px]">← Return to Dashboard</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
