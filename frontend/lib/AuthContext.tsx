'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  org_name: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, orgName: string) => Promise<void>;
  loginWithSSO: (provider: 'google' | 'github' | 'saml') => Promise<void>;
  demoLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  signup: async () => {},
  loginWithSSO: async () => {},
  demoLogin: () => {},
  logout: () => {},
});

// Helper: set the auth cookie (readable by middleware)
function setAuthCookie() {
  document.cookie = 'inventoryai_auth=true; path=/; max-age=604800; SameSite=Lax';
}

// Helper: clear the auth cookie
function clearAuthCookie() {
  document.cookie = 'inventoryai_auth=; path=/; max-age=0; SameSite=Lax';
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage on mount
    try {
      const savedUser = localStorage.getItem('inventoryai_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setAuthCookie(); // ensure cookie is in sync
      } else {
        clearAuthCookie(); // no session — clear cookie in case it's stale
      }
    } catch (e) {
      console.error('Failed to parse saved user session:', e);
      clearAuthCookie();
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('inventoryai_user', JSON.stringify(u));
    setAuthCookie();
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      }
      persistUser({
        id: `usr-${Date.now()}`,
        email,
        name: 'Satyam Pandey',
        org_name: 'Acme Retail Corp',
        role: 'Operations Director',
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string, orgName: string) => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { name, org_name: orgName } },
        });
        if (error) throw error;
      }
      persistUser({
        id: `usr-${Date.now()}`,
        email,
        name: name || 'Satyam Pandey',
        org_name: orgName || 'New Retail Org',
        role: 'Tenant Admin',
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithSSO = async (provider: 'google' | 'github' | 'saml') => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && provider !== 'saml') {
        await supabase.auth.signInWithOAuth({ provider });
      } else {
        persistUser({
          id: `sso-${provider}-${Date.now()}`,
          email: `satyam@acmeretail.com`,
          name: 'Satyam Pandey',
          org_name: 'Acme Global Supply Chain',
          role: 'Enterprise SSO User',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    persistUser({
      id: 'usr-demo-001',
      email: 'satyam@acmeretail.com',
      name: 'Satyam Pandey',
      org_name: 'Acme Retail Corp',
      role: 'Supply Chain Director',
    });
  };

  const logout = () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('inventoryai_user');
    clearAuthCookie();
    // Hard redirect — forces middleware to re-evaluate, clearing any cached page state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithSSO, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
