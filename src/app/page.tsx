'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';
import Dashboard from '@/components/views/Dashboard';
import QuizView from '@/components/views/QuizView';
import PracticeView from '@/components/views/PracticeView';
import Leaderboard from '@/components/views/Leaderboard';
import AIMentor from '@/components/views/AIMentor';
import TeacherDashboard from '@/components/views/TeacherDashboard';
import AdminView from '@/components/views/AdminView';
import AuthView from '@/components/views/AuthView';
import { AnimatePresence, motion } from 'framer-motion';

function ViewRouter() {
  const { currentView, user } = useStore();

  if (!user) return null;

  const view = (() => {
    // Role-gated views
    if (user.role === 'admin') {
      if (currentView === 'dashboard') return <AdminView />;
      if (currentView === 'admin') return <AdminView />;
      return <Dashboard />;
    }
    if (user.role === 'teacher') {
      if (currentView === 'dashboard') return <TeacherDashboard />;
      if (currentView === 'teacher') return <TeacherDashboard />;
      if (currentView === 'mentor') return <AIMentor />;
      if (currentView === 'leaderboard') return <Leaderboard />;
      return <Dashboard />;
    }
    // Student
    switch (currentView) {
      case 'practice':    return <PracticeView />;
      case 'quiz':        return <QuizView />;
      case 'leaderboard': return <Leaderboard />;
      case 'mentor':      return <AIMentor />;
      default:            return <Dashboard />;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView + user.role}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-hidden"
      >
        {view}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const { isLoggedIn, login, logout } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            login({
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              avatar: userData.avatar || '👤',
              grade: userData.grade || 'N/A',
              board: userData.board || 'N/A',
            });
          }
        } catch (error: any) {
          console.error("Firestore sync error:", error);
          // FALLBACK: If Firestore is offline, allow login using Auth profile data
          login({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'student',
            avatar: firebaseUser.photoURL || '👤',
            grade: 'N/A',
            board: 'N/A',
          });
        }
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [login, logout]);

  if (!isLoggedIn) {
    return (
      <main className="h-screen w-screen overflow-hidden">
        <AuthView />
        <Notifications />
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <ViewRouter />
      </div>
      <Notifications />
    </main>
  );
}
