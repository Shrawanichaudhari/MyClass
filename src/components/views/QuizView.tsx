import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Question } from '@/lib/questions';
import { audioService } from '@/lib/audio';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { StudentIntelligence } from '@/lib/ml';

// const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function QuizView() {
  const { user, addXP, addNotification, updateMastery, awardBadge } = useStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Handle Answer
  const handleAnswer = useCallback((idx: number) => {
    if (answered || !questions[current]) return;
    setSelected(idx);
    setAnswered(true);
    setTimerActive(false);

    const q = questions[current];
    const isCorrect = idx === q.correct;
    const xpGained = isCorrect ? (showHint ? 5 : 10) : 0;

    if (isCorrect) {
      audioService.playSuccess();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      setScore(s => s + 1);
      setSessionXP(s => s + xpGained);
      addXP(xpGained);
      updateMastery(q.topic, true);
    } else {
      audioService.playEncourage();
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
      updateMastery(q.topic, false);
    }
    setShowExplanation(true);
  }, [answered, questions, current, showHint, addXP, updateMastery]);

  // Fetch AI-generated questions
  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      // ML Level Calculation
      const { topicMastery, user } = useStore.getState();
      const avgAccuracy = topicMastery.length > 0 
        ? topicMastery.reduce((acc, t) => acc + t.score, 0) / topicMastery.length 
        : 50;
      
      const level = StudentIntelligence.predictTrend({
        id: user?.id || 'temp',
        name: user?.name || 'User',
        avatar: user?.avatar || '👤',
        grade: user?.grade || 'Class 8',
        accuracy: avgAccuracy / 100,
        completionRate: 0.8,
        engagementTime: 5,
        consistencyScore: 0.7,
        topicsPerformance: Object.fromEntries(topicMastery.map(t => [t.topic, t.score]))
      });

      const res = await fetch(`/api/questions/quiz/generate?board=${user?.board}&grade=${user?.grade}&subject=General Mathematics&count=5&level=${level}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].question) {
        setQuestions(data);
        setTimerActive(true);
      } else {
        throw new Error("Invalid quiz data");
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to generate AI quiz. Please try again.", "warning");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (user) fetchQuiz();
  }, [user, fetchQuiz]);

  // Timer logic
  useEffect(() => {
    if (!timerActive || answered || isComplete) return;
    if (timeLeft === 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, answered, isComplete, timeLeft, handleAnswer]);

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setIsComplete(true);
      const pct = Math.round((score / questions.length) * 100);
      if (pct === 100) awardBadge('perfect-quiz');
      addNotification(`🎉 Quiz done! ${score}/${questions.length} correct · +${sessionXP} XP`, 'success');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
      setShowHint(false);
      setShowExplanation(false);
      setTimeLeft(30);
      setTimerActive(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setSessionXP(0);
    setShowHint(false);
    setShowExplanation(false);
    setIsComplete(false);
    setTimeLeft(30);
    fetchQuiz();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold animate-pulse">Grok is generating your custom quiz...</div>
      </div>
    );
  }

  if (isComplete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex items-center justify-center h-full p-6">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card text-center max-w-md w-full space-y-6 p-8">
          <div className="text-6xl animate-bounce">{pct === 100 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-black text-white" style={{fontFamily:'Outfit,sans-serif'}}>Quiz Complete!</h2>
          <div className="text-5xl font-black text-gradient">{pct}%</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-black text-green-400">{score}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-black text-purple-400">+{sessionXP}</div>
              <div className="text-xs text-slate-400">XP Earned</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={restart}>🔄 New Quiz</button>
            <button className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 transition-all" onClick={() => useStore.getState().setView('dashboard')}>🏠 Dashboard</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return <div className="flex items-center justify-center h-full text-slate-400">Error loading question. Please restart the quiz.</div>;

  const progress = ((current) / questions.length) * 100;
  const timerColor = timeLeft < 10 ? '#ef4444' : timeLeft < 20 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 font-bold">Question {current + 1}/{questions.length}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-black uppercase tracking-widest ${
            q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{q.difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-black transition-all duration-300" style={{color: timerColor}}>⏱ {timeLeft}s</div>
          <div className="text-sm text-yellow-500 font-black">⚡ {sessionXP} XP</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="xp-bar h-2 bg-slate-800">
        <motion.div className="h-full rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" style={{background:'linear-gradient(90deg,#7c3aed,#3b82f6)'}}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`card flex-1 flex flex-col gap-6 p-8 border-white/5 relative overflow-hidden ${shakeWrong ? 'animate-shake' : ''}`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-4 uppercase tracking-[0.2em]">
               <span>{user?.board || 'Syllabus'}</span>
               <span>•</span>
               <span>{user?.grade || 'Level'}</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight" style={{fontFamily:'Outfit,sans-serif'}}>{q.question}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {q.options && q.options.map((opt, idx) => {
              let cls = 'option-btn py-4 px-6 text-lg font-medium';
              if (answered) {
                if (idx === q.correct) cls += ' correct scale-[1.02] shadow-lg shadow-green-500/10';
                else if (idx === selected && idx !== q.correct) cls += ' wrong scale-[0.98]';
              }
              return (
                <motion.button key={idx} className={cls}
                  whileHover={!answered ? { x: 8, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                >
                  <span className="mr-4 text-slate-500 font-black">{['A', 'B', 'C', 'D'][idx]}</span>
                  {opt}
                  {answered && idx === q.correct && <span className="ml-auto text-green-400">⚡</span>}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {!answered && !showHint && (
              <button className="text-xs font-black text-purple-400/60 uppercase tracking-widest hover:text-purple-400 transition-all text-left mt-auto" onClick={() => setShowHint(true)}>
                [?] Unlock Hint (−5 XP)
              </button>
            )}
            {showHint && !answered && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-sm italic text-purple-200 mt-auto">
                💡 {q.hint || "Think about the core principle here."}
              </motion.div>
            )}
            {showExplanation && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                className={`p-5 rounded-2xl text-sm mt-auto ${selected === q.correct ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-orange-300'}`}>
                <div className="font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                   <span>{selected === q.correct ? 'Brilliant!' : 'Learning Opportunity'}</span>
                   <span className="text-[10px] opacity-60">{q.topic}</span>
                </div>
                <div className="text-slate-300 leading-relaxed">{q.explanation}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {answered && (
            <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-purple-500/20" onClick={nextQuestion}>
              {current + 1 >= questions.length ? 'Finish & Claim Rewards' : 'Continue ⮕'}
            </motion.button>
          )}

          <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] font-black pointer-events-none select-none italic tracking-tighter">
             QUIZ
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
