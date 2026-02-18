"use client";

import { useState } from 'react';
import { SECTORS } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface AddStockFormProps {
  onAdd: (data: {
    ticker: string; name: string; shares: number;
    avgPrice: number; currentPrice: number; sector: string; currency: string;
  }) => void;
}

export default function AddStockForm({ onAdd }: AddStockFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ ticker: '', name: '', shares: '', avgPrice: '', currentPrice: '', sector: 'technology', currency: 'USD' });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({
      ticker: form.ticker.toUpperCase().trim(), name: form.name.trim(),
      shares: parseFloat(form.shares), avgPrice: parseFloat(form.avgPrice),
      currentPrice: parseFloat(form.currentPrice), sector: form.sector, currency: form.currency,
    });
    setForm({ ticker: '', name: '', shares: '', avgPrice: '', currentPrice: '', sector: 'technology', currency: 'USD' });
    setErrors({}); setIsOpen(false);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Ticker *</label>
          <input type="text" placeholder="např. AAPL" value={form.ticker}
            onChange={e => setForm({ ...form, ticker: e.target.value })} className={inputClass('ticker')} maxLength={10} />
          {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Název společnosti *</label>
          <input type="text" placeholder="např. Apple Inc." value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Počet kusů *</label>
          <input type="number" step="0.001" placeholder="např. 15" value={form.shares}
            onChange={e => setForm({ ...form, shares: e.target.value })} className={inputClass('shares')} />
          {errors.shares && <p className="text-xs text-red-500 mt-1">{errors.shares}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Nákupní cena *</label>
          <input type="number" step="0.01" placeholder="např. 178.50" value={form.avgPrice}
            onChange={e => setForm({ ...form, avgPrice: e.target.value })} className={inputClass('avgPrice')} />
          {errors.avgPrice && <p className="text-xs text-red-500 mt-1">{errors.avgPrice}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Aktuální cena *</label>
          <input type="number" step="0.01" placeholder="např. 195.20" value={form.currentPrice}
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
        <button onClick={handleSubmit}
          className="px-6 py-3 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2">
          <Plus size={16} /> Přidat do portfolia
        </button>
        <button onClick={() => { setIsOpen(false); setErrors({}); }}
          className="px-6 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          Zrušit
        </button>
      </div>
    </div>
  );
}
