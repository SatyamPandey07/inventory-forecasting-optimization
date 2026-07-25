'use client';

import React, { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const [summary, setSummary] = useState<any>({
    total_skus: 3,
    pending_recommendations: 2,
    stockout_risk_count: 2,
    past_30_days_units_sold: 3340,
    past_30_days_revenue: 168450.00
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Control Tower</h1>
          <p className="text-slate-400 mt-1">Real-time demand intelligence and automated inventory optimization</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/simulator"
            className="px-4 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] font-medium text-sm text-slate-200 transition-colors"
          >
            Run What-If Simulation
          </Link>
          <Link 
            href="/recommendations"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 font-medium text-sm text-white shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>View AI Reorders ({summary.pending_recommendations})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Active SKUs</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{summary.total_skus}</p>
          <span className="text-xs text-emerald-400 font-medium mt-2 inline-flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 100% Monitored
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">30-Day Sales Volume</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{summary.past_30_days_units_sold.toLocaleString()} units</p>
          <span className="text-xs text-cyan-400 font-medium mt-2 inline-block">
            ${summary.past_30_days_revenue.toLocaleString()} Revenue
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Stockout Risk Alerts</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{summary.stockout_risk_count} SKUs</p>
          <span className="text-xs text-rose-400 font-medium mt-2 inline-block">
            Below Reorder Point Threshold
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">Pending AI Actions</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{summary.pending_recommendations}</p>
          <span className="text-xs text-amber-400 font-medium mt-2 inline-block">
            Requires Manager Approval
          </span>
        </div>
      </div>

      {/* Critical Stockout Alerts Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>Priority Stockout Risk Warnings</span>
        </h2>
        <div className="space-y-4">
          <div className="bg-[#192233] p-4 rounded-xl flex items-center justify-between border border-rose-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg font-bold text-sm">
                SKU-ELEC-100
              </div>
              <div>
                <h4 className="font-semibold text-white">Wireless Ergonomic Keyboard</h4>
                <p className="text-xs text-slate-400">Current Stock: <span className="text-rose-400 font-bold">38 units</span> | Reorder Point: 48 units</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/30">
                Critical (5 Days Lead Time)
              </span>
            </div>
          </div>

          <div className="bg-[#192233] p-4 rounded-xl flex items-center justify-between border border-amber-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg font-bold text-sm">
                SKU-APPL-200
              </div>
              <div>
                <h4 className="font-semibold text-white">Smart Espresso Coffee Machine</h4>
                <p className="text-xs text-slate-400">Current Stock: <span className="text-amber-400 font-bold">18 units</span> | Reorder Point: 25 units</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/30">
                Supplier Delay Alert (10 Days)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
