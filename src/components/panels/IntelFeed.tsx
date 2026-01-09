// ============================================
// INTEL WIRE - HIGH DENSITY NEWS TERMINAL
// Bloomberg-style scrolling feed with timestamps
// ============================================

import { useEvents, useFilters, useWorldStore } from '../../store/worldState';
import type { WorldEvent, EventType } from '../../types';
import { useTreeOfAlpha } from '../../hooks/useTreeOfAlpha';

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function getImpactLevel(severity: number): 'high' | 'medium' | 'low' {
    if (severity >= 7) return 'high';
    if (severity >= 4) return 'medium';
    return 'low';
}

// Wire Item Component - Dense format
function WireItem({ event, onClick }: { event: WorldEvent; onClick?: () => void }) {
    const impact = getImpactLevel(event.severity);

    return (
        <div className="intel-wire-item" onClick={onClick}>
            <div className="intel-wire-time">
                {formatTime(event.timestamp)}
            </div>
            <div className="intel-wire-content">
                <div className="intel-wire-source">
                    [{event.source}]
                </div>
                <div className="intel-wire-headline">
                    {event.title}
                </div>
                <span className={`intel-wire-tag ${impact}`}>
                    {impact} impact
                </span>
            </div>
        </div>
    );
}



export function IntelFeed() {
    const events = useEvents();
    const filters = useFilters();
    const setFocusedEvent = useWorldStore((state) => state.setFocusedEvent);
    const { news: treeNews } = useTreeOfAlpha();

    // Convert Tree News to WorldEvent format for display
    const streamingEvents: WorldEvent[] = treeNews.map(news => ({
        id: `tree-${news.id}`,
        type: 'economy', // Default to economy for crypto stream
        title: news.title,
        summary: news.title,
        severity: 5,
        lat: 0,
        lng: 0,
        source: news.source,
        timestamp: new Date(news.time),
        confidence: 'verified',
        url: '#'
    }));

    // Merge standard events with streaming news
    const allEvents = [...streamingEvents, ...events];

    const filteredEvents = allEvents.filter((event) => {
        const typeMap: Record<EventType, keyof typeof filters> = {
            conflict: 'conflict',
            weather: 'weather',
            economy: 'economy',
            politics: 'politics',
        };
        return filters[typeMap[event.type]];
    });

    const handleEventClick = (event: WorldEvent) => {
        setFocusedEvent(event);
    };

    // Sort by timestamp, most recent first
    const sortedEvents = [...filteredEvents].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return (
        <div className="panel" style={{ gridColumn: 1, gridRow: 1 }}>
            <div className="panel-header">
                <span className="panel-title" style={{ fontFamily: 'var(--font-serif)' }}>
                    ⚡ Intel Wire
                </span>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)'
                }}>
                    {treeNews.length > 0 ? 'LIVE STREAMING' : 'CONNECTING...'} | {filteredEvents.length} ITEMS
                </span>
            </div>

            <div className="panel-content" style={{ padding: 0 }}>
                {sortedEvents.length === 0 ? (
                    <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem'
                    }}>
                        No events match current filters
                    </div>
                ) : (
                    sortedEvents.slice(0, 100).map((event) => (
                        <WireItem
                            key={event.id}
                            event={event}
                            onClick={() => handleEventClick(event)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
