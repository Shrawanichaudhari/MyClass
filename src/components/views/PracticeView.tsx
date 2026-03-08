'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { QUESTIONS } from '@/lib/questions';
import { audioService } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { StudentIntelligence } from '@/lib/ml';

export default function PracticeView() {
  const { user, topicMastery, setView, addXP, updateMastery, addNotification } = useStore();
  const topics = [...new Set(QUESTIONS.map(q => q.topic))];
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [pIdx, setPIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [satisfied, setSatisfied] = useState(false);

  const [qs, setQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const q = qs[pIdx % qs.length] ?? null;

  useEffect(() => {
    if (selectedTopic && user && qs.length === 0) {
      setLoading(true);
      
      // ML Level Calculation
      const avgAccuracy = topicMastery.length > 0 
        ? topicMastery.reduce((acc, t) => acc + t.score, 0) / topicMastery.length 
        : 50;
      
      const level = StudentIntelligence.predictTrend({
        id: user?.id || 'temp',
        name: user?.name || 'User',
        avatar: '👤',
        accuracy: avgAccuracy / 100,
        grade: user?.grade || 'N/A',
        completionRate: 0.8,
        engagementTime: 5,
        consistencyScore: 0.7,
        topicsPerformance: Object.fromEntries(topicMastery.map(t => [t.topic, t.score]))
      });

      fetch(`/api/questions/generate?topic=${encodeURIComponent(selectedTopic)}&board=${user?.board || 'CBSE'}&grade=${user?.grade || 'Class 8'}&level=${level}`)
        .then(res => res.ok ? res.json() : Promise.reject('API Error'))
        .then(data => {
            if (data && data.question) {
                setQs([data]);
            } else {
                addNotification("Cloud error. Using local question fallback.", "info");
            }
        })
        .catch(() => addNotification("Could not connect to AI. Check connection.", "warning"))
        .finally(() => setLoading(false));
    }
  }, [selectedTopic, user, qs.length, addNotification, topicMastery]);

  const mastery = (topic: string) => topicMastery.find(t => t.topic === topic);

  const handleAnswer = (idx: number) => {
    if (answered || !q) return;
    setSelected(idx);
    setAnswered(true);
    setSessionTotal(s => s + 1);

    const isCorrect = idx === q.correct;
    
    if (isCorrect) {
      audioService.playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#3b82f6', '#10b981']
      });
      setSessionCorrect(s => s + 1);
      addXP(10);
      updateMastery(q.topic, true);
    } else {
      audioService.playEncourage();
      updateMastery(q.topic, false);
    }
  };

  const nextQ = () => {
    // If we're near the end of the fetched questions, fetch more
    if (pIdx >= qs.length - 2) {
       const avgAccuracy = topicMastery.reduce((acc, t) => acc + t.score, 0) / topicMastery.length;
       const level = StudentIntelligence.predictTrend({
          id: user?.id || 'temp',
          name: user?.name || 'User',
          avatar: '👤',
           accuracy: avgAccuracy / 100,
           grade: user?.grade || 'N/A',
           completionRate: 0.8,
           engagementTime: 5,
           consistencyScore: 0.7,
           topicsPerformance: Object.fromEntries(topicMastery.map(t => [t.topic, t.score]))
        });

       fetch(`/api/questions/generate?topic=${encodeURIComponent(selectedTopic!)}&board=${user?.board}&grade=${user?.grade}&level=${level}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.question) setQs(prev => [...prev, data]);
        });
    }
    setPIdx(p => p + 1);
    setSelected(null);
    setAnswered(false);
  };

  const iAmSatisfied = () => {
    setSatisfied(true);
    addNotification(`✅ Practice done! ${sessionCorrect}/${sessionTotal} correct · +${sessionCorrect * 10} XP`, 'success');
  };

  if (satisfied) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <motion.div initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}} className="card text-center max-w-sm w-full space-y-5 p-8">
          <div className="text-5xl">🎊</div>
          <h2 className="text-2xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>Great Practice!</h2>
          <div className="text-3xl font-black text-gradient">{sessionTotal > 0 ? Math.round((sessionCorrect/sessionTotal)*100) : 0}%</div>
          <div className="text-slate-400 text-sm">{sessionCorrect} of {sessionTotal} correct in <span className="text-purple-400 font-bold">{selectedTopic}</span></div>
          <button className="btn-primary w-full" onClick={() => { setSatisfied(false); setSelectedTopic(null); setPIdx(0); setSessionCorrect(0); setSessionTotal(0); setQs([]); }}>Practice Another Topic</button>
          <button className="w-full text-slate-400 hover:text-white transition-all" onClick={() => setView('dashboard')}>← Back to Dashboard</button>
        </motion.div>
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>📚 Practice Mode</h1>
          <p className="text-slate-400 mt-1">Infinite AI-powered practice. Board: <span className="text-purple-400 font-bold">{user?.board}</span> • Target: <span className="text-purple-400 font-bold">{user?.grade}</span></p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map(topic => {
            const m = mastery(topic);
            const score = m?.score ?? 0;
            const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
            return (
              <motion.button key={topic} whileHover={{scale:1.02,y:-3}} whileTap={{scale:0.98}}
                onClick={() => { setSelectedTopic(topic); setPIdx(0); setSelected(null); setAnswered(false); setQs([]); }}
                className="card text-left space-y-3 cursor-pointer">
                <div className="text-3xl">{topic === 'Algebra' ? '📐' : topic === 'Geometry' ? '📏' : topic === 'Fractions' ? '🔢' : topic.includes('Newton') ? '⚙️' : topic.includes('Cell') ? '🔬' : '📖'}</div>
                <div>
                  <div className="font-bold text-white text-sm">{topic}</div>
                  <div className="text-xs text-slate-500">{QUESTIONS.filter(q => q.topic === topic).length} questions</div>
                </div>
                <div className="xp-bar">
                  <div className="h-full rounded-full" style={{width:`${score}%`, background: color, transition:'width 0.5s'}} />
                </div>
                <div className="text-xs font-bold" style={{color}}>{score}% mastery</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading || !q) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold animate-pulse">Grok is preparing your {selectedTopic} session...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="flex items-center justify-between">
        <button className="text-slate-400 hover:text-white transition-all text-sm" onClick={() => setSelectedTopic(null)}>← Topics</button>
        <span className="font-bold text-purple-400">{selectedTopic}</span>
        <span className="text-sm text-slate-500">Q #{pIdx + 1} • {sessionCorrect}/{sessionTotal} correct</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={pIdx} initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}}
          className="card flex-1 flex flex-col gap-5 overflow-y-auto">
          <div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${q.difficulty==='easy'?'bg-green-500/20 text-green-400':q.difficulty==='medium'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'}`}>{q.difficulty}</span>
            <h2 className="text-xl font-bold text-white mt-3 leading-relaxed">{q.question}</h2>
          </div>
          <div className="space-y-3 flex-1">
            {q.options && q.options.map((opt: string, idx: number) => {
              let cls = 'option-btn';
              if (answered) {
                if (idx === q.correct) cls += ' correct';
                else if (idx === selected ) cls += ' wrong';
              }
              return (
                <motion.button key={idx} className={cls} whileHover={!answered ? {x:4}:{}} onClick={() => handleAnswer(idx)} disabled={answered}>
                  <span className="mr-3 text-slate-500">{['A','B','C','D'][idx]}.</span>{opt}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {answered && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                className={`p-4 rounded-xl text-sm ${selected===q.correct?'bg-green-500/10 border border-green-500/20 text-green-300':'bg-red-500/10 border border-red-500/20 text-orange-300'}`}>
                <div className="font-bold mb-1">{selected===q.correct ? '✅ Awesome! +10 XP' : '💡 Let\'s learn this concept'}</div>
                <div className="text-slate-300 leading-relaxed">
                   {selected !== q.correct && (
                     <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="font-black text-purple-400 mb-1">Micro-lesson:</div>
                        {q.microLesson || q.explanation}
                     </div>
                   )}
                   {selected === q.correct ? q.explanation : `Hint for next time: ${q.hint}`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-3">
            {answered && <button className="btn-primary flex-1" onClick={nextQ}>Next Question →</button>}
            <button className="flex-1 px-4 py-3 rounded-xl border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-all font-semibold" onClick={iAmSatisfied}>
              ✅ I am satisfied
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
