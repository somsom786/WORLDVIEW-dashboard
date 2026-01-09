// ============================================
// PANIC BAR - FOOTER COMPONENT
// Market ticker + DEFCON meter
// ============================================

import { useMarkets, useDefconLevel, useWorldStore } from '../../store/worldState';
import type { MarketData } from '../../types';


function DefconMeter() {
    const defconLevel = useDefconLevel();

    const defconLabels = {
        1: 'COCKED PISTOL',
        2: 'FAST PACE',
        3: 'ROUND HOUSE',
        4: 'DOUBLE TAKE',
        5: 'FADE OUT',
    };

    return (
        <div className="defcon-meter">
            <span className="defcon-label">DEFCON</span>
            <span className={`defcon-value defcon-${defconLevel}`}>
                {defconLevel}
            </span>
            <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '0.5rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                maxWidth: '80px'
            }}>
                {defconLabels[defconLevel]}
            </span>
        </div>
    );
}

function TickerItem({ market }: { market: MarketData }) {
    const isPositive = market.change24h >= 0;

    return (
        <div className="ticker-item">
            <span className="ticker-symbol">{market.symbol}</span>
            <span className="ticker-price">
                ${market.price.toLocaleString(undefined, {
                    minimumFractionDigits: market.price < 10 ? 2 : 0,
                    maximumFractionDigits: market.price < 10 ? 2 : 0
                })}
            </span>
            <span className={`ticker-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(market.change24h).toFixed(2)}%
            </span>
        </div>
    );
}

function MarketTicker() {
    const markets = useMarkets();

    // Duplicate markets for seamless scrolling
    const duplicatedMarkets = [...markets, ...markets];

    return (
        <div className="ticker-container">
            <div className="ticker-track">
                {duplicatedMarkets.map((market, index) => (
                    <TickerItem key={`${market.symbol}-${index}`} market={market} />
                ))}
            </div>
        </div>
    );
}

function LastUpdated() {
    const lastUpdated = useWorldStore((state) => state.lastUpdated);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderLeft: '1px solid var(--border-subtle)',
            marginRight: '-16px',
            height: '100%',
            background: 'var(--bg-secondary)'
        }}>
            <div className="live-indicator" style={{
                background: 'transparent',
                border: 'none',
                padding: 0
            }}>
                <div className="live-dot" />
                <span className="live-text">LIVE</span>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
            }}>
                <span style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Last Sync
                </span>
                <span style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                }}>
                    {formatTime(lastUpdated)}
                </span>
            </div>
        </div>
    );
}

export function PanicBar() {
    return (
        <footer className="panic-bar">
            <DefconMeter />
            <MarketTicker />
            <LastUpdated />
        </footer>
    );
}
