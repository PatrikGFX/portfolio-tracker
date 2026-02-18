"use client";

import { usePortfolio } from '@/lib/usePortfolio';
import StatsCards from '@/components/StatsCards';
import PortfolioChart from '@/components/PortfolioChart';
import SectorChart from '@/components/SectorChart';
import StockTable from '@/components/StockTable';
import AddStockForm from '@/components/AddStockForm';
import TopPerformers from '@/components/TopPerformers';
import { RotateCcw, BarChart3 } from 'lucide-react';

export default function Home() {
  const {
    stocks, stats, sectorData, portfolioHistory, isLoaded,
    addStock, updateStock, deleteStock, resetToDemo,
  } = usePortfolio();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center animate-pulse">
            <BarChart3 size={24} className="text-blue-600" />
          </div>
          <p className="text-gray-400 animate-pulse">Načítání portfolia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Portfolio Tracker
              </h1>
              <p className="text-[11px] text-gray-400 font-mono -mt-0.5">
                {stocks.length} pozic · živé sledování
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDemo}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Demo data</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards stats={stats} stockCount={stocks.length} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PortfolioChart data={portfolioHistory} />
          </div>
          <div className="xl:col-span-1">
            <SectorChart data={sectorData} />
          </div>
        </div>

        <TopPerformers stocks={stocks} />
        <AddStockForm onAdd={addStock} />
        <StockTable stocks={stocks} onUpdate={updateStock} onDelete={deleteStock} />

        <footer className="text-center py-8 border-t border-gray-100">
          <p className="text-xs text-gray-300">
            Portfolio Tracker · Ceny se simulují pro demonstraci · Data uložena v prohlížeči
          </p>
        </footer>
      </main>
    </div>
  );
}
