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
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { exportToCSV } from '../lib/csvExport';

export default function OverviewPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [summary] = useState({
    total_skus: 3,
    pending_recommendations: 2,
    stockout_risk_count: 2,
    past_30_days_units_sold: 3340,
    past_30_days_revenue: 168450.00
  });

  const topSkus = [
    { sku_code: 'SKU-ELEC-100', name: 'Wireless Ergonomic Keyboard', category: 'Electronics', stock: 38, rop: 48, price: 79.99, status: 'Stockout Risk' },
    { sku_code: 'SKU-APPL-200', name: 'Smart Espresso Coffee Machine', category: 'Appliances', stock: 18, rop: 25, price: 249.99, status: 'Stockout Risk' },
    { sku_code: 'SKU-APPA-300', name: 'Organic Cotton Hooded Sweatshirt', category: 'Apparel', stock: 110, rop: 85, price: 49.99, status: 'Optimal' },
  ];

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    // Auto-polling interval every 5 minutes (300,000 ms)
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 300000);
    return () => clearInterval(timer);
  }, []);

  const handleExportCSV = () => {
    exportToCSV("top_skus_inventory", topSkus);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Control Tower</h1>
          <p className="text-slate-400 mt-1 flex items-center space-x-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-polling active • Last refreshed at {lastUpdated || 'just now'}</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] font-medium text-sm text-slate-200 flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
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
            Below Reorder Threshold
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
            Requires Manager Action
          </span>
        </div>
      </div>

      {/* Top Monitored SKUs Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4">Top Monitored SKUs & Real-time Stock Levels</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#151D2A] text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3.5 rounded-l-xl">SKU Code</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Reorder Point</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {topSkus.map((sku) => (
                <tr key={sku.sku_code} className="hover:bg-[#192233]/50 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-400">{sku.sku_code}</td>
                  <td className="p-3.5 font-medium text-white">{sku.name}</td>
                  <td className="p-3.5 text-slate-400">{sku.category}</td>
                  <td className={`p-3.5 font-bold ${sku.stock < sku.rop ? 'text-rose-400' : 'text-slate-200'}`}>
                    {sku.stock} units
                  </td>
                  <td className="p-3.5 text-slate-300">{sku.rop} units</td>
                  <td className="p-3.5 text-emerald-400">${sku.price}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      sku.status === 'Stockout Risk'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {sku.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
