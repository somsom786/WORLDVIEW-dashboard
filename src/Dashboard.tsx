// ============================================
// GLOBAL MACRO TERMINAL - MAIN LAYOUT
// Bloomberg Terminal meets Editorial Design
// ============================================

import { useSituationData } from './hooks/useSituationData';
import { useIsLoading, useDefconLevel, useEvents } from './store/worldState';
import { CommandMap } from './components/map/CommandMap';
import { IntelFeed } from './components/panels/IntelFeed';
import { PolymarketPanel } from './components/panels/PolymarketPanel';
import { PanicBar } from './components/footer/PanicBar';
import { Activity, Wifi, WifiOff, AlertTriangle, Cloud, TrendingUp } from 'lucide-react';

function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
            }}>
                <div className="loading-spinner" />
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}>
                    Initializing Global Macro Terminal...
                </div>
            </div>
        </div>
    );
}

function GlobalStatusBar() {
    const defconLevel = useDefconLevel();
    const events = useEvents();

    // Calculate risk levels
    const conflictEvents = events.filter(e => e.type === 'conflict' && e.severity >= 6).length;
    const weatherEvents = events.filter(e => e.type === 'weather' && e.severity >= 5).length;

    const getRiskStatus = () => {
        if (defconLevel <= 2) return 'critical';
        if (defconLevel <= 3) return 'warning';
        return 'normal';
    };

    const getWeatherStatus = () => {
        if (weatherEvents >= 3) return 'warning';
        if (weatherEvents >= 1) return 'warning';
        return 'normal';
    };

    return (
        <div className="global-status-bar">
            <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                marginRight: 8
            }}>
                WORLDVIEW
            </div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                padding: '2px 6px',
                background: 'var(--accent-cyan-dim)',
                color: 'var(--accent-cyan)',
                borderRadius: '3px',
            }}>
                v3.0
            </div>

            <div style={{ flex: 1 }} />

            {/* Status Chips */}
            <div className={`status-chip ${getRiskStatus()}`}>
                <AlertTriangle size={10} />
                GLOBAL RISK: {getRiskStatus().toUpperCase()}
            </div>

            <div className={`status-chip ${getWeatherStatus()}`}>
                <Cloud size={10} />
                WEATHER: {weatherEvents > 0 ? 'ACTIVE' : 'NORMAL'}
            </div>

            <div className="status-chip normal">
                <TrendingUp size={10} />
                MKTS: LIVE
            </div>

            {/* Connection Status */}
            <ConnectionIndicator />
        </div>
    );
}

function ConnectionIndicator() {
    const isLoading = useIsLoading();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: isLoading ? 'var(--accent-amber)' : 'var(--accent-green)',
            marginLeft: 8,
        }}>
            {isLoading ? (
                <>
                    <WifiOff size={10} />
                    <span>SYNC</span>
                </>
            ) : (
                <>
                    <Wifi size={10} />
                    <span>LIVE</span>
                </>
            )}
        </div>
    );
}

export default function Dashboard() {
    // Initialize data fetching
    useSituationData();

    const isLoading = useIsLoading();

    return (
        <>
            <GlobalStatusBar />

            <main className="dashboard" style={{ paddingTop: '0' }}>
                {isLoading && <LoadingOverlay />}

                {/* Left Panel - Intel Wire */}
                <IntelFeed />

                {/* Center - Reality Layer Map */}
                <CommandMap />

                {/* Right Panel - Polymarket Intelligence */}
                <PolymarketPanel />

                {/* Footer - Market Ticker */}
                <PanicBar />
            </main>
        </>
    );
}
