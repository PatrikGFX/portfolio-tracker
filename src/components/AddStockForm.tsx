"use client";

import { useState } from 'react';
import { SECTORS } from '@/lib/types';
import { Plus, X, Search, Wifi, Loader2 } from 'lucide-react';

interface AddStockFormProps {
  onAdd: (data: {
    ticker: string; name: string; shares: number;
    avgPrice: number; currentPrice: number; sector: string; currency: string;
  }) => Promise<boolean>;
}

export default function AddStockForm({ onAdd }: AddStockFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wasRealData, setWasRealData] = useState<boolean | null>(null);
  const [form, setForm] = useState({ ticker: '', name: '', shares: '', avgPrice: '', currentPrice: '', sector: 'technology', currency: 'USD' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill from API
  const lookupTicker = async () => {
    if (!form.ticker.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock?ticker=${encodeURIComponent(form.ticker.trim())}&type=quote`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          setForm(prev => ({
            ...prev,
            name: data.name || prev.name,
            currentPrice: data.currentPrice?.toString() || prev.currentPrice,
          }));
        }
      }
    } catch {}
    setIsLoading(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.ticker.trim()) errs.ticker = 'Vyplňte ticker';
    if (!form.name.trim()) errs.name = 'Vyplňte název';
    if (!form.shares || parseFloat(form.shares) <= 0) errs.shares = 'Zadejte počet';
    if (!form.avgPrice || parseFloat(form.avgPrice) <= 0) errs.avgPrice = 'Zadejte cenu';
    if (!form.currentPrice || parseFloat(form.currentPrice) <= 0) errs.currentPrice = 'Zadejte cenu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const isReal = await onAdd({
      ticker: form.ticker.toUpperCase().trim(), name: form.name.trim(),
      shares: parseFloat(form.shares), avgPrice: parseFloat(form.avgPrice),
      currentPrice: parseFloat(form.currentPrice), sector: form.sector, currency: form.currency,
    });
    setWasRealData(isReal);
    setIsLoading(false);
    setForm({ ticker: '', name: '', shares: '', avgPrice: '', currentPrice: '', sector: 'technology', currency: 'USD' });
    setErrors({});
    setTimeout(() => { setIsOpen(false); setWasRealData(null); }, 2000);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-400 hover:text-blue-600 transition-all border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 font-medium">
        <Plus size={20} /> Přidat novou akcii
      </button>
    );
  }

  const inputClass = (field: string) =>
    `w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors ${errors[field] ? 'border-red-300' : 'border-gray-200'}`;

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-800">Přidat akcii do portfolia</h3>
        <button onClick={() => { setIsOpen(false); setErrors({}); }}
          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {wasRealData !== null && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${wasRealData ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
          {wasRealData ? <><Wifi size={14} /> Akcie přidána s reálnými daty z Yahoo Finance!</> : <><Plus size={14} /> Akcie přidána se simulovanými daty</>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Ticker *</label>
          <div className="relative">
            <input type="text" placeholder="např. AAPL" value={form.ticker}
              onChange={e => setForm({ ...form, ticker: e.target.value })}
              onBlur={lookupTicker}
              className={inputClass('ticker')} maxLength={10} />
            <button onClick={lookupTicker} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              {isLoading ? <Loader2 size={14} className="text-gray-400 animate-spin" /> : <Search size={14} className="text-gray-400" />}
            </button>
          </div>
          {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Název *</label>
          <input type="text" placeholder="např. Apple Inc." value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Počet kusů *</label>
          <input type="number" step="0.001" placeholder="15" value={form.shares}
            onChange={e => setForm({ ...form, shares: e.target.value })} className={inputClass('shares')} />
          {errors.shares && <p className="text-xs text-red-500 mt-1">{errors.shares}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Nákupní cena *</label>
          <input type="number" step="0.01" placeholder="178.50" value={form.avgPrice}
            onChange={e => setForm({ ...form, avgPrice: e.target.value })} className={inputClass('avgPrice')} />
          {errors.avgPrice && <p className="text-xs text-red-500 mt-1">{errors.avgPrice}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Aktuální cena *</label>
          <input type="number" step="0.01" placeholder="195.20" value={form.currentPrice}
            onChange={e => setForm({ ...form, currentPrice: e.target.value })} className={inputClass('currentPrice')} />
          {errors.currentPrice && <p className="text-xs text-red-500 mt-1">{errors.currentPrice}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Sektor</label>
          <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer">
            {Object.entries(SECTORS).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={handleSubmit} disabled={isLoading}
          className="px-6 py-3 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {isLoading ? 'Načítání...' : 'Přidat do portfolia'}
        </button>
        <button onClick={() => { setIsOpen(false); setErrors({}); }}
          className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">Zrušit</button>
      </div>
    </div>
  );
}
