"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stock,
  PortfolioStats,
  generateId,
  generatePriceHistory,
  simulatePriceChange,
  initializeDemoStocks,
} from './types';

const STORAGE_KEY = 'portfolio-tracker-stocks';

export function usePortfolio() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Načtení z localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Stock[];
        if (parsed.length > 0) {
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
    setIsLoaded(true);
  }, []);

  // Uložení do localStorage
  useEffect(() => {
    if (isLoaded && stocks.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
      } catch {
        // localStorage plné, ignorovat
      }
    }
  }, [stocks, isLoaded]);

  // Automatická aktualizace cen každých 5 sekund
  useEffect(() => {
    if (!isLoaded) return;

    intervalRef.current = setInterval(() => {
      setStocks(prev =>
        prev.map(stock => {
          const newPrice = Math.round(simulatePriceChange(stock.currentPrice) * 100) / 100;
          const today = new Date().toISOString().split('T')[0];
          const history = [...stock.priceHistory];

          // Aktualizovat poslední bod historie
          if (history.length > 0 && history[history.length - 1].date === today) {
            history[history.length - 1].price = newPrice;
          } else {
            history.push({ date: today, price: newPrice });
          }

          return {
            ...stock,
            currentPrice: newPrice,
            priceHistory: history,
          };
        })
      );
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoaded]);

  // Přidat akcii
  const addStock = useCallback((stockData: {
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    sector: string;
    currency: string;
  }) => {
    const newStock: Stock = {
      id: generateId(),
      ...stockData,
      ticker: stockData.ticker.toUpperCase(),
      priceHistory: generatePriceHistory(stockData.currentPrice),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setStocks(prev => [...prev, newStock]);
  }, []);

  // Upravit akcii
  const updateStock = useCallback((id: string, updates: Partial<Stock>) => {
    setStocks(prev =>
      prev.map(stock =>
        stock.id === id ? { ...stock, ...updates } : stock
      )
    );
  }, []);

  // Smazat akcii
  const deleteStock = useCallback((id: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== id));
  }, []);

  // Reset na demo data
  const resetToDemo = useCallback(() => {
    const demoStocks = initializeDemoStocks();
    setStocks(demoStocks);
  }, []);

  // Výpočet statistik portfolia
  const stats: PortfolioStats = stocks.reduce(
    (acc, stock) => {
      const value = stock.shares * stock.currentPrice;
      const invested = stock.shares * stock.avgPrice;
      const profit = value - invested;

      // Denní změna - simulace
      const prevPrice = stock.priceHistory.length >= 2
        ? stock.priceHistory[stock.priceHistory.length - 2].price
        : stock.currentPrice;
      const dayChange = stock.shares * (stock.currentPrice - prevPrice);

      return {
        totalValue: acc.totalValue + value,
        totalInvested: acc.totalInvested + invested,
        totalProfit: acc.totalProfit + profit,
        totalProfitPercent: 0, // spočítáme dole
        dayChange: acc.dayChange + dayChange,
        dayChangePercent: 0,   // spočítáme dole
      };
    },
    { totalValue: 0, totalInvested: 0, totalProfit: 0, totalProfitPercent: 0, dayChange: 0, dayChangePercent: 0 }
  );

  stats.totalProfitPercent = stats.totalInvested > 0
    ? (stats.totalProfit / stats.totalInvested) * 100
    : 0;
  stats.dayChangePercent = stats.totalValue > 0
    ? (stats.dayChange / (stats.totalValue - stats.dayChange)) * 100
    : 0;

  // Data pro sektorový graf
  const sectorData = stocks.reduce((acc, stock) => {
    const value = stock.shares * stock.currentPrice;
    const existing = acc.find(s => s.sector === stock.sector);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ sector: stock.sector, value });
    }
    return acc;
  }, [] as { sector: string; value: number }[]);

  // Data pro portfolio graf (historie celkové hodnoty)
  const portfolioHistory = (() => {
    if (stocks.length === 0) return [];

    const minLength = Math.min(...stocks.map(s => s.priceHistory.length));
    if (minLength === 0) return [];

    const history: { date: string; value: number; invested: number }[] = [];

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

      history.push({
        date,
        value: Math.round(totalValue * 100) / 100,
        invested: Math.round(totalInvested * 100) / 100,
      });
    }

    return history;
  })();

  return {
    stocks,
    stats,
    sectorData,
    portfolioHistory,
    isLoaded,
    addStock,
    updateStock,
    deleteStock,
    resetToDemo,
  };
}
