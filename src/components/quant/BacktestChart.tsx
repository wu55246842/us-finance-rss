'use client';

import {
    createChart,
    ColorType,
    ISeriesApi,
    IChartApi,
    LineStyle,
    LineWidth,
} from 'lightweight-charts';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';


// Compatible for v4 (number) and v5 (LineWidth union)
type AnyLineWidth = number;
type AnyLineStyle = number;

function toLineWidth(v?: number): AnyLineWidth {
    // v5 通常是 1|2|3|4，v4 是 number。这里兼容两者
    const n = v ?? 1;
    if (!Number.isFinite(n)) return 1;
    if (n <= 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    return 4;
}

function toLineStyle(v?: number): AnyLineStyle {
    // LineStyle 在 v4/v5 都是数字枚举语义
    const n = v ?? 0;
    return Number.isFinite(n) ? n : 0;
}


export interface OverlayData {
    name: string;
    type: 'Line' | 'Histogram' | 'Area';
    data: { time: string; value: number }[];
    color?: string;
    lineWidth?: LineWidth;     // ✅ 用库类型
    style?: LineStyle;         // ✅ 用库类型
}


export interface PaneData {
    id: string;
    series: OverlayData[];
    height?: number;
}

interface ChartProps {
    symbol?: string;
    markers?: Array<{ time: string, position: 'aboveBar' | 'belowBar', color: string, shape: 'arrowUp' | 'arrowDown', text: string }>;
    overlays?: OverlayData[]; // Traces to plot on Main Chart (Price)
    panes?: PaneData[];       // Traces to plot on separate panes below
}

export function BacktestChart({ symbol = '^GSPC', markers = [], overlays = [], panes = [], data = [] }: ChartProps & { data?: any[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRefs = useRef<IChartApi[]>([]);

    // We rely on parent state for data status
    // const [loading, setLoading] = useState(true);
    // const [data, setData] = useState<any[]>([]);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // Fetch Base Data
    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         try {
    //             const res = await fetch(`/api/market/history?symbol=${encodeURIComponent(symbol)}&range=2y`);
    //             if (!res.ok) throw new Error('Failed to fetch history');
    //             const json = await res.json();
    //             const sorted = json.sort((a: any, b: any) =>
    //                 new Date(a.time).getTime() - new Date(b.time).getTime()
    //             );
    //             setData(sorted);
    //         } catch (e) {
    //             console.error("V5 Chart fetch error:", e);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, [symbol]);

    // Initialize & Sync Charts
    useEffect(() => {
        if (!containerRef.current || data.length === 0) return;

        // Clear previous charts
        containerRef.current.innerHTML = '';
        chartRefs.current = [];

        const commonOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            }
        };

        // 1. Create Main Chart
        const mainDiv = document.createElement('div');
        mainDiv.style.flex = '1';
        mainDiv.style.width = '100%';
        mainDiv.style.minHeight = '300px';
        containerRef.current.appendChild(mainDiv);

        const mainChart = createChart(mainDiv, {
            ...commonOptions,
            width: mainDiv.clientWidth,
            height: 300,
        });
        chartRefs.current.push(mainChart);

        // Price Series
        const candleSeries = mainChart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        candleSeries.setData(data);
        candlestickSeriesRef.current = candleSeries;

        // Render Overlays (SMA, BB, etc on Price)
        overlays.forEach(ov => {
            const line = mainChart.addLineSeries({
                color: ov.color || '#2962FF',
                lineWidth: toLineWidth(ov.lineWidth) as any,
                lineStyle: toLineStyle(ov.style) as any,
                title: ov.name,

            });

            line.setData(ov.data);
        });

        // 2. Create Panes (RSI, MACD)
        panes.forEach(pane => {
            const paneDiv = document.createElement('div');
            paneDiv.style.height = '150px';
            paneDiv.style.width = '100%';
            paneDiv.style.borderTop = '1px solid rgba(42, 46, 57, 0.2)';
            containerRef.current?.appendChild(paneDiv);

            const paneChart = createChart(paneDiv, {
                ...commonOptions,
                width: paneDiv.clientWidth,
                height: 150,
            });
            chartRefs.current.push(paneChart);

            pane.series.forEach(s => {
                if (s.type === 'Histogram') {
                    const series = paneChart.addHistogramSeries({
                        color: s.color || '#26a69a',
                        title: s.name,
                    });
                    series.setData(s.data as any);
                } else {
                    const series = paneChart.addLineSeries({
                        color: s.color || '#d946ef',
                        lineWidth: toLineWidth(s.lineWidth) as any,
                        lineStyle: toLineStyle(s.style) as any,
                        title: s.name,

                    });

                    series.setData(s.data);
                }
            });

            // Add baseline for RSI (30/70) if needed
            // (Logic simplified for generic pane)
        });

        // 3. Sync Time Scales
        const charts = chartRefs.current;
        charts.forEach((c1, i) => {
            c1.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                if (range) {
                    charts.forEach((c2, j) => {
                        if (i !== j) c2.timeScale().setVisibleLogicalRange(range);
                    });
                }
            });
        });

        mainChart.timeScale().fitContent();

        // 4. Resize Handler
        const handleResize = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                charts.forEach(c => c.applyOptions({ width: w }));
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            charts.forEach(c => c.remove());
        };
    }, [data, overlays, panes]); // Re-render whole stack on config change

    // Markers update
    useEffect(() => {
        if (candlestickSeriesRef.current && markers) {
            candlestickSeriesRef.current.setMarkers(markers as any[]);
        }
    }, [markers]);

    return (
        <div className="relative w-full bg-card border border-border rounded-xl px-4 py-2 overflow-hidden shadow-sm flex flex-col items-center justify-center">
            <div className="absolute top-2 left-4 z-10 text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span>{symbol === '^GSPC' ? 'S&P 500' : symbol} ({new Date().getFullYear()})</span>
                {/* {loading && <Loader2 className="animate-spin h-3 w-3" />} */}
            </div>

            {/* Charts Container */}
            <div ref={containerRef} className="w-full flex-col flex" />

            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-0">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            )}
        </div>
    );
}
