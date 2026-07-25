'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  Package, 
  Sparkles, 
  Sliders, 
  Truck, 
  BarChart3,
  Box
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: BarChart3 },
    { href: '/forecast', label: 'Demand Forecast', icon: TrendingUp },
    { href: '/recommendations', label: 'AI Reorders', icon: Sparkles },
    { href: '/simulator', label: 'Scenario Simulator', icon: Sliders },
    { href: '/suppliers', label: 'Suppliers', icon: Truck },
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
      <nav className="flex-1 p-4 space-y-1.5">
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

      {/* Tenant Indicator */}
      <div className="p-4 border-t border-[#1F2937]">
        <div className="bg-[#1F2937]/50 p-3 rounded-xl flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Acme Retail Corp</p>
            <p className="text-slate-400">Pro Plan • Multi-Tenant</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
