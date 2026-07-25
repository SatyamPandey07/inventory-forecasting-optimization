'use client';

import React, { useState } from 'react';
import { Settings, Save, Plus, Building, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('Acme Retail Corp');
  const [tier, setTier] = useState('pro');
  const [carryingCostPct, setCarryingCostPct] = useState(20);
  const [stockoutPenalty, setStockoutPenalty] = useState(30);

  const [skuCode, setSkuCode] = useState('');
  const [skuName, setSkuName] = useState('');
  const [skuCategory, setSkuCategory] = useState('Electronics');
  const [unitCost, setUnitCost] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Settings className="w-7 h-7 text-indigo-400" />
          <span>Organization Settings & Parameters</span>
        </h1>
        <p className="text-slate-400 mt-1">Configure tenant organization details, SKU catalog, and cost constraints</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          ✓ Organization parameters saved successfully!
        </div>
      )}

      {/* Global Cost Parameters Form */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
          <Building className="w-5 h-5 text-indigo-400" />
          <span>Organization & Cost Constraints</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Subscription Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="free">Free Tier</option>
              <option value="pro">Pro Plan ($499/mo)</option>
              <option value="enterprise">Enterprise Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Annual Carrying Cost (% of Unit Cost)</label>
            <input
              type="number"
              value={carryingCostPct}
              onChange={(e) => setCarryingCostPct(Number(e.target.value))}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Stockout Penalty Cost ($ per Unfulfilled Unit)</label>
            <input
              type="number"
              value={stockoutPenalty}
              onChange={(e) => setStockoutPenalty(Number(e.target.value))}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Cost Parameters</span>
        </button>
      </form>

      {/* Add New SKU Form */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          <span>Add New Monitored SKU</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">SKU Code</label>
            <input
              type="text"
              placeholder="e.g. SKU-ELEC-400"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Mechanical Gaming Keyboard"
              value={skuName}
              onChange={(e) => setSkuName(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Category</label>
            <input
              type="text"
              placeholder="e.g. Electronics"
              value={skuCategory}
              onChange={(e) => setSkuCategory(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Unit Cost ($)</label>
            <input
              type="number"
              placeholder="e.g. 45.00"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add SKU to Catalog</span>
        </button>
      </div>
    </div>
  );
}
