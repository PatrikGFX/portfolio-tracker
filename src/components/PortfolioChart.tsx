"use client";

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/types';

interface PortfolioChartProps {
  data: { date: string; value: number; invested: number; sp500: number }[];
}

const TIME_RANGES = [
  { label: '1T', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'Vše', days: 9999 },
];

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const [activeRange, setActiveRange] = useState(2);
  const [showInvested, setShowInvested] = useState(false);
  const [showSP500, setShowSP500] = useState(true);

  const filteredData = data.slice(-TIME_RANGES[activeRange].days);

  if (filteredData.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Vývoj portfolia</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-300">Přidejte akcie pro zobrazení grafu</div>
      </div>
    );
  }

  const allValues = filteredData.flatMap(d => {
    const vals = [d.value];
    if (showInvested) vals.push(d.invested);
    if (showSP500 && d.sp500) vals.push(d.sp500);
    return vals;
  });
  const minValue = Math.min(...allValues) * 0.98;
  const maxValue = Math.max(...allValues) * 1.02;
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const firstValue = filteredData[0]?.value || 0;
  const isPositive = lastValue >= firstValue;

  // Performance comparison
  const lastSP = filteredData[filteredData.length - 1]?.sp500 || 0;
  const firstSP = filteredData[0]?.sp500 || 0;
  const portfolioReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const sp500Return = firstSP > 0 ? ((lastSP - firstSP) / firstSP) * 100 : 0;
  const outperforms = portfolioReturn > sp500Return;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
        <p className="text-xs text-gray-400 font-mono mb-1.5">
          {new Date(label).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.stroke }}>
            {p.name === 'value' ? 'Portfolio' : p.name === 'invested' ? 'Investice' : 'S&P 500'}: {formatCurrency(p.value, 'USD')}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Vývoj portfolia</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-400">
              <span className={isPositive ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                {isPositive ? '+' : ''}{formatCurrency(lastValue - firstValue, 'USD')} ({formatCurrency(portfolioReturn, 'USD').replace('US$', '').replace('$', '')}%)
              </span>
            </span>
            {showSP500 && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${outperforms ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {outperforms ? '↑' : '↓'} vs S&P 500
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSP500(!showSP500)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all border ${showSP500 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            S&P 500
          </button>
          <button onClick={() => setShowInvested(!showInvested)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all border ${showInvested ? 'bg-violet-50 text-violet-600 border-violet-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            Investice
          </button>
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {TIME_RANGES.map((range, i) => (
              <button key={range.label} onClick={() => setActiveRange(i)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-all ${activeRange === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.12} />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
              stroke="#e5e7ef" tick={{ fontSize: 11, fill: '#9298ad' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[minValue, maxValue]} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
              stroke="#e5e7ef" tick={{ fontSize: 11, fill: '#9298ad' }} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} />
            {showInvested && (
              <Area type="monotone" dataKey="invested" name="invested" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 3" fill="none" animationDuration={1000} />
            )}
            {showSP500 && (
              <Area type="monotone" dataKey="sp500" name="sp500" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#gSP)" animationDuration={1000} />
            )}
            <Area type="monotone" dataKey="value" name="value" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#gVal)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance comparison bar */}
      {showSP500 && (
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-emerald-500" />
            <span className="text-gray-500">Portfolio: <span className={portfolioReturn >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>{portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0 3px, transparent 3px 5px)' }} />
            <span className="text-gray-500">S&P 500: <span className={sp500Return >= 0 ? 'text-amber-600 font-semibold' : 'text-red-500 font-semibold'}>{sp500Return >= 0 ? '+' : ''}{sp500Return.toFixed(2)}%</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
