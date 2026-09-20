import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './firebase';

export interface CloudUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp?: number;
  streak?: number;
  gems?: number;
  hearts?: number;
  stats?: any;
  joinedDate?: string;
}

/**
 * Sign up with Email and Password using Firebase Auth + Firestore
 */
export async function firebaseSignUp(
  name: string,
  email: string,
  password: string,
  avatar = '🦉',
  currentStats?: { xp: number; streak: number; gems: number; hearts: number; stats: any }
): Promise<{ success: boolean; user?: CloudUserData; message?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
    const user = userCredential.user;

    // Update display name in Firebase Auth
    if (name.trim()) {
      await firebaseUpdateProfile(user, { displayName: name.trim() });
    }

    const userData: CloudUserData = {
      id: user.uid,
      name: name.trim() || user.displayName || 'G-koo User',
      email: user.email || email.trim(),
      avatar,
      xp: currentStats?.xp || 140,
      streak: currentStats?.streak || 1,
      gems: currentStats?.gems || 85,
      hearts: currentStats?.hearts || 5,
      stats: currentStats?.stats || { quizzesCompleted: 0, totalAnswered: 0, correctAnswers: 0, bestCombo: 0 },
      joinedDate: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date())
    };

    // Save to Firestore if available
    if (db) {
      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Firestore profile write warning:', err);
      }
    }

    return { success: true, user: userData };
  } catch (error: any) {
    console.error('[Firebase] Sign up error:', error);
    let msg = error?.message || 'Failed to create account';
    if (error.code === 'auth/email-already-in-use') {
      msg = 'An account with this email already exists';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Invalid email address format';
    }
    return { success: false, message: msg };
  }
}

/**
 * Sign in with Email and Password using Firebase Auth + Firestore
 */
export async function firebaseSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: CloudUserData; message?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    const user = userCredential.user;

    // Fetch cloud profile from Firestore if available
    let cloudData: Partial<CloudUserData> = {};
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          cloudData = snap.data() as CloudUserData;
        }
      } catch (err) {
        console.warn('[Firebase] Firestore read warning:', err);
      }
    }

    const userData: CloudUserData = {
      id: user.uid,
      name: cloudData.name || user.displayName || 'G-koo Scholar',
      email: user.email || email.trim(),
      avatar: cloudData.avatar || '🦉',
      xp: cloudData.xp ?? 140,
      streak: cloudData.streak ?? 1,
      gems: cloudData.gems ?? 85,
      hearts: cloudData.hearts ?? 5,
      stats: cloudData.stats || { quizzesCompleted: 0, totalAnswered: 0, correctAnswers: 0, bestCombo: 0 },
      joinedDate: cloudData.joinedDate || new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date())
    };

    return { success: true, user: userData };
  } catch (error: any) {
    console.error('[Firebase] Sign in error:', error);
    let msg = error?.message || 'Invalid credentials';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'Invalid email or password';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Invalid email address';
    }
    return { success: false, message: msg };
  }
}

/**
 * Sign in with Google using Firebase Popup / Redirect
 */
export async function firebaseSignInWithGoogle(
  currentStats?: { xp: number; streak: number; gems: number; hearts: number; stats: any }
): Promise<{ success: boolean; user?: CloudUserData; message?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user already has a profile in Firestore
    let cloudData: Partial<CloudUserData> = {};
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          cloudData = snap.data() as CloudUserData;
        }
      } catch (err) {
        console.warn('[Firebase] Firestore read warning:', err);
      }
    }

    const userData: CloudUserData = {
      id: user.uid,
      name: user.displayName || cloudData.name || 'Google User',
      email: user.email || '',
      avatar: cloudData.avatar || user.photoURL || '🦁',
      xp: cloudData.xp ?? (currentStats?.xp || 150),
      streak: cloudData.streak ?? (currentStats?.streak || 1),
      gems: cloudData.gems ?? (currentStats?.gems || 100),
      hearts: cloudData.hearts ?? 5,
      stats: cloudData.stats || currentStats?.stats || { quizzesCompleted: 0, totalAnswered: 0, correctAnswers: 0, bestCombo: 0 },
      joinedDate: cloudData.joinedDate || new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date())
    };

    // Save or update to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Firestore write warning:', err);
      }
    }

    return { success: true, user: userData };
  } catch (error: any) {
    console.error('[Firebase] Google sign in error:', error);
    let msg = error?.message || 'Google sign-in canceled or failed';
    if (error.code === 'auth/popup-closed-by-user') {
      msg = 'Sign-in popup was closed';
    } else if (error.code === 'auth/cancelled-popup-request') {
      msg = 'Sign-in process cancelled';
    }
    return { success: false, message: msg };
  }
}

/**
 * Sign out from Firebase
 */
export async function firebaseSignOutUser(): Promise<void> {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('[Firebase] Sign out error:', e);
    }
  }
}

/**
 * Sync updated user progress (XP, streaks, gems) to Firestore
 */
export async function syncUserProgressToCloud(
  userId: string,
  data: Partial<CloudUserData>
): Promise<void> {
  if (!db || !userId) return;
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (e) {
    // ignore
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
