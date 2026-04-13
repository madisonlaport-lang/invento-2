import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { User, PlanType } from '@/types';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePlan: (plan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PLAN_KEY_PREFIX = 'inventopro_plan_';

function getStoredPlan(uid: string): PlanType {
  try {
    return (localStorage.getItem(`${PLAN_KEY_PREFIX}${uid}`) as PlanType) || 'starter';
  } catch {
    return 'starter';
  }
}

function setStoredPlan(uid: string, plan: PlanType) {
  localStorage.setItem(`${PLAN_KEY_PREFIX}${uid}`, plan);
}

function mapFirebaseUser(firebaseUser: any): User {
  const plan = getStoredPlan(firebaseUser.uid);

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
    plan,
    subscription_status: plan === 'starter' ? 'inactive' : 'active',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('ERREUR LOGIN FIREBASE :', error);

      let message = 'Email ou mot de passe incorrect.';

      if (error?.code === 'auth/invalid-credential') {
        message = 'Email ou mot de passe incorrect.';
      } else if (error?.code === 'auth/user-disabled') {
        message = 'Ce compte a été désactivé.';
      } else if (error?.code === 'auth/too-many-requests') {
        message = 'Trop de tentatives. Réessaie plus tard.';
      }

      return {
        success: false,
        error: message,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      setStoredPlan(result.user.uid, 'starter');

      return { success: true };
    } catch (error: any) {
      console.error('ERREUR REGISTER FIREBASE :', error);

      return {
        success: false,
        error: error?.code || error?.message || "Erreur lors de l'inscription.",
      };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('ERREUR FORGOT PASSWORD :', error);

      return {
        success: false,
        error: error?.message || "Impossible d'envoyer l'email.",
      };
    }
  };

  const updatePlan = (plan: PlanType) => {
    if (!auth.currentUser) return;

    setStoredPlan(auth.currentUser.uid, plan);

    const updatedUser: User = {
      ...mapFirebaseUser(auth.currentUser),
      plan,
      subscription_status: 'active',
    };

    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, forgotPassword, updatePlan }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
