import { NextRequest, NextResponse } from 'next/server';

// Yahoo Finance API proxy
// Fetches real-time quote + historical chart data
export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker');
  const type = request.nextUrl.searchParams.get('type') || 'quote'; // quote | chart

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker je povinný' }, { status: 400 });
  }

  try {
    if (type === 'chart') {
      // Historical data - 6 months
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=6mo&interval=1d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 }, // cache 5 min
      });

      if (!res.ok) throw new Error(`Yahoo API error: ${res.status}`);
      const data = await res.json();
      const result = data.chart?.result?.[0];

      if (!result) {
        return NextResponse.json({ error: 'Ticker nenalezen' }, { status: 404 });
      }

      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];

      const history = timestamps.map((t: number, i: number) => ({
        date: new Date(t * 1000).toISOString().split('T')[0],
        price: closes[i] ? Math.round(closes[i] * 100) / 100 : null,
      })).filter((p: any) => p.price !== null);

      return NextResponse.json({ ticker, history });
    }

    // Quote data
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 30 }, // cache 30s
    });

    if (!res.ok) throw new Error(`Yahoo API error: ${res.status}`);
    const data = await res.json();
    const quote = data.quoteResponse?.result?.[0];

    if (!quote) {
      return NextResponse.json({ error: 'Ticker nenalezen' }, { status: 404 });
    }

    return NextResponse.json({
      ticker: quote.symbol,
      name: quote.shortName || quote.longName || ticker,
      currentPrice: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      openPrice: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      dayChange: quote.regularMarketChange,
      dayChangePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      currency: quote.currency || 'USD',
    });
  } catch (error: any) {
    console.error('Stock API error:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst data. Zkontrolujte ticker.' },
      { status: 500 }
    );
  }
}
