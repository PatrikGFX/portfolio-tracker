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
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Celkový zisk/ztráta',
      value: formatCurrency(stats.totalProfit, 'USD'),
      subtitle: formatPercent(stats.totalProfitPercent),
      icon: isProfit ? TrendingUp : TrendingDown,
      iconBg: isProfit ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: isProfit ? 'text-emerald-600' : 'text-red-500',
      valueColor: isProfit ? 'text-emerald-600' : 'text-red-500',
    },
    {
      title: 'Denní změna',
      value: formatCurrency(stats.dayChange, 'USD'),
      subtitle: formatPercent(stats.dayChangePercent),
      icon: Activity,
      iconBg: isDayPositive ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: isDayPositive ? 'text-emerald-600' : 'text-red-500',
      valueColor: isDayPositive ? 'text-emerald-600' : 'text-red-500',
    },
    {
      title: 'Investováno',
      value: formatCurrency(stats.totalInvested, 'USD'),
      subtitle: `${stockCount} akcií v portfoliu`,
      icon: BarChart3,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="card p-5 animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[13px] font-medium text-gray-400 tracking-wide">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                <Icon size={17} strokeWidth={2} />
              </div>
            </div>

            <div className={`text-[22px] font-bold tabular-nums ${card.valueColor || 'text-gray-900'}`}>
              {card.value}
            </div>

            {card.subtitle && (
              <div className={`text-sm mt-1 font-mono ${card.valueColor || 'text-gray-400'}`}>
                {card.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
