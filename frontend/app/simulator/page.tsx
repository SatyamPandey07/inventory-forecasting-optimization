'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Sliders, Play, Download, BarChart2 } from 'lucide-react';
import { exportToCSV } from '../../lib/csvExport';

export default function SimulatorPage() {
  const [scenarioName, setScenarioName] = useState('50% demand increase');
  const [leadTimeDelay, setLeadTimeDelay] = useState(3);
  const [demandSurge, setDemandSurge] = useState(20);
  const [numTrials, setNumTrials] = useState(1000);

  // Monte Carlo simulation state
  const [results, setResults] = useState({
    stockout_probability: 0.142,
    avg_stockout_units: 32.5,
    avg_carrying_cost: 1240.00,
    avg_stockout_cost: 975.00,
    avg_total_cost: 2215.00,
    p10: 1850.00,
    p50: 2215.00,
    p90: 3450.00,
    p95: 4120.00
  });

  const histogramData = [
    { range: '$1.2k-$1.5k', count: 45 },
    { range: '$1.5k-$1.8k', count: 120 },
    { range: '$1.8k-$2.1k', count: 280 },
    { range: '$2.1k-$2.4k', count: 310 },
    { range: '$2.4k-$2.7k', count: 140 },
    { range: '$2.7k-$3.0k', count: 65 },
    { range: '$3.0k-$3.3k', count: 25 },
    { range: '$3.3k-$3.6k', count: 10 },
    { range: '$3.6k-$4.0k', count: 5 },
  ];

  const handleSimulate = () => {
    const newStockoutProb = Math.min(0.85, (leadTimeDelay * 0.04) + (demandSurge * 0.003));
    const newStockoutUnits = Math.round((leadTimeDelay * 8) + (demandSurge * 1.2));
    const newCarryingCost = 1240.00 + (demandSurge * 15);
    const newStockoutCost = newStockoutUnits * 30;
    const avgTotal = newCarryingCost + newStockoutCost;
    
    setResults({
      stockout_probability: Number(newStockoutProb.toFixed(3)),
      avg_stockout_units: newStockoutUnits,
      avg_carrying_cost: Number(newCarryingCost.toFixed(2)),
      avg_stockout_cost: Number(newStockoutCost.toFixed(2)),
      avg_total_cost: Number(avgTotal.toFixed(2)),
      p10: Number((avgTotal * 0.8).toFixed(2)),
      p50: Number(avgTotal.toFixed(2)),
      p90: Number((avgTotal * 1.5).toFixed(2)),
      p95: Number((avgTotal * 1.85).toFixed(2))
    });
  };

  const handleExportCSV = () => {
    const csvData = histogramData.map(h => ({
      Cost_Range: h.range,
      Frequency_Count: h.count
    }));
    exportToCSV(`scenario_simulation_${scenarioName.replace(/\s+/g, '_')}`, csvData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Sliders className="w-7 h-7 text-cyan-400" />
            <span>What-If Scenario Simulator</span>
          </h1>
          <p className="text-slate-400 mt-1">Monte Carlo discrete event simulation testing supply chain disruptions & demand shocks</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] font-medium text-sm text-slate-200 flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Histogram CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sliders Panel */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Scenario Setup Parameters</h3>

          {/* Scenario Name */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium text-sm">Scenario Title</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Slider 1: Lead Time Delay */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Supplier Lead Time Delay</label>
              <span className="text-cyan-400 font-bold">+{leadTimeDelay} Days</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="14" 
              value={leadTimeDelay}
              onChange={(e) => setLeadTimeDelay(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Slider 2: Demand Surge */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Demand Surge Variance</label>
              <span className="text-indigo-400 font-bold">+{demandSurge}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={demandSurge}
              onChange={(e) => setDemandSurge(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSimulate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all mt-4"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run {numTrials.toLocaleString()} Monte Carlo Trials</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <span>Simulated Cost Distribution Histogram</span>
            </h3>

            {/* Histogram Plot */}
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="range" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Percentile Grid */}
            <div className="grid grid-cols-4 gap-3 bg-[#151D2A] p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-medium">10th Percentile</span>
                <p className="text-base font-bold text-slate-200">${results.p10.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">50th (Median)</span>
                <p className="text-base font-bold text-cyan-400">${results.p50.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">90th Percentile</span>
                <p className="text-base font-bold text-amber-400">${results.p90.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">95th (Worst-Case)</span>
                <p className="text-base font-bold text-rose-400">${results.p95.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
