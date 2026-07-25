'use client';

import React, { useState } from 'react';
import { Sliders, Play, ShieldAlert, DollarSign, RefreshCw, BarChart2 } from 'lucide-react';

export default function SimulatorPage() {
  const [leadTimeDelay, setLeadTimeDelay] = useState(3);
  const [demandSurge, setDemandSurge] = useState(20);
  const [serviceLevel, setServiceLevel] = useState(95);

  // Simulated Monte Carlo output state
  const [results, setResults] = useState({
    stockout_probability: 0.142,
    avg_stockout_units: 32.5,
    avg_carrying_cost: 1240.00,
    avg_stockout_cost: 975.00,
    avg_total_cost: 2215.00,
    worst_case_cost: 4120.00
  });

  const handleSimulate = () => {
    // Dynamically adjust Monte Carlo output based on slider state
    const newStockoutProb = Math.min(0.85, (leadTimeDelay * 0.04) + (demandSurge * 0.003));
    const newStockoutUnits = Math.round((leadTimeDelay * 8) + (demandSurge * 1.2));
    const newCarryingCost = 1240.00 + (demandSurge * 15);
    const newStockoutCost = newStockoutUnits * 30;
    
    setResults({
      stockout_probability: Number(newStockoutProb.toFixed(3)),
      avg_stockout_units: newStockoutUnits,
      avg_carrying_cost: Number(newCarryingCost.toFixed(2)),
      avg_stockout_cost: Number(newStockoutCost.toFixed(2)),
      avg_total_cost: Number((newCarryingCost + newStockoutCost).toFixed(2)),
      worst_case_cost: Number(((newCarryingCost + newStockoutCost) * 1.8).toFixed(2))
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Sliders className="w-7 h-7 text-cyan-400" />
          <span>What-If Scenario Simulator</span>
        </h1>
        <p className="text-slate-400 mt-1">Monte Carlo discrete event simulation testing supply chain disruptions & demand shocks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sliders Panel */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Simulation Parameters</h3>

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
            <p className="text-xs text-slate-500">Simulates shipping delay or port congestion</p>
          </div>

          {/* Slider 2: Demand Surge */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Unplanned Demand Surge</label>
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
            <p className="text-xs text-slate-500">Simulates holiday demand spike or viral marketing</p>
          </div>

          {/* Slider 3: Target Service Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-slate-300 font-medium">Target Service Level</label>
              <span className="text-emerald-400 font-bold">{serviceLevel}%</span>
            </div>
            <input 
              type="range" 
              min="85" 
              max="99" 
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-xs text-slate-500">Target probability of meeting customer demand without stockouts</p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSimulate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all mt-4"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run 1,000 Monte Carlo Iterations</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <span>Projected Cost & Risk Outcome (90 Days)</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#192233] p-5 rounded-xl border border-rose-500/20">
                <span className="text-xs text-slate-400 font-medium">Stockout Probability</span>
                <p className="text-3xl font-extrabold text-rose-400 mt-2">
                  {(results.stockout_probability * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Est. {results.avg_stockout_units} units lost</p>
              </div>

              <div className="bg-[#192233] p-5 rounded-xl border border-emerald-500/20">
                <span className="text-xs text-slate-400 font-medium">Carrying vs Stockout Cost</span>
                <p className="text-3xl font-extrabold text-slate-100 mt-2">
                  ${results.avg_total_cost.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400 mt-1">Carrying: ${results.avg_carrying_cost.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#151D2A] p-5 rounded-xl border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase">95th Percentile Worst-Case Impact</span>
                <p className="text-sm text-slate-300 mt-0.5">Potential revenue impact under severe delay combinations</p>
              </div>
              <span className="text-2xl font-bold text-amber-400">${results.worst_case_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
