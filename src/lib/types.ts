export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  date: string;
  shares: number;
  price: number;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  openPrice: number;
  previousClose: number;
  sector: string;
  currency: string;
  priceHistory: PricePoint[];
  transactions: Transaction[];
  dateAdded: string;
  isRealData: boolean;  // zda jsou ceny z API
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export const SECTORS: Record<string, { label: string; color: string; icon: string }> = {
  technology: { label: 'Technologie', color: '#3b82f6', icon: '💻' },
  healthcare: { label: 'Zdravotnictví', color: '#10b981', icon: '🏥' },
  finance: { label: 'Finance', color: '#f59e0b', icon: '🏦' },
  energy: { label: 'Energie', color: '#f97316', icon: '⚡' },
  consumer: { label: 'Spotřební zboží', color: '#8b5cf6', icon: '🛍️' },
  industrial: { label: 'Průmysl', color: '#ec4899', icon: '🏭' },
  realestate: { label: 'Nemovitosti', color: '#14b8a6', icon: '🏠' },
  communication: { label: 'Komunikace', color: '#6366f1', icon: '📡' },
  materials: { label: 'Materiály', color: '#84cc16', icon: '🧱' },
  utilities: { label: 'Utility', color: '#06b6d4', icon: '💡' },
  other: { label: 'Ostatní', color: '#94a3b8', icon: '📊' },
};

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return formatCurrency(value);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function simulatePriceChange(currentPrice: number): number {
  const volatility = 0.0015;
  const drift = 0.00005;
  const change = drift + volatility * (Math.random() * 2 - 1);
  return Math.max(0.01, currentPrice * (1 + change));
}

export function generatePriceHistory(currentPrice: number, days: number = 180): PricePoint[] {
  const history: PricePoint[] = [];
  let price = currentPrice * (0.92 + Math.random() * 0.16);
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayChange = 0.0003 + 0.008 * (Math.random() * 2 - 1);
    price = price * (1 + dayChange);
    history.push({ date: date.toISOString().split('T')[0], price: Math.round(price * 100) / 100 });
  }
  history[history.length - 1].price = currentPrice;
  return history;
}

// S&P 500 simulovaná historie
export function generateSP500History(days: number = 180): PricePoint[] {
  const history: PricePoint[] = [];
  let price = 5200;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayChange = 0.0004 + 0.007 * (Math.random() * 2 - 1);
    price = price * (1 + dayChange);
    history.push({ date: date.toISOString().split('T')[0], price: Math.round(price * 100) / 100 });
  }
  return history;
}

export const DEMO_STOCKS: Stock[] = [
  { id: generateId(), ticker: 'AAPL', name: 'Apple Inc.', shares: 15, avgPrice: 178.50, currentPrice: 195.20, openPrice: 194.80, previousClose: 194.50, sector: 'technology', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-01-15', shares: 15, price: 178.50 }], dateAdded: '2024-01-15', isRealData: false },
  { id: generateId(), ticker: 'MSFT', name: 'Microsoft Corp.', shares: 10, avgPrice: 380.00, currentPrice: 425.50, openPrice: 424.90, previousClose: 424.20, sector: 'technology', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-02-01', shares: 10, price: 380.00 }], dateAdded: '2024-02-01', isRealData: false },
  { id: generateId(), ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 8, avgPrice: 480.00, currentPrice: 875.30, openPrice: 873.50, previousClose: 872.00, sector: 'technology', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-03-10', shares: 8, price: 480.00 }], dateAdded: '2024-03-10', isRealData: false },
  { id: generateId(), ticker: 'JNJ', name: 'Johnson & Johnson', shares: 20, avgPrice: 155.00, currentPrice: 162.40, openPrice: 162.10, previousClose: 161.80, sector: 'healthcare', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-01-20', shares: 20, price: 155.00 }], dateAdded: '2024-01-20', isRealData: false },
  { id: generateId(), ticker: 'JPM', name: 'JPMorgan Chase', shares: 12, avgPrice: 170.00, currentPrice: 198.75, openPrice: 198.20, previousClose: 197.90, sector: 'finance', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-04-05', shares: 12, price: 170.00 }], dateAdded: '2024-04-05', isRealData: false },
  { id: generateId(), ticker: 'XOM', name: 'ExxonMobil', shares: 25, avgPrice: 98.00, currentPrice: 108.50, openPrice: 108.30, previousClose: 108.10, sector: 'energy', currency: 'USD', priceHistory: [], transactions: [{ id: generateId(), type: 'buy', date: '2024-02-15', shares: 25, price: 98.00 }], dateAdded: '2024-02-15', isRealData: false },
];

export function initializeDemoStocks(): Stock[] {
  return DEMO_STOCKS.map(stock => ({
    ...stock,
    priceHistory: generatePriceHistory(stock.currentPrice),
  }));
}
