"use client";

import { Stock, SECTORS, formatCurrency, formatPercent } from '@/lib/types';
import { Trophy, TrendingUp, TrendingDown, Award } from 'lucide-react';

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

  const topGainers = [...stocksWithMetrics]
    .sort((a, b) => b.profitPercent - a.profitPercent)
    .slice(0, 3);

  const topLosers = [...stocksWithMetrics]
    .filter(s => s.profitPercent < 0)
    .sort((a, b) => a.profitPercent - b.profitPercent)
    .slice(0, 3);

  const biggest = [...stocksWithMetrics]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const renderList = (
    items: typeof stocksWithMetrics,
    mode: 'gain' | 'loss' | 'size'
  ) => (
    <div className="space-y-2">
      {items.map((stock, i) => {
        const sectorInfo = SECTORS[stock.sector] || SECTORS.other;
        return (
          <div
            key={stock.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-sm font-mono text-white/20 w-5">
              #{i + 1}
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: `${sectorInfo.color}15`, color: sectorInfo.color }}
            >
              {stock.ticker.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-medium text-white truncate">
                {stock.ticker}
              </div>
              <div className="text-xs text-white/30 font-body truncate">
                {stock.name}
              </div>
            </div>
            <div className="text-right">
              {mode === 'size' ? (
                <div className="text-sm font-mono text-white/70 tabular-nums">
                  {formatCurrency(stock.value, 'USD')}
                </div>
              ) : (
                <>
                  <div className={`text-sm font-mono tabular-nums font-medium ${stock.profitPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(stock.profitPercent)}
                  </div>
                  <div className={`text-xs font-mono tabular-nums ${stock.profit >= 0 ? 'text-emerald-400/50' : 'text-rose-400/50'}`}>
                    {formatCurrency(stock.profit, 'USD')}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="text-sm text-white/20 text-center py-4 font-body">Žádná data</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top Gainers */}
      <div className="glass rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-500/15">
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <h4 className="text-sm font-display font-semibold text-white/70">
            Nejlepší výnosy
          </h4>
        </div>
        {renderList(topGainers, 'gain')}
      </div>

      {/* Top Losers */}
      <div className="glass rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-rose-500/15">
            <TrendingDown size={16} className="text-rose-400" />
          </div>
          <h4 className="text-sm font-display font-semibold text-white/70">
            Největší ztráty
          </h4>
        </div>
        {renderList(topLosers, 'loss')}
      </div>

      {/* Biggest Positions */}
      <div className="glass rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-500/15">
            <Award size={16} className="text-amber-400" />
          </div>
          <h4 className="text-sm font-display font-semibold text-white/70">
            Největší pozice
          </h4>
        </div>
        {renderList(biggest, 'size')}
      </div>
    </div>
  );
}
