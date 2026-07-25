'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Truck, 
  BarChart3,
  Settings,
  LineChart,
  Box,
  LogIn,
  LogOut,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Overview', icon: BarChart3 },
    { href: '/forecast', label: 'Demand Forecast', icon: TrendingUp },
    { href: '/recommendations', label: 'AI Reorders', icon: Sparkles },
    { href: '/simulator', label: 'Scenario Simulator', icon: Sliders },
    { href: '/suppliers', label: 'Suppliers', icon: Truck },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1F2937] flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">InventoryAI</h1>
          <p className="text-xs text-slate-400 font-medium">Supply Chain SaaS</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2937]/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant Indicator & Auth Controls */}
      <div className="p-4 border-t border-[#1F2937] space-y-3">
        {user ? (
          <div className="bg-[#1F2937]/50 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="font-semibold text-xs text-slate-200 truncate">{user.org_name}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-[#374151]/50 pt-1.5 flex items-center justify-between">
              <span className="truncate">{user.name}</span>
              <span className="text-indigo-400 font-semibold">{user.role}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Auth</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
