import { createContext, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import type { Profile } from '../types/database';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setLoading, setInitialized, reset } =
    useAuthStore();

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const profile = await authService.getProfile(userId);
        setProfile(profile);
      } catch {
        setProfile(null);
      }
    },
    [setProfile]
  );

  const refreshProfile = useCallback(async () => {
    const session = await authService.getSession();
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const session = await authService.getSession();
        if (!mounted) return;

        if (session) {
          setUser(session.user);
          setSession(session);
          await loadProfile(session.user.id);
        } else {
          reset();
        }
      } catch {
        if (mounted) reset();
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    init();

    const { data: listener } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setUser(session.user);
          setSession(session);
          await loadProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        reset();
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile, reset, setInitialized, setLoading, setSession, setUser]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const profile = await authService.getProfile(data.user.id);
        setProfile(profile as Profile | null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, displayName);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    reset();
  };

  return (
    <AuthContext.Provider value={{ signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
