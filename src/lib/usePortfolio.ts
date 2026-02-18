"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stock, Transaction, PortfolioStats, PricePoint,
  generateId, generatePriceHistory, generateSP500History,
  simulatePriceChange, initializeDemoStocks,
} from './types';

const STORAGE_KEY = 'portfolio-tracker-v3';

export function usePortfolio() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sp500History, setSp500History] = useState<PricePoint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Stock[];
        if (parsed.length > 0 && parsed[0].transactions !== undefined) {
          setStocks(parsed);
        } else {
          setStocks(initializeDemoStocks());
        }
      } else {
        setStocks(initializeDemoStocks());
      }
    } catch {
      setStocks(initializeDemoStocks());
    }
    setSp500History(generateSP500History());
    setIsLoaded(true);
  }, []);

  // Save
  useEffect(() => {
    if (isLoaded && stocks.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks)); } catch {}
    }
  }, [stocks, isLoaded]);

  // Auto-update prices every 5s (for demo stocks only)
  useEffect(() => {
    if (!isLoaded) return;
    intervalRef.current = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        if (stock.isRealData) return stock; // skip real data stocks
        const newPrice = Math.round(simulatePriceChange(stock.currentPrice) * 100) / 100;
        const today = new Date().toISOString().split('T')[0];
        const history = [...stock.priceHistory];
        if (history.length && history[history.length - 1].date === today) {
          history[history.length - 1].price = newPrice;
        } else {
          history.push({ date: today, price: newPrice });
        }
        return { ...stock, currentPrice: newPrice, priceHistory: history };
      }));
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLoaded]);

  // Fetch real prices from API
  const fetchRealPrice = useCallback(async (ticker: string): Promise<{
    name: string; currentPrice: number; openPrice: number; previousClose: number;
    history: PricePoint[];
  } | null> => {
    try {
      const [quoteRes, chartRes] = await Promise.all([
        fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}&type=quote`),
        fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}&type=chart`),
      ]);
      if (!quoteRes.ok || !chartRes.ok) return null;
      const quote = await quoteRes.json();
      const chart = await chartRes.json();
      if (quote.error || chart.error) return null;
      return {
        name: quote.name,
        currentPrice: quote.currentPrice,
        openPrice: quote.openPrice || quote.previousClose,
        previousClose: quote.previousClose,
        history: chart.history || [],
      };
    } catch {
      return null;
    }
  }, []);

  // Refresh all real-data stocks
  const refreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      stocks.map(async (stock) => {
        if (!stock.isRealData) return stock;
        const data = await fetchRealPrice(stock.ticker);
        if (!data) return stock;
        return {
          ...stock,
          currentPrice: data.currentPrice,
          openPrice: data.openPrice,
          previousClose: data.previousClose,
          priceHistory: data.history.length > 0 ? data.history : stock.priceHistory,
        };
      })
    );
    setStocks(updated);
    setIsRefreshing(false);
  }, [stocks, fetchRealPrice]);

  // Add stock
  const addStock = useCallback(async (stockData: {
    ticker: string; name: string; shares: number;
    avgPrice: number; currentPrice: number; sector: string; currency: string;
  }) => {
    // Try fetching real data
    const realData = await fetchRealPrice(stockData.ticker);
    const isReal = realData !== null;

    const initialTransaction: Transaction = {
      id: generateId(),
      type: 'buy',
      date: new Date().toISOString().split('T')[0],
      shares: stockData.shares,
      price: stockData.avgPrice,
    };

    const newStock: Stock = {
      id: generateId(),
      ticker: stockData.ticker.toUpperCase(),
      name: isReal ? realData.name : stockData.name,
      shares: stockData.shares,
      avgPrice: stockData.avgPrice,
      currentPrice: isReal ? realData.currentPrice : stockData.currentPrice,
      openPrice: isReal ? realData.openPrice : stockData.currentPrice,
      previousClose: isReal ? realData.previousClose : stockData.currentPrice,
      sector: stockData.sector,
      currency: stockData.currency,
      priceHistory: isReal && realData.history.length > 0
        ? realData.history
        : generatePriceHistory(stockData.currentPrice),
      transactions: [initialTransaction],
      dateAdded: new Date().toISOString().split('T')[0],
      isRealData: isReal,
    };
    setStocks(prev => [...prev, newStock]);
    return isReal;
  }, [fetchRealPrice]);

  // Add transaction to stock
  const addTransaction = useCallback((stockId: string, transaction: Omit<Transaction, 'id'>) => {
    setStocks(prev => prev.map(stock => {
      if (stock.id !== stockId) return stock;
      const newTx: Transaction = { ...transaction, id: generateId() };
      const allTx = [...stock.transactions, newTx];

      // Recalculate shares and avg price
      let totalShares = 0;
      let totalCost = 0;
      allTx.forEach(tx => {
        if (tx.type === 'buy') {
          totalCost += tx.shares * tx.price;
          totalShares += tx.shares;
        } else {
          totalShares -= tx.shares;
        }
      });

      return {
        ...stock,
        transactions: allTx,
        shares: Math.max(0, totalShares),
        avgPrice: totalShares > 0 ? totalCost / totalShares : stock.avgPrice,
      };
    }));
  }, []);

  // Update stock
  const updateStock = useCallback((id: string, updates: Partial<Stock>) => {
    setStocks(prev => prev.map(stock => stock.id === id ? { ...stock, ...updates } : stock));
  }, []);

  // Delete stock
  const deleteStock = useCallback((id: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== id));
  }, []);

  // Reset
  const resetToDemo = useCallback(() => {
    setStocks(initializeDemoStocks());
    setSp500History(generateSP500History());
  }, []);

  // Stats — day change based on openPrice
  const stats: PortfolioStats = stocks.reduce((acc, stock) => {
    const value = stock.shares * stock.currentPrice;
    const invested = stock.shares * stock.avgPrice;
    const dayChange = stock.shares * (stock.currentPrice - stock.openPrice);
    return {
      totalValue: acc.totalValue + value,
      totalInvested: acc.totalInvested + invested,
      totalProfit: acc.totalProfit + (value - invested),
      totalProfitPercent: 0,
      dayChange: acc.dayChange + dayChange,
      dayChangePercent: 0,
    };
  }, { totalValue: 0, totalInvested: 0, totalProfit: 0, totalProfitPercent: 0, dayChange: 0, dayChangePercent: 0 });

  const totalOpenValue = stocks.reduce((sum, s) => sum + s.shares * s.openPrice, 0);
  stats.totalProfitPercent = stats.totalInvested > 0 ? (stats.totalProfit / stats.totalInvested) * 100 : 0;
  stats.dayChangePercent = totalOpenValue > 0 ? (stats.dayChange / totalOpenValue) * 100 : 0;

  // Sector data
  const sectorData = stocks.reduce((acc, stock) => {
    const value = stock.shares * stock.currentPrice;
    const existing = acc.find(s => s.sector === stock.sector);
    if (existing) existing.value += value;
    else acc.push({ sector: stock.sector, value });
    return acc;
  }, [] as { sector: string; value: number }[]);

  // Portfolio history + S&P 500 comparison
  const portfolioHistory = (() => {
    if (stocks.length === 0) return [];
    const minLength = Math.min(...stocks.map(s => s.priceHistory.length));
    if (minLength === 0) return [];
    const history: { date: string; value: number; invested: number; sp500: number }[] = [];
    const sp500Start = sp500History[0]?.price || 1;
    const portfolioStartValue = stocks.reduce((sum, s) => {
      const startPrice = s.priceHistory[0]?.price || s.currentPrice;
      return sum + s.shares * startPrice;
    }, 0);

    for (let i = 0; i < minLength; i++) {
      let totalValue = 0;
      let totalInvested = 0;
      const date = stocks[0].priceHistory[i]?.date || '';
      stocks.forEach(stock => {
        if (stock.priceHistory[i]) {
          totalValue += stock.shares * stock.priceHistory[i].price;
          totalInvested += stock.shares * stock.avgPrice;
        }
      });
      // Normalize S&P 500 to portfolio start value for comparison
      const sp500Val = sp500History[i]
        ? (sp500History[i].price / sp500Start) * portfolioStartValue
        : 0;
      history.push({
        date,
        value: Math.round(totalValue * 100) / 100,
        invested: Math.round(totalInvested * 100) / 100,
        sp500: Math.round(sp500Val * 100) / 100,
      });
    }
    return history;
  })();

  return {
    stocks, stats, sectorData, portfolioHistory, sp500History,
    isLoaded, isRefreshing,
    addStock, updateStock, deleteStock, addTransaction,
    refreshPrices, resetToDemo, fetchRealPrice,
  };
}
