import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Default / fallback Firebase configuration
// Replace these with your actual Firebase project settings
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAK6F7TrQwoEUMgkYrM27usJni1NjDZ7_8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "g-koo-c3aca.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "g-koo-c3aca",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "g-koo-c3aca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "497913237292",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:497913237292:web:5cb10fec272a378445a689"
};

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch (e) {
    console.warn('[Firebase] Initialization error:', e);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
