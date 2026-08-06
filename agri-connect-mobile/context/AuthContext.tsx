import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_PROFILES } from '../constants/DemoData';

type AuthContextType = {
  signUp: (data: any) => Promise<any>;
  signIn: (data: any) => Promise<any>;
  signOut: () => Promise<void>;
  loginAsDemo: (role: 'Farmer' | 'Buyer' | 'Transport' | 'Expert' | 'Support') => Promise<void>;
  user: User | null;
  session: Session | null;
  loading: boolean;
  demoMode: boolean;
  demoRole: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const fallbackTimeout = setTimeout(() => {
        setLoading(false);
        console.warn("Supabase session fetch timed out - falling back to guest mode.");
      }, 4000);

      try {
        // 1. Check if there is an active Demo Mode session in AsyncStorage
        const savedDemoMode = await AsyncStorage.getItem('isDemoMode');
        const savedDemoRole = await AsyncStorage.getItem('demoRole');

        if (savedDemoMode === 'true' && savedDemoRole) {
          clearTimeout(fallbackTimeout);
          const profile = DEMO_PROFILES[savedDemoRole];
          if (profile) {
            const mockUser: User = {
              id: profile.id,
              email: profile.email,
              phone: profile.phone,
              aud: 'authenticated',
              role: 'authenticated',
              user_metadata: {
                full_name: profile.full_name,
                phone: profile.phone,
                role: profile.role,
                location: profile.location,
                district: profile.district,
                village: profile.village,
                pincode: profile.pincode,
                farm_name: profile.farm_name,
                practices: profile.practices
              },
              app_metadata: {},
              created_at: new Date().toISOString()
            };

            const mockSession: Session = {
              access_token: 'demo-token',
              refresh_token: 'demo-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
              user: mockUser
            };

            setDemoMode(true);
            setDemoRole(savedDemoRole);
            setUser(mockUser);
            setSession(mockSession);
            setLoading(false);
            return;
          }
        }

        // 2. Otherwise fall back to standard Supabase session fetch
        const { data, error: sessionError } = await supabase.auth.getSession();
        clearTimeout(fallbackTimeout);

        if (sessionError) {
          console.warn("Invalid or expired session detected, clearing session storage:", sessionError.message);
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
        } else if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (err: any) {
        console.error("Error fetching session:", err);
        if (err?.message?.includes('Refresh Token')) {
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to standard Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      // If we are in demo mode, ignore standard supabase triggers unless it's a sign-out event
      const savedDemoMode = await AsyncStorage.getItem('isDemoMode');
      if (savedDemoMode === 'true') {
        if (_event === 'SIGNED_OUT') {
          await clearDemoSession();
        }
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearDemoSession = async () => {
    await AsyncStorage.removeItem('isDemoMode');
    await AsyncStorage.removeItem('demoRole');
    setDemoMode(false);
    setDemoRole(null);
    setUser(null);
    setSession(null);
  };

  const loginAsDemo = async (role: 'Farmer' | 'Buyer' | 'Transport' | 'Expert' | 'Support') => {
    setLoading(true);
    try {
      const profile = DEMO_PROFILES[role];
      if (!profile) throw new Error(`Demo role ${role} not found in dataset.`);

      const mockUser: User = {
        id: profile.id,
        email: profile.email,
        phone: profile.phone,
        aud: 'authenticated',
        role: 'authenticated',
        user_metadata: {
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          location: profile.location,
          district: profile.district,
          village: profile.village,
          pincode: profile.pincode,
          farm_name: profile.farm_name,
          practices: profile.practices
        },
        app_metadata: {},
        created_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };

      await AsyncStorage.setItem('isDemoMode', 'true');
      await AsyncStorage.setItem('demoRole', role);

      setDemoMode(true);
      setDemoRole(role);
      setUser(mockUser);
      setSession(mockSession);
    } catch (e) {
      console.error("Failed to log in as demo user:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    signUp: (data: any) => supabase.auth.signUp(data),
    signIn: (data: any) => supabase.auth.signInWithPassword(data),
    signOut: async () => {
      if (demoMode) {
        await clearDemoSession();
      } else {
        await supabase.auth.signOut();
      }
    },
    loginAsDemo,
    user,
    session,
    loading,
    demoMode,
    demoRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
