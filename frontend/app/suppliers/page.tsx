'use client';

import React from 'react';
import { Truck, ShieldCheck, Clock, Award } from 'lucide-react';

export default function SuppliersPage() {
  const suppliers = [
    {
      id: 'sup-1',
      name: 'TechCorp Asia Supply',
      contact: 'supply@techcorp-asia.com',
      lead_time_days: 5,
      reliability_score: 0.96,
      quality_score: 0.99,
      skus_count: 2
    },
    {
      id: 'sup-2',
      name: 'EuroTextiles Distribution',
      contact: 'orders@eurotextiles.eu',
      lead_time_days: 7,
      reliability_score: 0.91,
      quality_score: 0.94,
      skus_count: 1
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Truck className="w-7 h-7 text-indigo-400" />
          <span>Supplier Performance & Reliability</span>
        </h1>
        <p className="text-slate-400 mt-1">Vendor scorecard, lead time tracking, and quality metrics</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => (
          <div key={sup.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{sup.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{sup.contact}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                {sup.skus_count} SKUs Supplied
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Standard Lead Time</span>
                <p className="text-lg font-bold text-slate-100">{sup.lead_time_days} Days</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Reliability Rating</span>
                <p className="text-lg font-bold text-emerald-400">{(sup.reliability_score * 100).toFixed(0)}%</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Quality Acceptance</span>
                <p className="text-lg font-bold text-cyan-400">{(sup.quality_score * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
