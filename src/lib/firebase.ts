import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { StudentAnalytics } from './mockStudents';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics (only if supported and in browser)
const analytics = typeof window !== "undefined"
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

// Use experimentalForceLongPolling to fix "client is offline" errors on some networks/Windows setups
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

/**
 * Seeds mock student data into Firestore
 */
export async function seedStudentData(students: StudentAnalytics[]) {
  const batch = writeBatch(db);
  const studentsCol = collection(db, 'students');
  
  students.forEach((student) => {
    const studentRef = doc(studentsCol, student.id);
    batch.set(studentRef, {
      ...student,
      updatedAt: new Date().toISOString()
    });
  });
  
  await batch.commit();
}

export { app, auth, db, analytics };
