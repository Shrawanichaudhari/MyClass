'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, GraduationCap, ArrowRight, Github, Chrome } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [board, setBoard] = useState('CBSE');
  const [grade, setGrade] = useState('Class 10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, addNotification } = useStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        try {
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            login({
              id: userCredential.user.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              avatar: userData.avatar || '👤',
              grade: userData.grade || 'N/A',
              board: userData.board || 'N/A',
            });
            addNotification(`Welcome back, ${userData.name}!`, 'success');
          } else {
            // Fallback if doc doesn't exist but auth does
            login({
              id: userCredential.user.uid,
              name: userCredential.user.displayName || 'User',
              email: userCredential.user.email || '',
              role: 'student',
              avatar: '👤',
              grade: 'N/A',
              board: 'N/A',
            });
          }
        } catch (dbErr: any) {
          console.error("Firestore error:", dbErr);
          // Allow login even if DB fetch fails (fallback to auth profile)
          login({
            id: userCredential.user.uid,
            name: userCredential.user.displayName || 'User',
            email: userCredential.user.email || '',
            role: 'student',
            avatar: '👤',
            grade: 'N/A',
            board: 'N/A',
          });
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
          id: userCredential.user.uid,
          name,
          email,
          role,
          avatar: '👤',
          grade,
          board,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
          
          // If student, also create a record in 'students' collection for analytics
          if (role === 'student') {
             await setDoc(doc(db, 'students', userCredential.user.uid), {
                id: userCredential.user.uid,
                name: name,
                avatar: '👤',
                grade: grade,
                accuracy: 0,
                completionRate: 0,
                engagementTime: 0,
                consistencyScore: 0,
                topicsPerformance: {},
                updatedAt: new Date().toISOString()
             });
          }
        } catch (dbErr: any) {
          console.error("Firestore creation error:", dbErr);
          addNotification("Auth successful, but profile creation failed. Check Firestore setup.", "warning");
        }
        
          login({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role as 'student' | 'teacher' | 'admin',
            avatar: newUser.avatar,
            grade: newUser.grade,
            board: newUser.board,
          });
        addNotification(`Account created successfully! Welcome, ${name}!`, 'success');
      }
    } catch (err: any) {
      console.error("AUTH ERROR DETAIL:", err);
      const msg = err.code === 'auth/weak-password' ? 'Password is too weak.' : 
                  err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
                  err.message || 'An error occurred during authentication';
      setError(msg);
      addNotification(msg, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        const newUser = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'student' as 'student' | 'teacher' | 'admin',
          avatar: user.photoURL || '👤',
          grade: 'Class 10',
          board: 'CBSE',
          createdAt: new Date().toISOString(),
        };
        // Also sync to students collection for analytics
        await setDoc(doc(db, 'students', user.uid), {
           id: user.uid,
           name: user.displayName || 'User',
           avatar: user.photoURL || '👤',
           grade: 'Class 8', // Defaulting to Class 8 for testing/demo consistency
           accuracy: 0.1, // Initial non-zero to show in charts
           completionRate: 0,
           engagementTime: 0.5,
           consistencyScore: 0.2,
           topicsPerformance: {},
           updatedAt: new Date().toISOString()
        });
        login({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          grade: 'Class 8',
          board: newUser.board
        });
      } else {
        const data = userDoc.data();
        login({
          id: user.uid,
          name: data.name,
          email: data.email,
          role: data.role as 'student' | 'teacher' | 'admin',
          avatar: data.avatar || '👤',
          grade: data.grade || 'N/A',
          board: data.board || 'N/A',
        });
      }
      addNotification('Signed in with Google!', 'success');
    } catch (err: any) {
      addNotification(err.message, 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MY CLASS</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Welcome back to your AI classroom' : 'Join the future of learning'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            onSubmit={handleAuth}
            className="space-y-4"
          >
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {!isLogin && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        role === r 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 ml-1">Board</label>
                    <select
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                    >
                      <option value="CBSE" className="bg-slate-900">CBSE</option>
                      <option value="ICSE" className="bg-slate-900">ICSE</option>
                      <option value="State Board (UP)" className="bg-slate-900">UP Board</option>
                      <option value="State Board (Maharashtra)" className="bg-slate-900">MH Board</option>
                      <option value="IGCSE" className="bg-slate-900">IGCSE</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 ml-1">Grade / Goal</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 3).map(num => (
                        <option key={num} value={`Class ${num}`} className="bg-slate-900">Class {num}</option>
                      ))}
                      <option value="JEE Prep" className="bg-slate-900">JEE Prep</option>
                      <option value="NEET Prep" className="bg-slate-900">NEET Prep</option>
                      <option value="Other Exams" className="bg-slate-900">Other Exams</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0f172a] text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <Chrome className="w-5 h-5 text-white mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
              <Github className="w-5 h-5 text-white mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm">GitHub</span>
            </button>
          </div>
        </div>

        <p className="border-t border-white/5 mt-8 pt-8 text-center text-slate-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-semibold ml-1 hover:underline underline-offset-4"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
