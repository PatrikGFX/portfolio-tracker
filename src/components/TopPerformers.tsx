"use client";

import { Stock, SECTORS, formatCurrency, formatPercent } from '@/lib/types';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

interface TopPerformersProps {
  stocks: Stock[];
}

export default function TopPerformers({ stocks }: TopPerformersProps) {
  if (stocks.length === 0) return null;

  const stocksWithMetrics = stocks.map(stock => {
    const value = stock.shares * stock.currentPrice;
    const invested = stock.shares * stock.avgPrice;
    const profit = value - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;
    return { ...stock, profit, profitPercent, value };
  });

  const topGainers = [...stocksWithMetrics].sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 3);
  const topLosers = [...stocksWithMetrics].filter(s => s.profitPercent < 0).sort((a, b) => a.profitPercent - b.profitPercent).slice(0, 3);
  const biggest = [...stocksWithMetrics].sort((a, b) => b.value - a.value).slice(0, 3);

  const renderList = (items: typeof stocksWithMetrics, mode: 'gain' | 'loss' | 'size') => (
    <div className="space-y-1.5">
      {items.map((stock, i) => {
        const sectorInfo = SECTORS[stock.sector] || SECTORS.other;
        return (
          <div key={stock.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <span className="text-xs font-mono text-gray-300 w-5">#{i + 1}</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: `${sectorInfo.color}15`, color: sectorInfo.color }}>
              {stock.ticker.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800">{stock.ticker}</div>
              <div className="text-xs text-gray-400 truncate">{stock.name}</div>
            </div>
            <div className="text-right">
              {mode === 'size' ? (
                <div className="text-sm font-mono text-gray-700 tabular-nums">{formatCurrency(stock.value, 'USD')}</div>
              ) : (
                <>
                  <div className={`text-sm font-mono tabular-nums font-medium ${stock.profitPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatPercent(stock.profitPercent)}
                  </div>
                  <div className={`text-xs font-mono tabular-nums ${stock.profit >= 0 ? 'text-emerald-400' : 'text-red-300'}`}>
                    {formatCurrency(stock.profit, 'USD')}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-gray-300 text-center py-4">Žádná data</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-50"><TrendingUp size={15} className="text-emerald-600" /></div>
          <h4 className="text-sm font-semibold text-gray-700">Nejlepší výnosy</h4>
        </div>
        {renderList(topGainers, 'gain')}
      </div>
      <div className="card p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-red-50"><TrendingDown size={15} className="text-red-500" /></div>
          <h4 className="text-sm font-semibold text-gray-700">Největší ztráty</h4>
        </div>
        {renderList(topLosers, 'loss')}
      </div>
      <div className="card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-50"><Award size={15} className="text-amber-600" /></div>
          <h4 className="text-sm font-semibold text-gray-700">Největší pozice</h4>
        </div>
        {renderList(biggest, 'size')}
      </div>
    </div>
  );
}
