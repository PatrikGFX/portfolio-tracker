export interface Stock {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;        // průměrná nákupní cena
  currentPrice: number;    // aktuální cena
  sector: string;
  currency: string;
  priceHistory: PricePoint[];
  dateAdded: string;
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
  technology: { label: 'Technologie', color: '#38bdf8', icon: '💻' },
  healthcare: { label: 'Zdravotnictví', color: '#34d399', icon: '🏥' },
  finance: { label: 'Finance', color: '#fbbf24', icon: '🏦' },
  energy: { label: 'Energie', color: '#fb923c', icon: '⚡' },
  consumer: { label: 'Spotřební zboží', color: '#a78bfa', icon: '🛍️' },
  industrial: { label: 'Průmysl', color: '#f472b6', icon: '🏭' },
  realestate: { label: 'Nemovitosti', color: '#2dd4bf', icon: '🏠' },
  communication: { label: 'Komunikace', color: '#818cf8', icon: '📡' },
  materials: { label: 'Materiály', color: '#a3e635', icon: '🧱' },
  utilities: { label: 'Utility', color: '#67e8f9', icon: '💡' },
  other: { label: 'Ostatní', color: '#94a3b8', icon: '📊' },
};

export const CURRENCIES = ['USD', 'EUR', 'CZK', 'GBP'] as const;

export function formatCurrency(value: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Simulace pohybu ceny - realistický random walk
export function simulatePriceChange(currentPrice: number): number {
  const volatility = 0.015; // 1.5% denní volatilita
  const drift = 0.0002;     // mírný pozitivní drift
  const change = drift + volatility * (Math.random() * 2 - 1);
  return Math.max(0.01, currentPrice * (1 + change));
}

// Generování historických dat
export function generatePriceHistory(
  currentPrice: number,
  days: number = 90
): PricePoint[] {
  const history: PricePoint[] = [];
  let price = currentPrice * (0.85 + Math.random() * 0.3); // začít +-15% od současné ceny

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
    if (i > 0) {
      price = simulatePriceChange(price);
    }
  }

  // Poslední cena = aktuální cena
  history[history.length - 1].price = currentPrice;

  return history;
}

// Výchozí demo data
export const DEMO_STOCKS: Stock[] = [
  {
    id: generateId(),
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: 15,
    avgPrice: 178.50,
    currentPrice: 195.20,
    sector: 'technology',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-01-15',
  },
  {
    id: generateId(),
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 10,
    avgPrice: 380.00,
    currentPrice: 425.50,
    sector: 'technology',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-02-01',
  },
  {
    id: generateId(),
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    shares: 8,
    avgPrice: 480.00,
    currentPrice: 875.30,
    sector: 'technology',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-03-10',
  },
  {
    id: generateId(),
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    shares: 20,
    avgPrice: 155.00,
    currentPrice: 162.40,
    sector: 'healthcare',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-01-20',
  },
  {
    id: generateId(),
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    shares: 12,
    avgPrice: 170.00,
    currentPrice: 198.75,
    sector: 'finance',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-04-05',
  },
  {
    id: generateId(),
    ticker: 'XOM',
    name: 'ExxonMobil',
    shares: 25,
    avgPrice: 98.00,
    currentPrice: 108.50,
    sector: 'energy',
    currency: 'USD',
    priceHistory: [],
    dateAdded: '2024-02-15',
  },
];

// Inicializace demo dat s historickými cenami
export function initializeDemoStocks(): Stock[] {
  return DEMO_STOCKS.map(stock => ({
    ...stock,
    priceHistory: generatePriceHistory(stock.currentPrice),
  }));
}
