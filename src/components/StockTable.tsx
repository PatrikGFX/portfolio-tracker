"use client";

import { useState } from 'react';
import { Stock, SECTORS, formatCurrency, formatPercent, formatNumber } from '@/lib/types';
import { Trash2, Edit3, Check, X, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import MiniChart from './MiniChart';

interface StockTableProps {
  stocks: Stock[];
  onUpdate: (id: string, updates: Partial<Stock>) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'ticker' | 'value' | 'profit' | 'profitPercent' | 'dayChange';

export default function StockTable({ stocks, onUpdate, onDelete }: StockTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Stock>>({});
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortAsc, setSortAsc] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const startEdit = (stock: Stock) => {
    setEditingId(stock.id);
    setEditData({ shares: stock.shares, avgPrice: stock.avgPrice, currentPrice: stock.currentPrice });
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  const getStockMetrics = (stock: Stock) => {
    const value = stock.shares * stock.currentPrice;
    const invested = stock.shares * stock.avgPrice;
    const profit = value - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;
    const dayChange = stock.currentPrice - stock.openPrice;
    const dayChangePercent = stock.openPrice > 0 ? (dayChange / stock.openPrice) * 100 : 0;
    return { value, invested, profit, profitPercent, dayChange, dayChangePercent };
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const ma = getStockMetrics(a), mb = getStockMetrics(b);
    let diff = 0;
    switch (sortKey) {
      case 'ticker': diff = a.ticker.localeCompare(b.ticker); break;
      case 'value': diff = ma.value - mb.value; break;
      case 'profit': diff = ma.profit - mb.profit; break;
      case 'profitPercent': diff = ma.profitPercent - mb.profitPercent; break;
      case 'dayChange': diff = ma.dayChangePercent - mb.dayChangePercent; break;
    }
    return sortAsc ? diff : -diff;
  });

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
    >
      {label}
      {sortKey === sortKeyName && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </button>
  );

  if (stocks.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400 text-lg mb-2">Portfolio je prázdné</p>
        <p className="text-gray-300 text-sm">Přidejte svou první akcii</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Moje akcie</h3>
        <p className="text-sm text-gray-400 mt-0.5">{stocks.length} pozic · ceny se aktualizují každých 5s</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left p-4 pl-5"><SortHeader label="Akcie" sortKeyName="ticker" /></th>
              <th className="text-right p-4 hidden sm:table-cell">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kusů</span>
              </th>
              <th className="text-right p-4 hidden md:table-cell">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nákupka</span>
              </th>
              <th className="text-right p-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cena</span>
              </th>
              <th className="text-right p-4"><SortHeader label="Hodnota" sortKeyName="value" /></th>
              <th className="text-right p-4"><SortHeader label="Zisk" sortKeyName="profit" /></th>
              <th className="text-right p-4 hidden lg:table-cell"><SortHeader label="Dnes" sortKeyName="dayChange" /></th>
              <th className="text-center p-4 hidden xl:table-cell">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Trend</span>
              </th>
              <th className="text-right p-4 pr-5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Akce</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => {
              const metrics = getStockMetrics(stock);
              const isEditing = editingId === stock.id;
              const isDeleting = confirmDelete === stock.id;
              const sectorInfo = SECTORS[stock.sector] || SECTORS.other;

              return (
                <tr key={stock.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${sectorInfo.color}18`, color: sectorInfo.color }}
                      >
                        {stock.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{stock.ticker}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[120px]">{stock.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-right hidden sm:table-cell">
                    {isEditing ? (
                      <input type="number" value={editData.shares ?? stock.shares}
                        onChange={e => setEditData({ ...editData, shares: parseFloat(e.target.value) || 0 })}
                        className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right text-sm font-mono text-gray-800 focus:outline-none focus:border-blue-400" />
                    ) : (
                      <span className="text-sm font-mono text-gray-600 tabular-nums">{formatNumber(stock.shares)}</span>
                    )}
                  </td>

                  <td className="p-4 text-right hidden md:table-cell">
                    {isEditing ? (
                      <input type="number" step="0.01" value={editData.avgPrice ?? stock.avgPrice}
                        onChange={e => setEditData({ ...editData, avgPrice: parseFloat(e.target.value) || 0 })}
                        className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right text-sm font-mono text-gray-800 focus:outline-none focus:border-blue-400" />
                    ) : (
                      <span className="text-sm font-mono text-gray-400 tabular-nums">${stock.avgPrice.toFixed(2)}</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <span className="text-sm font-mono text-gray-900 tabular-nums font-medium">
                      ${stock.currentPrice.toFixed(2)}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <span className="text-sm font-mono text-gray-800 tabular-nums font-medium">
                      {formatCurrency(metrics.value, 'USD')}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className={`text-sm font-mono tabular-nums font-medium ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(metrics.profit, 'USD')}
                    </div>
                    <div className={`text-xs font-mono tabular-nums ${metrics.profit >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {formatPercent(metrics.profitPercent)}
                    </div>
                  </td>

                  <td className="p-4 text-right hidden lg:table-cell">
                    <div className="flex items-center justify-end gap-1">
                      {metrics.dayChange >= 0 ? (
                        <TrendingUp size={13} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={13} className="text-red-400" />
                      )}
                      <span className={`text-sm font-mono tabular-nums ${metrics.dayChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatPercent(metrics.dayChangePercent)}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center hidden xl:table-cell">
                    <div className="w-[80px] h-[32px] mx-auto">
                      <MiniChart data={stock.priceHistory.slice(-20)} color={metrics.profit >= 0 ? '#10b981' : '#ef4444'} />
                    </div>
                  </td>

                  <td className="p-4 pr-5 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => saveEdit(stock.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => { setEditingId(null); setEditData({}); }}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : isDeleting ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { onDelete(stock.id); setConfirmDelete(null); }}
                          className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors">
                          Smazat
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(stock)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(stock.id)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
