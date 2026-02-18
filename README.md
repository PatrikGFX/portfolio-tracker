# 📈 Portfolio Tracker

Profesionální akciový portfolio tracker s tmavým designem, live grafy a sektorovou analýzou.

## ✨ Funkce

- **Sledování akcií** – zadejte ticker, název, počet kusů, nákupní cenu a aktuální cenu
- **Automatické změny cen** – ceny se simulovaně mění každých 5 sekund
- **Interaktivní grafy** – vývoj celkové hodnoty portfolia v čase s přepínáním období
- **Sektorové rozložení** – koláčový graf s breakdown jednotlivých sektorů
- **Top performeři** – přehled nejlepších a nejhorších pozic
- **Inline editace** – upravujte pozice přímo v tabulce
- **Mini sparkline grafy** – trendové grafy u každé akcie
- **Lokální ukládání** – data se ukládají do prohlížeče (localStorage)
- **Responzivní design** – funguje na mobilu, tabletu i desktopu

## 🚀 Nasazení na Vercel

### Krok 1: Nahrání na GitHub

```bash
# Naklonujte si repo nebo vytvořte nové na GitHubu, pak:
cd portfolio-tracker
git init
git add .
git commit -m "Initial commit: Portfolio Tracker"
git branch -M main
git remote add origin https://github.com/VASE-JMENO/portfolio-tracker.git
git push -u origin main
```

### Krok 2: Propojení s Vercel

1. Přejděte na [vercel.com](https://vercel.com)
2. Klikněte **"Add New Project"**
3. Vyberte svůj GitHub repozitář `portfolio-tracker`
4. Framework bude automaticky detekován jako **Next.js**
5. Klikněte **"Deploy"**
6. Hotovo! Za ~60 sekund máte live web.

### Krok 3 (volitelné): Vlastní doména

V Vercel dashboardu → Settings → Domains → přidejte svou doménu.

## 🛠️ Lokální vývoj

```bash
npm install
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## 📁 Struktura projektu

```
portfolio-tracker/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Hlavní stránka
│   │   └── globals.css       # Globální styly
│   ├── components/
│   │   ├── StatsCards.tsx     # Přehledové karty
│   │   ├── PortfolioChart.tsx # Hlavní graf portfolia
│   │   ├── SectorChart.tsx    # Sektorový pie chart
│   │   ├── StockTable.tsx     # Tabulka akcií
│   │   ├── MiniChart.tsx      # Mini sparkline
│   │   ├── AddStockForm.tsx   # Formulář přidání akcie
│   │   └── TopPerformers.tsx  # Top/worst performers
│   └── lib/
│       ├── types.ts           # Typy, utility, konstanty
│       └── usePortfolio.ts    # Hlavní state management hook
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🎨 Technologie

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (grafy)
- **Lucide React** (ikony)
