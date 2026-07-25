'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr-demo-001',
    email: 'admin@acmeretail.com',
    name: 'Alex Rivera',
    org_name: 'Acme Retail Corp',
    role: 'Supply Chain Director'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local storage session
    const savedUser = localStorage.getItem('inventoryai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user session:', e);
      }
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      }
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: email,
        name: email.split('@')[0].replace('.', ' '),
        org_name: 'Acme Retail Corp',
        role: 'Operations Director'
      };
      setUser(newUser);
      localStorage.setItem('inventoryai_user', JSON.stringify(newUser));
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
          options: { data: { name, org_name: orgName } }
        });
        if (error) throw error;
      }
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        org_name: orgName || 'New Retail Org',
        role: 'Tenant Admin'
      };
      setUser(newUser);
      localStorage.setItem('inventoryai_user', JSON.stringify(newUser));
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
        const ssoUser: UserProfile = {
          id: `sso-${provider}-${Date.now()}`,
          email: `enterprise-user@acmeretail.com`,
          name: `Enterprise User (${provider.toUpperCase()})`,
          org_name: 'Acme Global Supply Chain',
          role: 'Enterprise SSO User'
        };
        setUser(ssoUser);
        localStorage.setItem('inventoryai_user', JSON.stringify(ssoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const demoUser: UserProfile = {
      id: 'usr-demo-001',
      email: 'admin@acmeretail.com',
      name: 'Alex Rivera',
      org_name: 'Acme Retail Corp',
      role: 'Supply Chain Director'
    };
    setUser(demoUser);
    localStorage.setItem('inventoryai_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('inventoryai_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithSSO, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
