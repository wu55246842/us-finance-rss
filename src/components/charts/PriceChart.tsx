'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { getPriceHistory, PriceBar } from '@/lib/api/market';

interface PriceChartProps {
    ticker: string;
}

// Helper: Calculate SMA
function calculateSMA(data: PriceBar[], period: number) {
    const smaData = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            continue; // Not enough data
        }
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        const avg = sum / period;
        smaData.push({ time: data[i].date.split('T')[0], value: avg });
    }
    return smaData;
}

// Helper: Calculate RSI
function calculateRSI(data: PriceBar[], period: number = 14) {
    const rsiData = [];
    if (data.length < period + 1) return [];

    let gains = 0;
    let losses = 0;

    // Initial average
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // First RSI
    let rs = avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));
    rsiData.push({ time: data[period].date.split('T')[0], value: rsi });

    // Subsequent RSIs
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        if (avgLoss === 0) {
            rsi = 100;
        } else {
            rs = avgGain / avgLoss;
            rsi = 100 - (100 / (1 + rs));
        }
        rsiData.push({ time: data[i].date.split('T')[0], value: rsi });
    }
    return rsiData;
}

export function PriceChart({ ticker }: PriceChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);

    const [isDark, setIsDark] = useState(false);
    const [data, setData] = useState<PriceBar[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch data
    useEffect(() => {
        let mounted = true;
        async function fetchHistory() {
            if (!ticker) return;
            setLoading(true);
            try {
                // Fetch ~5 years of data
                const history = await getPriceHistory(ticker, 1500);
                if (mounted && history.length > 0) {
                    setData(history);
                }
            } catch (e) {
                console.error("Failed to load price history", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchHistory();
        return () => { mounted = false; };
    }, [ticker]);

    // Detect dark mode
    useEffect(() => {
        const checkDark = () => document.documentElement.classList.contains('dark');
        setIsDark(checkDark());

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    setIsDark(checkDark());
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Render Charts
    useEffect(() => {
        if (!chartContainerRef.current || !rsiContainerRef.current) return;
        if (data.length === 0) return;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (rsiContainerRef.current && rsiChartRef.current) {
                rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
        };

        const chartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#d1d5db' : '#374151',
            },
            grid: {
                vertLines: { color: isDark ? '#334155' : '#e5e7eb' },
                horzLines: { color: isDark ? '#334155' : '#e5e7eb' },
            },
            timeScale: {
                visible: true,
                timeVisible: true,
                borderColor: isDark ? '#334155' : '#e5e7eb',
            },
        };

        // --- MAIN CHART ---
        const chart = createChart(chartContainerRef.current, {
            ...chartOptions,
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });
        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        const sma10Series = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, title: 'SMA 10' });
        const sma50Series = chart.addLineSeries({ color: '#f97316', lineWidth: 1, title: 'SMA 50' });
        const sma200Series = chart.addLineSeries({ color: '#8b5cf6', lineWidth: 1, title: 'SMA 200' });

        const chartData = data.map(item => ({
            time: item.date.split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));
        candlestickSeries.setData(chartData as any);
        sma10Series.setData(calculateSMA(data, 10) as any);
        sma50Series.setData(calculateSMA(data, 50) as any);
        sma200Series.setData(calculateSMA(data, 200) as any);


        // --- RSI CHART ---
        const rsiChart = createChart(rsiContainerRef.current, {
            ...chartOptions,
            width: rsiContainerRef.current.clientWidth,
            height: 100,
            rightPriceScale: {
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
        });
        rsiChartRef.current = rsiChart;

        const rsiSeries = rsiChart.addLineSeries({
            color: '#d946ef',
            lineWidth: 1,
            title: 'RSI 14'
        });
        rsiSeries.setData(calculateRSI(data, 14) as any);

        // Add 70/30 lines
        const rsiOverbought = rsiChart.addLineSeries({ color: '#9ca3af', lineWidth: 1, lineStyle: 2, title: '70' });
        const rsiOversold = rsiChart.addLineSeries({ color: '#9ca3af', lineWidth: 1, lineStyle: 2, title: '30' });

        const rsiBaseData = data.map(d => ({ time: d.date.split('T')[0] }));
        rsiOverbought.setData(rsiBaseData.map(d => ({ ...d, value: 70 })) as any);
        rsiOversold.setData(rsiBaseData.map(d => ({ ...d, value: 30 })) as any);
        rsiOversold.setData(rsiBaseData.map(d => ({ ...d, value: 30 })) as any);


        // --- SYNC ---
        chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            if (range) rsiChart.timeScale().setVisibleLogicalRange(range);
        });
        rsiChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            if (range) chart.timeScale().setVisibleLogicalRange(range);
        });


        chart.timeScale().fitContent();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            rsiChart.remove();
        };
    }, [data, isDark]);

    return (
        <div className="w-full bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2 relative min-h-[450px]">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-semibold text-lg">{ticker} Price Action</h3>
                <div className="flex gap-4 text-xs">
                    <span className="text-blue-500 font-medium">SMA 10</span>
                    <span className="text-orange-500 font-medium">SMA 50</span>
                    <span className="text-purple-500 font-medium">SMA 200</span>
                    <span className="text-fuchsia-500 font-medium">RSI 14</span>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                        <span className="font-medium">Loading historical data...</span>
                    </div>
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <span className="text-muted-foreground">No data available</span>
                </div>
            )}

            <div ref={chartContainerRef} className="w-full h-[300px]" />
            <div ref={rsiContainerRef} className="w-full h-[100px]" />
        </div>
    );
}
