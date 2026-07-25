'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec-1',
      sku_code: 'SKU-ELEC-100',
      sku_name: 'Wireless Ergonomic Keyboard',
      category: 'Electronics',
      current_stock: 38,
      reorder_point: 48,
      safety_stock: 25,
      recommended_qty: 140,
      lead_time_days: 5,
      supplier_name: 'TechCorp Asia Supply',
      cost_impact: 4550.00,
      confidence: 0.94,
      status: 'pending',
      reason: '[URGENT REORDER] Current stock (38 units) has fallen below the reorder threshold (48 units). Placing a batch order of 140 units with TechCorp Asia Supply (5-day lead time) secures a 95% target service level and prevents a projected stockout during upcoming holiday demand.'
    },
    {
      id: 'rec-2',
      sku_code: 'SKU-APPL-200',
      sku_name: 'Smart Espresso Coffee Machine',
      category: 'Appliances',
      current_stock: 18,
      reorder_point: 25,
      safety_stock: 12,
      recommended_qty: 50,
      lead_time_days: 10,
      supplier_name: 'TechCorp Asia Supply',
      cost_impact: 5750.00,
      confidence: 0.91,
      status: 'pending',
      reason: '[SUPPLIER BUFFER] TechCorp lead time has extended from 5 to 10 days. Reordering 50 units increases safety buffer to absorb lead time volatility and protect revenue.'
    },
    {
      id: 'rec-3',
      sku_code: 'SKU-APPA-300',
      sku_name: 'Organic Cotton Sweatshirt',
      category: 'Apparel',
      current_stock: 110,
      reorder_point: 85,
      safety_stock: 40,
      recommended_qty: 220,
      lead_time_days: 7,
      supplier_name: 'EuroTextiles Distribution',
      cost_impact: 3740.00,
      confidence: 0.96,
      status: 'accepted',
      reason: '[OPTIMAL EOQ] Economic Order Quantity reorder triggered. Holding cost is minimized with a 95% target service level.'
    }
  ]);

  const handleAction = (id: string, newStatus: 'accepted' | 'rejected') => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            <span>AI Inventory Recommendations</span>
          </h1>
          <p className="text-slate-400 mt-1">Autonomous EOQ & Safety Stock recommendations with LLM reasoning</p>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`glass-card p-6 rounded-2xl border transition-all ${
              rec.status === 'accepted'
                ? 'border-emerald-500/30 bg-emerald-950/10'
                : rec.status === 'rejected'
                ? 'border-slate-800 opacity-60'
                : 'border-indigo-500/30 shadow-xl shadow-indigo-500/5'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                    {rec.sku_code}
                  </span>
                  <h3 className="text-xl font-bold text-white">{rec.sku_name}</h3>
                  <span className="text-xs text-slate-400 font-medium">({rec.category})</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Primary Supplier: <span className="text-slate-200 font-semibold">{rec.supplier_name}</span> ({rec.lead_time_days} Days Lead Time)
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-3">
                {rec.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(rec.id, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleAction(rec.id, 'accepted')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Reorder</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                    rec.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {rec.status === 'accepted' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="capitalize">{rec.status}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Current Stock</span>
                <p className={`text-lg font-bold ${rec.current_stock < rec.reorder_point ? 'text-rose-400' : 'text-slate-100'}`}>
                  {rec.current_stock} units
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Reorder Point (ROP)</span>
                <p className="text-lg font-bold text-slate-100">{rec.reorder_point} units</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Required Safety Stock</span>
                <p className="text-lg font-bold text-amber-400">{rec.safety_stock} units</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Recommended Order Qty</span>
                <p className="text-lg font-bold text-indigo-400">{rec.recommended_qty} units</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Order Value Impact</span>
                <p className="text-lg font-bold text-emerald-400">${rec.cost_impact.toLocaleString()}</p>
              </div>
            </div>

            {/* LLM Reasoning Callout */}
            <div className="bg-[#151D2A] p-4 rounded-xl border border-indigo-500/20 flex items-start space-x-3 mt-2">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Director Reasoning</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
