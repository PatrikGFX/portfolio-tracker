"use client";

import { PortfolioStats, formatCurrency, formatPercent } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Wallet } from 'lucide-react';

interface StatsCardsProps {
  stats: PortfolioStats;
  stockCount: number;
}

export default function StatsCards({ stats, stockCount }: StatsCardsProps) {
  const isProfit = stats.totalProfit >= 0;
  const isDayPositive = stats.dayChange >= 0;

  const cards = [
    {
      title: 'Celková hodnota',
      value: formatCurrency(stats.totalValue, 'USD'),
      icon: Wallet,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Celkový zisk/ztráta',
      value: formatCurrency(stats.totalProfit, 'USD'),
      subtitle: formatPercent(stats.totalProfitPercent),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'from-emerald-500/20 to-emerald-500/5' : 'from-rose-500/20 to-rose-500/5',
      iconColor: isProfit ? 'text-emerald-400' : 'text-rose-400',
      valueColor: isProfit ? 'text-emerald-400' : 'text-rose-400',
      borderColor: isProfit ? 'border-emerald-500/20' : 'border-rose-500/20',
    },
    {
      title: 'Denní změna',
      value: formatCurrency(stats.dayChange, 'USD'),
      subtitle: formatPercent(stats.dayChangePercent),
      icon: Activity,
      color: isDayPositive ? 'from-sky-500/20 to-sky-500/5' : 'from-rose-500/20 to-rose-500/5',
      iconColor: isDayPositive ? 'text-sky-400' : 'text-rose-400',
      valueColor: isDayPositive ? 'text-sky-400' : 'text-rose-400',
      borderColor: isDayPositive ? 'border-sky-500/20' : 'border-rose-500/20',
    },
    {
      title: 'Investováno',
      value: formatCurrency(stats.totalInvested, 'USD'),
      subtitle: `${stockCount} akcií v portfoliu`,
      icon: BarChart3,
      color: 'from-violet-500/20 to-violet-500/5',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`
              relative overflow-hidden rounded-2xl border ${card.borderColor}
              bg-gradient-to-br ${card.color}
              backdrop-blur-sm p-5
              transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              animate-slide-up
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl" />
            
            <div className="flex items-start justify-between mb-3">
              <span className="text-[13px] font-medium text-white/50 tracking-wide uppercase font-body">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-white/[0.05] ${card.iconColor}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
            </div>

            <div className={`text-2xl font-bold font-display tabular-nums ${card.valueColor || 'text-white'}`}>
              {card.value}
            </div>

            {card.subtitle && (
              <div className={`text-sm mt-1 font-mono ${card.valueColor || 'text-white/40'}`}>
                {card.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
