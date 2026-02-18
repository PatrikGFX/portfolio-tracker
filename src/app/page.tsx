"use client";

import { usePortfolio } from '@/lib/usePortfolio';
import StatsCards from '@/components/StatsCards';
import PortfolioChart from '@/components/PortfolioChart';
import SectorChart from '@/components/SectorChart';
import StockTable from '@/components/StockTable';
import AddStockForm from '@/components/AddStockForm';
import TopPerformers from '@/components/TopPerformers';
import { RotateCcw, Github, BarChart3 } from 'lucide-react';

export default function Home() {
  const {
    stocks,
    stats,
    sectorData,
    portfolioHistory,
    isLoaded,
    addStock,
    updateStock,
    deleteStock,
    resetToDemo,
  } = usePortfolio();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
            <BarChart3 size={24} className="text-emerald-400" />
          </div>
          <p className="text-white/30 font-body animate-pulse">Načítání portfolia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BarChart3 size={18} className="text-black" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-white tracking-tight">
                Portfolio Tracker
              </h1>
              <p className="text-[11px] text-white/25 font-mono -mt-0.5">
                živé sledování · {stocks.length} pozic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToDemo}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
              title="Obnovit demo data"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Demo data</span>
            </button>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" title="Ceny se aktualizují" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <StatsCards stats={stats} stockCount={stocks.length} />

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PortfolioChart data={portfolioHistory} />
          </div>
          <div className="xl:col-span-1">
            <SectorChart data={sectorData} />
          </div>
        </div>

        {/* Top performers */}
        <TopPerformers stocks={stocks} />

        {/* Add stock form */}
        <AddStockForm onAdd={addStock} />

        {/* Stock table */}
        <StockTable
          stocks={stocks}
          onUpdate={updateStock}
          onDelete={deleteStock}
        />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/[0.04]">
          <p className="text-xs text-white/20 font-body">
            Portfolio Tracker · Ceny se simulují pro demonstraci · Data uložena v prohlížeči
          </p>
        </footer>
      </main>
    </div>
  );
}
