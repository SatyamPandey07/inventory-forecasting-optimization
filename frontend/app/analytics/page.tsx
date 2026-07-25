'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { LineChart as AnalyticsIcon, Award, DollarSign, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const mapeTrendData = [
    { week: 'Wk 1', mape: 8.5, mae: 4.2 },
    { week: 'Wk 2', mape: 7.2, mae: 3.8 },
    { week: 'Wk 3', mape: 6.1, mae: 3.1 },
    { week: 'Wk 4', mape: 5.4, mae: 2.7 },
    { week: 'Wk 5', mape: 4.8, mae: 2.3 },
    { week: 'Wk 6', mape: 4.5, mae: 2.1 },
  ];

  const decisionOutcomes = [
    { sku: 'SKU-ELEC-100', decision: 'Accepted Reorder (140 units)', actual_units: 138, variance: '-2 units', cost_impact: '+$1,850 Saved' },
    { sku: 'SKU-APPL-200', decision: 'Accepted Safety Buffer', actual_units: 48, variance: '-2 units', cost_impact: '+$2,400 Protected' },
    { sku: 'SKU-APPA-300', decision: 'Accepted EOQ Order', actual_units: 215, variance: '-5 units', cost_impact: '+$1,200 Savings' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <AnalyticsIcon className="w-7 h-7 text-indigo-400" />
          <span>Forecast Analytics & Decision Outcomes</span>
        </h1>
        <p className="text-slate-400 mt-1">MAPE/MAE accuracy trends over time and decision cost impact audit</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Average Forecast MAPE</span>
          <p className="text-3xl font-bold text-emerald-400 mt-2">4.5%</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Top 5% Industry Precision</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Mean Absolute Error (MAE)</span>
          <p className="text-3xl font-bold text-cyan-400 mt-2">2.1 units</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Daily Forecast Variance</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Net Cost Impact Saved</span>
          <p className="text-3xl font-bold text-indigo-400 mt-2">+$5,450.00</p>
          <span className="text-xs text-indigo-300 mt-1 inline-block">Via Accepted AI Reorders</span>
        </div>
      </div>

      {/* MAPE Trend Plot */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-6">Prophet Forecast Error Rate Trend (MAPE % Over Time)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mapeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="mape" stroke="#10B981" strokeWidth={3} name="MAPE (%)" />
              <Line type="monotone" dataKey="mae" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 5" name="MAE (units)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision Audit Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Decision Outcomes & Cost Savings Audit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#151D2A] text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3.5 rounded-l-xl">SKU</th>
                <th className="p-3.5">Decision Implemented</th>
                <th className="p-3.5">Actual Demand Realized</th>
                <th className="p-3.5">Variance</th>
                <th className="p-3.5 rounded-r-xl">Financial Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {decisionOutcomes.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#192233]/50 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-400">{row.sku}</td>
                  <td className="p-3.5 font-medium text-white">{row.decision}</td>
                  <td className="p-3.5 text-slate-300">{row.actual_units} units</td>
                  <td className="p-3.5 text-emerald-400 font-semibold">{row.variance}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{row.cost_impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
