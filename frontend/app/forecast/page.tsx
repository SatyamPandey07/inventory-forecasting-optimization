'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, RefreshCw, Calendar, Cpu } from 'lucide-react';

export default function ForecastPage() {
  const [selectedSku, setSelectedSku] = useState('SKU-ELEC-100');
  const [horizon, setHorizon] = useState(30);

  // Sample demand history + Prophet 30-day forecast dataset
  const forecastData = [
    { date: 'Apr 01', actual: 32, forecast: 32, lower: 28, upper: 36 },
    { date: 'Apr 05', actual: 45, forecast: 45, lower: 38, upper: 52 },
    { date: 'Apr 10', actual: 28, forecast: 28, lower: 22, upper: 34 },
    { date: 'Apr 15', actual: 39, forecast: 39, lower: 32, upper: 46 },
    { date: 'Apr 20', actual: 52, forecast: 52, lower: 44, upper: 60 },
    { date: 'Apr 25', actual: 41, forecast: 41, lower: 35, upper: 47 },
    { date: 'Apr 30', actual: null, forecast: 44, lower: 36, upper: 52 },
    { date: 'May 05', actual: null, forecast: 48, lower: 39, upper: 57 },
    { date: 'May 10', actual: null, forecast: 53, lower: 42, upper: 64 },
    { date: 'May 15', actual: null, forecast: 46, lower: 37, upper: 55 },
    { date: 'May 20', actual: null, forecast: 58, lower: 48, upper: 68 },
    { date: 'May 25', actual: null, forecast: 62, lower: 50, upper: 74 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Prophet Demand Forecasting</h1>
          <p className="text-slate-400 mt-1">Facebook Prophet time-series engine with seasonality & confidence bounds</p>
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            className="bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="SKU-ELEC-100">Wireless Ergonomic Keyboard (SKU-ELEC-100)</option>
            <option value="SKU-APPL-200">Smart Espresso Coffee Machine (SKU-APPL-200)</option>
            <option value="SKU-APPA-300">Organic Cotton Sweatshirt (SKU-APPA-300)</option>
          </select>

          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="bg-[#111827] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value={14}>14 Days Forecast</option>
            <option value={30}>30 Days Forecast</option>
            <option value={60}>60 Days Forecast</option>
          </select>
        </div>
      </div>

      {/* Model Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Model Architecture</p>
            <h4 className="text-lg font-bold text-white">Facebook Prophet v1.1</h4>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Forecast Accuracy (MAPE)</p>
            <h4 className="text-lg font-bold text-emerald-400">95.2% (4.8% MAPE)</h4>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Retraining Schedule</p>
            <h4 className="text-lg font-bold text-white">Weekly via Celery</h4>
          </div>
        </div>
      </div>

      {/* Chart Surface */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Demand Trajectory & Confidence Interval</h3>
            <p className="text-xs text-slate-400">Historical actuals vs 95% confidence predicted demand</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-indigo-400">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Prophet Forecast</span>
            </span>
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span>Historical Actuals</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#6366F1" fillOpacity={0.1} />
              <Area type="monotone" dataKey="forecast" stroke="#6366F1" strokeWidth={3} fill="url(#forecastGrad)" />
              <Area type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={3} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
