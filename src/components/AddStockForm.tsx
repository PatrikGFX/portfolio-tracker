"use client";

import { useState } from 'react';
import { SECTORS } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface AddStockFormProps {
  onAdd: (data: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    sector: string;
    currency: string;
  }) => void;
}

export default function AddStockForm({ onAdd }: AddStockFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    ticker: '',
    name: '',
    shares: '',
    avgPrice: '',
    currentPrice: '',
    sector: 'technology',
    currency: 'USD',
  });
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
      ticker: form.ticker.toUpperCase().trim(),
      name: form.name.trim(),
      shares: parseFloat(form.shares),
      avgPrice: parseFloat(form.avgPrice),
      currentPrice: parseFloat(form.currentPrice),
      sector: form.sector,
      currency: form.currency,
    });

    setForm({
      ticker: '',
      name: '',
      shares: '',
      avgPrice: '',
      currentPrice: '',
      sector: 'technology',
      currency: 'USD',
    });
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          w-full glass glass-hover rounded-2xl p-4
          flex items-center justify-center gap-3
          text-white/40 hover:text-emerald-400 transition-all
          border-dashed border-2 border-white/[0.06] hover:border-emerald-500/30
          font-display font-medium
        "
      >
        <Plus size={20} />
        Přidat novou akcii
      </button>
    );
  }

  const inputClass = (field: string) => `
    w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm font-body text-white
    placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors
    ${errors[field] ? 'border-rose-500/50' : 'border-white/[0.08]'}
  `;

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-display font-semibold text-white/80">
          Přidat akcii do portfolia
        </h3>
        <button
          onClick={() => { setIsOpen(false); setErrors({}); }}
          className="p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ticker */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Ticker *
          </label>
          <input
            type="text"
            placeholder="např. AAPL"
            value={form.ticker}
            onChange={e => setForm({ ...form, ticker: e.target.value })}
            className={inputClass('ticker')}
            maxLength={10}
          />
          {errors.ticker && <p className="text-xs text-rose-400 mt-1">{errors.ticker}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Název společnosti *
          </label>
          <input
            type="text"
            placeholder="např. Apple Inc."
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={inputClass('name')}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Shares */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Počet kusů *
          </label>
          <input
            type="number"
            step="0.001"
            placeholder="např. 15"
            value={form.shares}
            onChange={e => setForm({ ...form, shares: e.target.value })}
            className={inputClass('shares')}
          />
          {errors.shares && <p className="text-xs text-rose-400 mt-1">{errors.shares}</p>}
        </div>

        {/* Avg Price */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Nákupní cena *
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="např. 178.50"
            value={form.avgPrice}
            onChange={e => setForm({ ...form, avgPrice: e.target.value })}
            className={inputClass('avgPrice')}
          />
          {errors.avgPrice && <p className="text-xs text-rose-400 mt-1">{errors.avgPrice}</p>}
        </div>

        {/* Current Price */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Aktuální cena *
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="např. 195.20"
            value={form.currentPrice}
            onChange={e => setForm({ ...form, currentPrice: e.target.value })}
            className={inputClass('currentPrice')}
          />
          {errors.currentPrice && <p className="text-xs text-rose-400 mt-1">{errors.currentPrice}</p>}
        </div>

        {/* Sector */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">
            Sektor
          </label>
          <select
            value={form.sector}
            onChange={e => setForm({ ...form, sector: e.target.value })}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-body text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
          >
            {Object.entries(SECTORS).map(([key, val]) => (
              <option key={key} value={key} className="bg-[#1a1a25] text-white">
                {val.icon} {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSubmit}
          className="
            px-6 py-3 rounded-xl font-display font-medium text-sm
            bg-emerald-500 text-black hover:bg-emerald-400
            transition-all hover:shadow-lg hover:shadow-emerald-500/20
            flex items-center gap-2
          "
        >
          <Plus size={16} />
          Přidat do portfolia
        </button>
        <button
          onClick={() => { setIsOpen(false); setErrors({}); }}
          className="
            px-6 py-3 rounded-xl font-body text-sm
            text-white/40 hover:text-white/60 hover:bg-white/5
            transition-colors
          "
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
