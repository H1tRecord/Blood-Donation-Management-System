import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, db, firebaseConfig } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const sessionTimeoutRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────

  // Fetch user profile from Realtime DB using the Firebase UID
  const fetchProfile = async (uid) => {
    const snapshot = await get(ref(db, `users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  };

  // Start / reset 30-minute idle session timeout
  const startSessionTimeout = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    sessionTimeoutRef.current = setTimeout(async () => {
      alert('Your session has expired due to inactivity. Please log in again.');
      await logout();
    }, 30 * 60 * 1000);
  };

  // Reset timeout on user activity
  const resetSessionTimeout = () => {
    if (isAuthenticated) startSessionTimeout();
  };

  // ── Session persistence via Firebase Auth listener ─────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        if (profile && profile.isActive) {
          setCurrentUser({ uid: firebaseUser.uid, ...profile });
          setIsAuthenticated(true);
          startSessionTimeout();
        } else {
          // Profile missing or deactivated – sign out silently
          await signOut(auth);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(credential.user.uid);

      if (!profile) {
        await signOut(auth);
        return { success: false, message: 'Account profile not found. Please contact support.' };
      }
      if (!profile.isActive) {
        await signOut(auth);
        return { success: false, message: 'Your account has been deactivated.' };
      }

      const userWithUid = { uid: credential.user.uid, ...profile };
      setCurrentUser(userWithUid);
      setIsAuthenticated(true);
      startSessionTimeout();
      return { success: true, user: userWithUid };
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message;
      return { success: false, message: msg };
    }
  };

  // ── ID generation ──────────────────────────────────────────────────
  // ── Register ───────────────────────────────────────────────────────────
  const register = async (userData, autoLogin = false) => {
    try {
      // Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const uid = credential.user.uid;

      // Build the profile (never store plain password in DB)
      const profile = {
        role: userData.role,
        email: userData.email,
        name: userData.name,
        registrationDate: new Date().toISOString().split('T')[0],
        isActive: true,
        ...(userData.role === 'donor' && {
          bloodType: null,
          lastDonationDate: null,
          donationCount: 0,
        }),
      };

      // Write profile to Realtime Database at users/{uid}
      await set(ref(db, `users/${uid}`), profile);

      const userWithUid = { uid, ...profile };

      if (autoLogin && userData.role === 'donor') {
        setCurrentUser(userWithUid);
        setIsAuthenticated(true);
        startSessionTimeout();
      } else {
        // Sign out so staff must log in explicitly; page redirects to /login
        await signOut(auth);
      }

      return {
        success: true,
        message: 'Registration successful! Please log in.',
        user: userWithUid,
      };
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Email already registered'
          : err.message;
      return { success: false, message: msg };
    }
  };

  // ── Admin: create staff / admin account without logging out ─────────
  // Uses a secondary Firebase app instance so the admin's current session
  // is never disrupted by the createUserWithEmailAndPassword call.
  const adminCreateAccount = async (userData) => {
    try {
      // Spin up a temporary secondary app with a unique name
      const secondaryApp = initializeApp(firebaseConfig, `admin-create-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      let uid;
      try {
        const credential = await createUserWithEmailAndPassword(
          secondaryAuth,
          userData.email,
          userData.password
        );
        uid = credential.user.uid;
        await signOut(secondaryAuth);
      } finally {
        // Always clean up the secondary app regardless of success/failure
        await deleteApp(secondaryApp);
      }

      const profile = {
        role: userData.role,
        email: userData.email,
        name: userData.name,
        registrationDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      await set(ref(db, `users/${uid}`), profile);

      return {
        success: true,
        message: `Account created successfully.`,
        user: { uid, ...profile },
      };
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Email already registered'
          : err.message;
      return { success: false, message: msg };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setIsAuthenticated(false);
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  // ── Update current user's own profile ─────────────────────────────
  const updateProfile = async (updates) => {
    if (!currentUser?.uid) return { success: false, message: 'Not authenticated' };
    await update(ref(db, `users/${currentUser.uid}`), updates);
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    return { success: true };
  };

  // ── Update blood type for any user (used by staff) ─────────────────
  // userId here is the Firebase UID stored on currentUser.uid
  const updateUserBloodType = async (userId, bloodType) => {
    await update(ref(db, `users/${userId}`), { bloodType });
    if (currentUser && currentUser.uid === userId) {
      setCurrentUser({ ...currentUser, bloodType });
    }
    return { success: true };
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    adminCreateAccount,
    logout,
    updateProfile,
    updateUserBloodType,
    resetSessionTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
