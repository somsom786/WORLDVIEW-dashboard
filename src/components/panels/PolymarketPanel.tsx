import { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, MapPin } from 'lucide-react';
import { useSelectedLocation, useWorldStore } from '../../store/worldState';

interface PolymarketEvent {
    id: string;
    title: string;
    slug: string;
    markets: Array<{
        id: string;
        question: string;
        outcomePrices: string;
        volume: string;
        liquidity: string;
    }>;
    volume: number;
    liquidity: number;
}

interface MarketCardProps {
    title: string;
    yesPrice: number;
    noPrice: number;
    volume: number;
    liquidity: number;
}

// Financial Terminal Probability Line
function ProbabilityLine({ yesPrice }: { yesPrice: number }) {
    const yesPercent = Math.round(yesPrice * 100);


    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{
                flex: 1,
                height: '4px',
                background: '#374151',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${yesPercent}%`,
                    background: yesPercent > 50 ? '#10B981' : '#EF4444', // Green if high prob, Red if low (visual indicator)
                }} />
            </div>
            <div style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: yesPercent > 50 ? '#10B981' : '#EF4444',
                minWidth: '40px',
                textAlign: 'right'
            }}>
                {yesPercent}%
            </div>
        </div>
    );
}

// Single Market Row (Terminal Style)
function MarketRow({ title, yesPrice, volume }: MarketCardProps) {
    const formatVolume = (vol: number) => {
        if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
        if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
        return `${vol.toFixed(0)}`;
    };

    return (
        <div style={{
            padding: '8px 0',
            borderBottom: '1px solid #374151'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                alignItems: 'baseline'
            }}>
                <div style={{
                    fontFamily: 'Inter',
                    fontSize: '0.7rem',
                    color: '#E5E7EB',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                    fontWeight: 500
                }} title={title}>
                    {title}
                </div>
                <div style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.6rem',
                    color: '#9CA3AF'
                }}>
                    VOL {formatVolume(volume)}
                </div>
            </div>

            <ProbabilityLine yesPrice={yesPrice} />
        </div>
    );
}

// Main Panel Component
export function PolymarketPanel() {
    const selectedLocation = useSelectedLocation();
    const clearSelectedLocation = useWorldStore((state) => state.setSelectedLocation);

    const [markets, setMarkets] = useState<MarketCardProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    async function fetchPolymarketData() {
        setLoading(true);
        try {
            // Determine query based on selection or default
            const query = selectedLocation
                ? `events?closed=false&limit=15&order=volume&ascending=false&q=${encodeURIComponent(selectedLocation)}`
                : 'events?closed=false&limit=15&order=volume&ascending=false&tag_id=1'; // Tag 1 is generally politics/macro

            const response = await fetch(`/api/polymarket/${query}`);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data: PolymarketEvent[] = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                // If specific search fails, fall back to global
                if (selectedLocation) {
                    console.warn(`No markets for ${selectedLocation}, falling back to global`);
                    // Retry with global if specific location has no markets
                    const fallbackResponse = await fetch('/api/polymarket/events?closed=false&limit=15&order=volume&ascending=false');
                    const fallbackData = await fallbackResponse.json();
                    processData(fallbackData, true); // Process with "no results" warning
                    return;
                }
                throw new Error('No markets available');
            }

            processData(data, false);
        } catch (err) {
            console.warn('Polymarket fetch error:', err);
            setError('DATA LINK OFFLINE');
        } finally {
            setLoading(false);
        }
    }

    // Helper to process and set data
    const processData = (data: PolymarketEvent[], isFallback: boolean) => {
        const parsedMarkets: MarketCardProps[] = [];

        for (const event of data) {
            if (event.markets && event.markets.length > 0) {
                const market = event.markets[0];
                try {
                    let prices: number[] = [0.5, 0.5];
                    if (market.outcomePrices) {
                        if (typeof market.outcomePrices === 'string') {
                            const parsed = JSON.parse(market.outcomePrices);
                            prices = parsed.map((p: string) => parseFloat(p));
                        }
                    }
                    // Filter low volume noise
                    const vol = parseFloat(market.volume) || event.volume || 0;
                    if (vol < 1000) continue;

                    parsedMarkets.push({
                        title: event.title || market.question || 'Unknown Market',
                        yesPrice: prices[0] || 0.5,
                        noPrice: prices[1] || 0.5,
                        volume: vol,
                        liquidity: parseFloat(market.liquidity) || event.liquidity || 0,
                    });
                } catch { continue; }
            }
            if (parsedMarkets.length >= 10) break;
        }

        setMarkets(parsedMarkets);
        setError(isFallback && selectedLocation ? `NO MARKETS FOR "${selectedLocation.toUpperCase()}"` : null);

    };

    useEffect(() => {
        fetchPolymarketData();
    }, [selectedLocation]); // Refetch when location changes

    return (
        <div className="panel" style={{
            gridColumn: 3,
            gridRow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #1F2937'
        }}>
            {/* Bloomberg Header */}
            <div style={{
                padding: '8px 12px',
                background: '#111827',
                borderBottom: '2px solid #F59E0B',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} color="#F59E0B" />
                    <span style={{
                        fontFamily: 'Playfair Display',
                        fontWeight: 700,
                        color: '#F59E0B',
                        fontSize: '0.9rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        MARKET TERMINAL
                    </span>
                </div>

                {/* Location Badge */}
                {selectedLocation && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        cursor: 'pointer'
                    }} onClick={() => clearSelectedLocation(null)}>
                        <MapPin size={10} color="#F59E0B" />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#F59E0B' }}>
                            {selectedLocation.toUpperCase()} [X]
                        </span>
                    </div>
                )}
            </div>

            {/* Sub-header / Status */}
            <div style={{
                padding: '4px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #374151',
                background: '#030712'
            }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#6B7280' }}>
                    SOURCE: POLYMARKET (GAMMA)
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#10B981' }}>
                    ● LIVE
                </span>
            </div>

            {/* List */}
            <div className="panel-content" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 12px',
                fontFamily: 'Inter',
                background: 'linear-gradient(180deg, rgba(17,24,39,0.5) 0%, rgba(0,0,0,0.8) 100%)'
            }}>
                {loading ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#F59E0B',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.7rem',
                        animation: 'pulse 1s infinite'
                    }}>
                        [ ACCESSING DATA STREAM... ]
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={{
                                padding: '8px',
                                margin: '8px 0',
                                border: '1px solid #EF4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#FCA5A5',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '0.6rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}
                        {markets.map((market, i) => (
                            <MarketRow key={i} {...market} />
                        ))}
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div style={{
                padding: '8px',
                borderTop: '1px solid #374151',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={() => fetchPolymarketData()}
                    style={{
                        background: 'transparent',
                        border: '1px solid #374151',
                        color: '#9CA3AF',
                        padding: '4px 8px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.6rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <RefreshCw size={10} /> REFRESH
                </button>
            </div>
        </div>
    );
}


