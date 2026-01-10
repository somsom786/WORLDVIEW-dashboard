// ============================================
// REALITY LAYER MAP - GLOBAL MACRO TERMINAL
// Professional satellite-style dark map
// ============================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useEvents, useFilters, usePredictions, useWorldStore } from '../../store/worldState';
import type { WorldEvent, EventType, PredictionMarket } from '../../types';
import { Crosshair, Target, TrendingUp } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

// Professional dark satellite-style map (Stadia Alidade Smooth Dark - free tier)
// Alternative: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';

const INITIAL_VIEW = {
    longitude: 20,
    latitude: 25,
    zoom: 2.2,
    pitch: 0,
    bearing: 0,
};

// Event type to color mapping - Bloomberg style
const typeColors: Record<EventType, string> = {
    conflict: '#EF4444',    // Red
    weather: '#06B6D4',     // Cyan
    economy: '#10B981',     // Green
    politics: '#F59E0B',    // Amber
};

// Severity to size mapping
function getSeveritySize(severity: number): number {
    return 10 + severity * 1.5;
}

// Event Marker Component - Professional dot with glow
function EventMarker({
    event,
    onClick,
    isSelected
}: {
    event: WorldEvent;
    onClick: () => void;
    isSelected: boolean;
}) {
    const size = getSeveritySize(event.severity);
    const color = typeColors[event.type];

    return (
        <Marker
            longitude={event.lng}
            latitude={event.lat}
            anchor="center"
            onClick={(e) => {
                e.originalEvent.stopPropagation();
                onClick();
            }}
        >
            {/* Outer glow ring */}
            <div style={{
                position: 'absolute',
                width: size * 2.5,
                height: size * 2.5,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                animation: event.severity >= 7 ? 'pulse-glow 2s ease-in-out infinite' : 'none',
            }} />
            {/* Inner marker dot */}
            <div
                style={{
                    position: 'relative',
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: isSelected ? '2px solid #FFFFFF' : `1px solid ${color}`,
                    boxShadow: `0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}40`,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    zIndex: isSelected ? 100 : event.severity,
                }}
                className="event-marker"
            />
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                    50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.3; }
                }
                .event-marker:hover {
                    transform: scale(1.3);
                    box-shadow: 0 0 20px currentColor !important;
                }
            `}</style>
        </Marker>
    );
}

// Prediction Market Marker
function PredictionMarker({ prediction }: { prediction: PredictionMarket }) {
    if (!prediction.lat || !prediction.lng) return null;

    const probability = Math.round(prediction.probability * 100);

    return (
        <Marker
            longitude={prediction.lng}
            latitude={prediction.lat}
            anchor="bottom"
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                pointerEvents: 'none',
            }}>
                <div style={{
                    background: 'rgba(157, 78, 221, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    boxShadow: '0 0 10px rgba(157, 78, 221, 0.5)',
                }}>
                    {probability}%
                </div>
                <Target size={12} color="#9D4EDD" />
            </div>
        </Marker>
    );
}

// Filter Bar Component
function FilterBar() {
    const filters = useFilters();
    const toggleFilter = useWorldStore((state) => state.toggleFilter);

    const filterItems: Array<{ key: keyof typeof filters; label: string; icon: string }> = [
        { key: 'conflict', label: 'CONFLICT', icon: '⚔️' },
        { key: 'weather', label: 'WEATHER', icon: '🌪️' },
        { key: 'economy', label: 'ECONOMY', icon: '📈' },
        { key: 'politics', label: 'POLITICS', icon: '🏛️' },
    ];

    return (
        <div className="filter-bar">
            {filterItems.map(({ key, label, icon }) => (
                <button
                    key={key}
                    className={`filter-btn ${key} ${filters[key] ? 'active' : ''}`}
                    onClick={() => toggleFilter(key)}
                >
                    <span>{icon}</span>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}

// Live Indicator
function LiveIndicator() {
    return (
        <div className="live-indicator">
            <div className="live-dot" />
            <span className="live-text">LIVE</span>
        </div>
    );
}

// Event Popup
function EventPopup({
    event,
    onClose
}: {
    event: WorldEvent;
    onClose: () => void;
}) {
    return (
        <Popup
            longitude={event.lng}
            latitude={event.lat}
            anchor="bottom"
            onClose={onClose}
            closeOnClick={false}
            style={{ maxWidth: '300px' }}
        >
            <div style={{
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: '6px',
                border: `2px solid ${typeColors[event.type]}`,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                }}>
                    <span
                        className={`event-type-badge ${event.type}`}
                        style={{ fontSize: '0.6rem' }}
                    >
                        {event.type}
                    </span>
                    <span style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                    }}>
                        SEV {event.severity}
                    </span>
                </div>

                <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                }}>
                    {event.title}
                </h4>

                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                }}>
                    {event.summary}
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                }}>
                    <span>{event.source}</span>
                    <span className={`confidence-badge ${event.confidence}`}>
                        {event.confidence}
                    </span>
                </div>
            </div>
        </Popup>
    );
}

// Coordinate Display
function CoordinateDisplay({ lng, lat }: { lng: number; lat: number }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-medium)',
            pointerEvents: 'auto',
        }}>
            <Crosshair size={12} color="var(--accent-tech)" />
            <span>{lat.toFixed(4)}°</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span>{lng.toFixed(4)}°</span>
        </div>
    );
}

// Stats Display
function MapStats({ eventCount }: { eventCount: number }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.65rem',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-medium)',
            pointerEvents: 'auto',
        }}>
            <TrendingUp size={12} color="var(--accent-money)" />
            <span style={{ color: 'var(--text-secondary)' }}>
                {eventCount} active events
            </span>
        </div>
    );
}

// Polymarket Map Popup - Shows betting markets for clicked country
interface PopupMarketItem {
    title: string;
    yesPrice: number;
    volume: number;
}

function PolymarketMapPopup({
    lngLat,
    country,
    markets,
    loading,
    error,
    onClose
}: {
    lngLat: { lng: number; lat: number };
    country: string;
    markets: PopupMarketItem[];
    loading: boolean;
    error: string | null;
    onClose: () => void;
}) {
    const formatVol = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v.toFixed(0)}`;

    return (
        <Popup
            longitude={lngLat.lng}
            latitude={lngLat.lat}
            anchor="top"
            onClose={onClose}
            closeOnClick={false}
            style={{ maxWidth: '320px' }}
        >
            <div style={{
                background: '#0f172a',
                padding: '12px',
                borderRadius: '6px',
                border: '2px solid #F59E0B',
                minWidth: '280px',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    borderBottom: '1px solid #334155',
                    paddingBottom: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <TrendingUp size={14} color="#F59E0B" />
                        <span style={{
                            fontFamily: 'Playfair Display',
                            fontWeight: 700,
                            color: '#F59E0B',
                            fontSize: '0.85rem',
                        }}>
                            {country.toUpperCase()}
                        </span>
                    </div>
                    <span style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.55rem',
                        color: '#10B981'
                    }}>
                        POLYMARKET
                    </span>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#F59E0B',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.65rem'
                    }}>
                        FETCHING MARKETS...
                    </div>
                ) : error ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        color: '#FCA5A5',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '0.6rem',
                        border: '1px dashed #EF4444',
                        background: 'rgba(239, 68, 68, 0.1)'
                    }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {markets.map((m, i) => {
                            const pct = Math.round(m.yesPrice * 100);
                            return (
                                <div key={i} style={{
                                    borderBottom: i < markets.length - 1 ? '1px solid #1e293b' : 'none',
                                    paddingBottom: '6px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '3px'
                                    }}>
                                        <span style={{
                                            fontFamily: 'Inter',
                                            fontSize: '0.65rem',
                                            color: '#E5E7EB',
                                            maxWidth: '200px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={m.title}>
                                            {m.title}
                                        </span>
                                        <span style={{
                                            fontFamily: 'JetBrains Mono',
                                            fontSize: '0.55rem',
                                            color: '#6B7280'
                                        }}>
                                            ${formatVol(m.volume)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            flex: 1,
                                            height: '3px',
                                            background: '#374151',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: pct > 50 ? '#10B981' : '#EF4444'
                                            }} />
                                        </div>
                                        <span style={{
                                            fontFamily: 'JetBrains Mono',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: pct > 50 ? '#10B981' : '#EF4444',
                                            minWidth: '32px',
                                            textAlign: 'right'
                                        }}>
                                            {pct}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Popup>
    );
}

// Main Command Map Component
export function CommandMap() {
    const events = useEvents();
    const filters = useFilters();
    const predictions = usePredictions();
    const focusedEvent = useWorldStore((state) => state.focusedEvent);
    const clearFocusedEvent = useWorldStore((state) => state.clearFocusedEvent);

    const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);
    const [viewState, setViewState] = useState(INITIAL_VIEW);
    const [cursor, setCursor] = useState({ lng: 0, lat: 0 });
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Polymarket Popup State
    interface PopupMarket {
        title: string;
        yesPrice: number;
        volume: number;
    }
    interface PolymarketPopupData {
        lngLat: { lng: number; lat: number };
        country: string;
        markets: PopupMarket[];
        loading: boolean;
        error: string | null;
    }
    const [polymarketPopup, setPolymarketPopup] = useState<PolymarketPopupData | null>(null);

    // Ref to track if we're currently flying (to prevent re-triggering)
    const flyingRef = useRef(false);

    // Filter events based on active filters
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const typeMap: Record<EventType, keyof typeof filters> = {
                conflict: 'conflict',
                weather: 'weather',
                economy: 'economy',
                politics: 'politics',
            };
            return filters[typeMap[event.type]];
        });
    }, [events, filters]);

    // Predictions with coordinates
    const geolocatedPredictions = useMemo(() => {
        return predictions.filter(p => p.lat && p.lng);
    }, [predictions]);

    // Focus Mode: Fly to event when focusedEvent changes
    useEffect(() => {
        if (focusedEvent && !flyingRef.current) {
            flyingRef.current = true;
            setIsFocusMode(true);

            // Animate to the focused event location
            setViewState({
                longitude: focusedEvent.lng,
                latitude: focusedEvent.lat,
                zoom: 5,
                pitch: 0,
                bearing: 0,
            });

            // Set as selected to show popup
            setSelectedEvent(focusedEvent);

            // Reset flying state after animation
            setTimeout(() => {
                flyingRef.current = false;
            }, 1500);
        }
    }, [focusedEvent]);

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, []);

    const handleMouseMove = useCallback((evt: { lngLat: { lng: number; lat: number } }) => {
        setCursor({ lng: evt.lngLat.lng, lat: evt.lngLat.lat });
    }, []);

    const exitFocusMode = useCallback(() => {
        setIsFocusMode(false);
        setSelectedEvent(null);
        clearFocusedEvent();
        // Zoom back out to global view
        setViewState({
            ...INITIAL_VIEW,
            zoom: 1.8,
        });
    }, [clearFocusedEvent]);


    // Interaction: Handle map clicks to select location
    const setSelectedLocation = useWorldStore((state) => state.setSelectedLocation);


    const handleMapClick = useCallback(async (event: any) => {
        const { lng, lat } = event.lngLat;

        // Don't deselect if clicking on a marker (handled by marker click)
        if (event.originalEvent.defaultPrevented) return;

        // Close any existing popup first
        setPolymarketPopup(null);
        setSelectedEvent(null);

        // Visual feedback immediately
        setViewState(prev => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: Math.max(prev.zoom, 4), // Zoom in slightly
            transitionDuration: 800,
        }));

        // Initialize popup with loading state
        setPolymarketPopup({
            lngLat: { lng, lat },
            country: 'Loading...',
            markets: [],
            loading: true,
            error: null,
        });

        try {
            // Step 1: Reverse geocode to get country name
            const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3`,
                { headers: { 'User-Agent': 'WorldviewDashboard/3.0' } }
            );

            if (!geoResponse.ok) throw new Error('Geocoding failed');

            const geoData = await geoResponse.json();
            const country = geoData.address?.country || geoData.address?.region || geoData.name || 'Unknown';

            // Update popup with country name
            setPolymarketPopup(prev => prev ? { ...prev, country } : null);
            setSelectedLocation(country);

            // Step 2: Fetch Polymarket data for this country
            const marketResponse = await fetch(`/api/polymarket/events?closed=false&limit=5&order=volume&ascending=false&q=${encodeURIComponent(country)}`);

            if (!marketResponse.ok) throw new Error('Polymarket API error');

            const marketData = await marketResponse.json();

            // Parse markets - ONLY include if title contains country name (relevance filter)
            const parsedMarkets: { title: string; yesPrice: number; volume: number }[] = [];
            const countryLower = country.toLowerCase();
            // Also check for common abbreviations/aliases
            const countryAliases: Record<string, string[]> = {
                'united states': ['usa', 'u.s.', 'america', 'american', 'trump', 'biden', 'presidential'],
                'united kingdom': ['uk', 'britain', 'british', 'england'],
                'russia': ['russian', 'putin', 'moscow'],
                'ukraine': ['ukrainian', 'kyiv', 'zelensky'],
                'china': ['chinese', 'beijing', 'xi'],
                'israel': ['israeli', 'gaza', 'netanyahu'],
                'iran': ['iranian', 'tehran'],
                'france': ['french', 'macron', 'paris'],
                'germany': ['german', 'berlin'],
            };
            const aliases = countryAliases[countryLower] || [];

            if (Array.isArray(marketData)) {
                for (const ev of marketData) {
                    if (ev.markets && ev.markets.length > 0) {
                        const title = (ev.title || ev.markets[0].question || '').toLowerCase();

                        // Check if title mentions country or any alias
                        const isRelevant = title.includes(countryLower) ||
                            aliases.some(alias => title.includes(alias));

                        if (!isRelevant) continue; // Skip irrelevant markets

                        const m = ev.markets[0];
                        let yesPrice = 0.5;
                        try {
                            if (m.outcomePrices) {
                                const prices = JSON.parse(m.outcomePrices);
                                yesPrice = parseFloat(prices[0]) || 0.5;
                            }
                        } catch { }
                        parsedMarkets.push({
                            title: ev.title || m.question || 'Market',
                            yesPrice,
                            volume: parseFloat(m.volume) || ev.volume || 0
                        });
                        if (parsedMarkets.length >= 5) break;
                    }
                }
            }

            setPolymarketPopup(prev => prev ? {
                ...prev,
                markets: parsedMarkets,
                loading: false,
                error: parsedMarkets.length === 0 ? `No active markets for ${country}` : null
            } : null);

        } catch (error) {
            console.warn('Map click handler error:', error);
            setPolymarketPopup(prev => prev ? {
                ...prev,
                loading: false,
                error: 'Failed to load market data'
            } : null);
        }
    }, [setSelectedLocation]);

    return (
        <div className="map-container">
            <Map
                {...viewState}
                onMove={handleMove}
                onMouseMove={handleMouseMove}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                attributionControl={false}
                onClick={handleMapClick}
                cursor={cursor.lat ? 'crosshair' : 'auto'}
            >
                <NavigationControl position="bottom-right" />

                {/* Event Markers */}
                {filteredEvents.map((event) => (
                    <EventMarker
                        key={event.id}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                        isSelected={selectedEvent?.id === event.id}
                    />
                ))}

                {/* Prediction Markers */}
                {geolocatedPredictions.map((prediction) => (
                    <PredictionMarker key={prediction.id} prediction={prediction} />
                ))}

                {/* Selected Event Popup */}
                {selectedEvent && (
                    <EventPopup
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}

                {/* Polymarket Country Popup */}
                {polymarketPopup && (
                    <PolymarketMapPopup
                        lngLat={polymarketPopup.lngLat}
                        country={polymarketPopup.country}
                        markets={polymarketPopup.markets}
                        loading={polymarketPopup.loading}
                        error={polymarketPopup.error}
                        onClose={() => setPolymarketPopup(null)}
                    />
                )}
            </Map>

            {/* Top Overlay */}
            <div className="map-overlay map-overlay-top" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
            }}>
                <FilterBar />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isFocusMode && (
                        <button
                            onClick={exitFocusMode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: 'rgba(255, 107, 0, 0.9)',
                                border: 'none',
                                borderRadius: '4px',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                boxShadow: '0 0 15px rgba(255, 107, 0, 0.5)',
                                animation: 'pulse-focus 2s ease-in-out infinite',
                                pointerEvents: 'auto',
                            }}
                        >
                            <span>🎯 FOCUS MODE</span>
                            <span style={{ fontSize: '0.8rem' }}>✕</span>
                        </button>
                    )}
                    <LiveIndicator />
                </div>
            </div>

            {/* Bottom Overlay */}
            <div className="map-overlay map-overlay-bottom" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <CoordinateDisplay lng={cursor.lng} lat={cursor.lat} />
                <MapStats eventCount={filteredEvents.length} />
            </div>

            {/* Focus Mode animation styles */}
            <style>{`
                @keyframes pulse-focus {
                    0%, 100% { box-shadow: 0 0 10px rgba(255, 107, 0, 0.5); }
                    50% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.8); }
                }
            `}</style>
        </div>
    );
}

