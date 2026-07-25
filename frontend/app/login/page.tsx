'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithSSO, demoLogin, loading, user } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    router.push('/');
  };

  const handleSSO = async (provider: 'google' | 'github' | 'saml') => {
    await loginWithSSO(provider);
    router.push('/');
  };

  const handleQuickDemo = () => {
    demoLogin();
    router.push('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to InventoryAI</h2>
          <p className="text-xs text-slate-400">Enterprise Supply Chain Intelligence & Demand Planning</p>
        </div>

        {user && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
            <span>✓ Signed in as <strong className="text-white">{user.email}</strong></span>
            <Link href="/" className="text-indigo-400 hover:underline">Go to Dashboard →</Link>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-[#111827] border border-[#1F2937] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <a href="#" className="text-indigo-400 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111827] border border-[#1F2937] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Supabase'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* SSO Options */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#1F2937] w-full" />
            <span className="bg-[#0D1525] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">Or Single Sign-On</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSSO('google')}
              className="py-2.5 px-4 rounded-xl bg-[#1F2937] hover:bg-[#374151] border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Google SSO</span>
            </button>
            <button
              onClick={() => handleSSO('github')}
              className="py-2.5 px-4 rounded-xl bg-[#1F2937] hover:bg-[#374151] border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <span>GitHub SSO</span>
            </button>
          </div>
        </div>

        {/* Demo Quick Access */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 text-center">
          <p className="text-xs text-indigo-300 font-medium flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evaluating Demo Application?</span>
          </p>
          <button
            onClick={handleQuickDemo}
            className="w-full py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-bold text-xs border border-indigo-500/30 transition-colors"
          >
            Instant Demo Admin Access →
          </button>
        </div>

        {/* Signup Link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">
            Create Organization Account
          </Link>
        </p>
      </div>
    </div>
  );
}
