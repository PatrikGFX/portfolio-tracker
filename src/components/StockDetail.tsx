"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight, Calendar, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Stock, Transaction, SECTORS, formatCurrency, formatPercent, formatNumber, generateId } from '@/lib/types';

interface StockDetailProps {
  stock: Stock | null;
  onClose: () => void;
  onAddTransaction: (stockId: string, tx: Omit<Transaction, 'id'>) => void;
}

const TIME_RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'Vše', days: 9999 },
];

export default function StockDetail({ stock, onClose, onAddTransaction }: StockDetailProps) {
  const [activeRange, setActiveRange] = useState(2);
  const [showAddTx, setShowAddTx] = useState(false);
  const [txForm, setTxForm] = useState({ type: 'buy' as 'buy' | 'sell', shares: '', price: '', date: new Date().toISOString().split('T')[0] });

  if (!stock) return null;

  const value = stock.shares * stock.currentPrice;
  const invested = stock.shares * stock.avgPrice;
  const profit = value - invested;
  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
  const dayChange = stock.currentPrice - stock.openPrice;
  const dayChangePct = stock.openPrice > 0 ? (dayChange / stock.openPrice) * 100 : 0;
  const sectorInfo = SECTORS[stock.sector] || SECTORS.other;

  const filteredHistory = stock.priceHistory.slice(-TIME_RANGES[activeRange].days);
  const minP = Math.min(...filteredHistory.map(d => d.price)) * 0.99;
  const maxP = Math.max(...filteredHistory.map(d => d.price)) * 1.01;

  const handleAddTx = () => {
    const shares = parseFloat(txForm.shares);
    const price = parseFloat(txForm.price);
    if (!shares || !price || shares <= 0 || price <= 0) return;
    onAddTransaction(stock.id, { type: txForm.type, shares, price, date: txForm.date });
    setTxForm({ type: 'buy', shares: '', price: '', date: new Date().toISOString().split('T')[0] });
    setShowAddTx(false);
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-lg p-2.5 shadow-lg border border-gray-100 text-xs">
        <p className="text-gray-400 font-mono">{new Date(label).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <p className="font-semibold text-gray-900 mt-0.5">${payload[0]?.value?.toFixed(2)}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `${sectorInfo.color}15`, color: sectorInfo.color }}>
                {stock.ticker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{stock.ticker}</h2>
                  {stock.isRealData && (
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">LIVE</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{stock.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Price & stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs text-gray-400">Aktuální cena</span>
                <p className="text-lg font-bold text-gray-900 tabular-nums">${stock.currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs text-gray-400">Denní změna</span>
                <p className={`text-lg font-bold tabular-nums ${dayChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatPercent(dayChangePct)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs text-gray-400">Hodnota pozice</span>
                <p className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(value, 'USD')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs text-gray-400">Celkový zisk</span>
                <p className={`text-lg font-bold tabular-nums ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatPercent(profitPct)}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Cenový graf</h3>
                <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  {TIME_RANGES.map((r, i) => (
                    <button key={r.label} onClick={() => setActiveRange(i)}
                      className={`text-xs font-medium px-3 py-1 rounded-md transition-all ${activeRange === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={profit >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={profit >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                    <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                      stroke="#e5e7ef" tick={{ fontSize: 10, fill: '#9298ad' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[minP, maxP]} tickFormatter={v => `$${v.toFixed(0)}`}
                      stroke="#e5e7ef" tick={{ fontSize: 10, fill: '#9298ad' }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="price" stroke={profit >= 0 ? '#10b981' : '#ef4444'}
                      strokeWidth={2} fill="url(#detailGrad)" animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                { l: 'Kusů', v: formatNumber(stock.shares) },
                { l: 'Nákupka', v: `$${stock.avgPrice.toFixed(2)}` },
                { l: 'Investice', v: formatCurrency(invested, 'USD') },
                { l: 'Zisk', v: formatCurrency(profit, 'USD') },
                { l: 'Sektor', v: sectorInfo.icon },
                { l: 'Přidáno', v: new Date(stock.dateAdded).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) },
              ].map(item => (
                <div key={item.l} className="bg-gray-50 rounded-lg p-2">
                  <span className="text-[10px] text-gray-400 block">{item.l}</span>
                  <span className="text-xs font-semibold text-gray-700">{item.v}</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Historie transakcí</h3>
                <button onClick={() => setShowAddTx(!showAddTx)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus size={14} /> Přidat
                </button>
              </div>

              {/* Add transaction form */}
              <AnimatePresence>
                {showAddTx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3">
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-wrap gap-2 items-end">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Typ</label>
                        <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value as 'buy' | 'sell' })}
                          className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none">
                          <option value="buy">Nákup</option>
                          <option value="sell">Prodej</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Kusů</label>
                        <input type="number" step="0.001" value={txForm.shares} onChange={e => setTxForm({ ...txForm, shares: e.target.value })}
                          className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none" placeholder="10" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Cena</label>
                        <input type="number" step="0.01" value={txForm.price} onChange={e => setTxForm({ ...txForm, price: e.target.value })}
                          className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none" placeholder="195.50" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Datum</label>
                        <input type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                          className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none" />
                      </div>
                      <button onClick={handleAddTx}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Uložit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transaction list */}
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {stock.transactions.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">Žádné transakce</p>
                )}
                {[...stock.transactions].reverse().map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`p-1.5 rounded-lg ${tx.type === 'buy' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {tx.type === 'buy'
                        ? <ArrowDownRight size={14} className="text-emerald-600" />
                        : <ArrowUpRight size={14} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-semibold ${tx.type === 'buy' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'buy' ? 'Nákup' : 'Prodej'}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{formatNumber(tx.shares)} ks @ ${tx.price.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-gray-600 tabular-nums">{formatCurrency(tx.shares * tx.price, 'USD')}</span>
                      <span className="text-[10px] text-gray-300 block">{new Date(tx.date).toLocaleDateString('cs-CZ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
