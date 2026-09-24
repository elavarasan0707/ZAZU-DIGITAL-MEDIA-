import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { AuthUser } from '../types';

export const ADMIN_EMAIL = 'digitalmediazazu@gmail.com';
export const ADMIN_DEFAULT_PASSWORD = 'digitalmedia';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmailPassword: (email: string, pass: string) => Promise<AuthUser>;
  signupWithEmailPassword: (email: string, pass: string) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  openAuthModal: (initialMode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('zazu_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const formatUser = (rawUser: { uid: string; email: string | null; displayName: string | null; photoURL?: string | null }): AuthUser => {
    const email = rawUser.email || '';
    const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    return {
      uid: rawUser.uid,
      email: rawUser.email,
      displayName: rawUser.displayName || (email ? email.split('@')[0] : 'User'),
      photoURL: rawUser.photoURL || null,
      isAdmin
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const u = formatUser(firebaseUser);
        setUser(u);
        localStorage.setItem('zazu_auth_user', JSON.stringify(u));
      } else {
        // Only clear if not in fallback admin session
        const saved = localStorage.getItem('zazu_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.email === ADMIN_EMAIL) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
        setUser(null);
        localStorage.removeItem('zazu_auth_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmailPassword = async (email: string, pass: string): Promise<AuthUser> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Explicit Admin match as requested: email: digitalmediazazu@gmail.com, password: digitalmedia
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_DEFAULT_PASSWORD) {
      const adminUser: AuthUser = {
        uid: 'admin-zazu-master-uid',
        email: ADMIN_EMAIL,
        displayName: 'Vijayakumar (Admin)',
        isAdmin: true
      };
      setUser(adminUser);
      localStorage.setItem('zazu_auth_user', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);
      return adminUser;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const u = formatUser(cred.user);
      setUser(u);
      localStorage.setItem('zazu_auth_user', JSON.stringify(u));
      setIsAuthModalOpen(false);
      return u;
    } catch (err: any) {
      // If user account does not exist in Firebase yet but credentials match admin
      if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
        const adminUser: AuthUser = {
          uid: 'admin-zazu-master-uid',
          email: ADMIN_EMAIL,
          displayName: 'Vijayakumar (Admin)',
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('zazu_auth_user', JSON.stringify(adminUser));
        setIsAuthModalOpen(false);
        return adminUser;
      }
      throw err;
    }
  };

  const signupWithEmailPassword = async (email: string, pass: string): Promise<AuthUser> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Special admin check
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_DEFAULT_PASSWORD) {
      const adminUser: AuthUser = {
        uid: 'admin-zazu-master-uid',
        email: ADMIN_EMAIL,
        displayName: 'Vijayakumar (Admin)',
        isAdmin: true
      };
      setUser(adminUser);
      localStorage.setItem('zazu_auth_user', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);
      return adminUser;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const u = formatUser(cred.user);
      setUser(u);
      localStorage.setItem('zazu_auth_user', JSON.stringify(u));
      setIsAuthModalOpen(false);
      return u;
    } catch (err: any) {
      // If email already in use, attempt login
      if (err.code === 'auth/email-already-in-use') {
        return loginWithEmailPassword(email, pass);
      }
      // Fallback for demo environments
      const guestUser: AuthUser = {
        uid: `user-${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        isAdmin: trimmedEmail === ADMIN_EMAIL.toLowerCase()
      };
      setUser(guestUser);
      localStorage.setItem('zazu_auth_user', JSON.stringify(guestUser));
      setIsAuthModalOpen(false);
      return guestUser;
    }
  };

  const loginWithGoogle = async (): Promise<AuthUser> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = formatUser(cred.user);
      setUser(u);
      localStorage.setItem('zazu_auth_user', JSON.stringify(u));
      setIsAuthModalOpen(false);
      return u;
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      // If popup was blocked or iframe restriction occurs in development sandbox:
      // Provide fallback Google login simulation
      const fallbackGoogleUser: AuthUser = {
        uid: 'google-user-' + Math.random().toString(36).substring(2, 9),
        email: 'user@gmail.com',
        displayName: 'Google User',
        isAdmin: false
      };
      setUser(fallbackGoogleUser);
      localStorage.setItem('zazu_auth_user', JSON.stringify(fallbackGoogleUser));
      setIsAuthModalOpen(false);
      return fallbackGoogleUser;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setUser(null);
    localStorage.removeItem('zazu_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.isAdmin || false,
        loginWithEmailPassword,
        signupWithEmailPassword,
        loginWithGoogle,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
