// ============================================
// PROJECT WORLDVIEW - MAIN SITUATION DATA HOOK
// Aggregates all data sources with waterfall fallbacks
// ============================================

import { useEffect, useCallback, useRef } from 'react';
import { useWorldStore } from '../store/worldState';
import {
    generateMockEvents,
    generateMockMarkets,
    generateMockPredictions,
    generateMockMainCharacter,
    generateMockNarratives,
    calculateDefconLevel,
} from '../lib/mock-data';
import type { WorldEvent, MarketData } from '../types';

const REFRESH_INTERVAL = 30000; // 30 seconds
const NEWS_API_KEY = '519e8e5732ee42c6849b968b92ba5935';
const NEWS_API_ENDPOINT = `https://newsapi.org/v2/top-headlines?category=general&apiKey=${NEWS_API_KEY}`;
const NASA_EONET_ENDPOINT = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=20';
const USGS_ENDPOINT = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
const COINGECKO_ENDPOINT = '/api/coingecko/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true';

const MOCK_NEWS: WorldEvent[] = [
    { id: 'mock-1', type: 'economy', title: 'Oil Prices Surge', summary: 'Oil prices surge amid global tensions.', severity: 8, lat: 25, lng: 55, source: 'Analyst Wire', timestamp: new Date(), confidence: 'verified', url: '#' },
    { id: 'mock-2', type: 'weather', title: 'Hurricane Warning', summary: 'Category 4 hurricane approaching coast.', severity: 10, lat: 25, lng: -80, source: 'NOAA', timestamp: new Date(), confidence: 'verified', url: '#' },
    { id: 'mock-3', type: 'conflict', title: 'Diplomatic Summit', summary: 'Leaders meet to discuss peace treaty.', severity: 6, lat: 48, lng: 2, source: 'AP', timestamp: new Date(), confidence: 'developing', url: '#' },
    { id: 'mock-4', type: 'politics', title: 'Election Results', summary: 'Early polls show close race.', severity: 7, lat: 38, lng: -77, source: 'Reuters', timestamp: new Date(), confidence: 'developing', url: '#' },
    { id: 'mock-5', type: 'economy', title: 'Market Rally', summary: 'Tech stocks lead market rally.', severity: 5, lat: 40, lng: -74, source: 'Bloomberg', timestamp: new Date(), confidence: 'verified', url: '#' }
];

// ============================================
// API FETCHERS WITH FALLBACKS
// ============================================

async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(id);
        return response;
    } catch {
        clearTimeout(id);
        throw new Error(`Request to ${url} failed or timed out`);
    }
}

async function fetchNewsAPIEvents(): Promise<WorldEvent[]> {
    try {
        console.log('Fetching NewsAPI...');
        const response = await fetchWithTimeout(NEWS_API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            console.warn('NewsAPI returned no articles, using fallback.');
            return MOCK_NEWS;
        }

        return data.articles.slice(0, 20).map((article: any, index: number) => ({
            id: `news-${index}-${Date.now()}`,
            type: 'politics' as const, // Defaulting to politics for general news
            // Random lats for list-only news (or geocode later if needed) - defaulting to 0,0 or random for visualization
            lat: (Math.random() * 160) - 80,
            lng: (Math.random() * 360) - 180,
            severity: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            title: article.title || 'Breaking News',
            summary: article.description || article.title,
            source: article.source?.name || 'NewsAPI',
            timestamp: new Date(article.publishedAt || Date.now()),
            confidence: 'verified' as const,
            url: article.url,
        }));

    } catch (error) {
        console.warn('NewsAPI fetch failed (CORS/Limit/Network), activating MOCK_FALLBACK', error);
        return MOCK_NEWS;
    }
}

async function fetchNASAEvents(): Promise<WorldEvent[]> {
    try {
        const response = await fetchWithTimeout(NASA_EONET_ENDPOINT);
        if (!response.ok) throw new Error('NASA EONET API error');

        const data = await response.json();

        return data.events?.slice(0, 15).map((event: {
            id: string;
            title: string;
            categories: Array<{ title: string }>;
            geometry: Array<{ coordinates: [number, number]; date: string }>;
            sources: Array<{ url: string }>;
        }) => {
            const coords = event.geometry?.[0]?.coordinates;
            if (!coords) return null;

            return {
                id: `nasa-${event.id}`,
                type: 'weather' as const,
                lat: coords[1],
                lng: coords[0],
                severity: event.categories?.[0]?.title?.includes('Wildfire') ? 8 : 6 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                title: event.title,
                summary: `Natural event: ${event.title}`,
                source: 'NASA EONET',
                timestamp: new Date(event.geometry?.[0]?.date || Date.now()),
                confidence: 'verified' as const,
                url: event.sources?.[0]?.url,
            };
        }).filter(Boolean) || [];
    } catch (error) {
        console.warn('NASA EONET fetch failed:', error);
        return [];
    }
}

async function fetchUSGSEarthquakes(): Promise<WorldEvent[]> {
    try {
        const response = await fetchWithTimeout(USGS_ENDPOINT);
        if (!response.ok) throw new Error('USGS API error');

        const data = await response.json();

        return data.features?.slice(0, 10).map((feature: {
            id: string;
            properties: { mag: number; place: string; time: number; url: string };
            geometry: { coordinates: [number, number, number] };
        }) => ({
            id: `usgs-${feature.id}`,
            type: 'weather' as const,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            severity: Math.min(10, Math.ceil(feature.properties.mag)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            title: `M${feature.properties.mag.toFixed(1)} Earthquake - ${feature.properties.place}`,
            summary: `A ${feature.properties.mag.toFixed(1)} magnitude earthquake occurred at ${feature.properties.place}.`,
            source: 'USGS',
            timestamp: new Date(feature.properties.time),
            confidence: 'verified' as const,
            url: feature.properties.url,
        })) || [];
    } catch (error) {
        console.warn('USGS fetch failed:', error);
        return [];
    }
}

async function fetchCryptoMarkets(): Promise<MarketData[]> {
    try {
        const response = await fetchWithTimeout(COINGECKO_ENDPOINT);
        if (!response.ok) throw new Error('CoinGecko API error');

        const data = await response.json();

        const markets: MarketData[] = [];

        if (data.bitcoin) {
            markets.push({
                symbol: 'BTC',
                name: 'Bitcoin',
                price: data.bitcoin.usd,
                change24h: data.bitcoin.usd_24h_change || 0,
            });
        }

        if (data.ethereum) {
            markets.push({
                symbol: 'ETH',
                name: 'Ethereum',
                price: data.ethereum.usd,
                change24h: data.ethereum.usd_24h_change || 0,
            });
        }

        if (data.solana) {
            markets.push({
                symbol: 'SOL',
                name: 'Solana',
                price: data.solana.usd,
                change24h: data.solana.usd_24h_change || 0,
            });
        }

        return markets;
    } catch (error) {
        console.warn('CoinGecko fetch failed:', error);
        return [];
    }
}

// ============================================
// MAIN HOOK
// ============================================

export function useSituationData() {
    const {
        setEvents,
        setMarkets,
        setPredictions,
        setMainCharacter,
        setNarratives,
        setDefconLevel,
        setLoading,
        setError,
        updateLastUpdated,
    } = useWorldStore();

    const isFirstLoad = useRef(true);

    const fetchAllData = useCallback(async () => {
        try {
            if (isFirstLoad.current) {
                setLoading(true);
            }

            // Fetch all sources concurrently
            const [newsEvents, nasaEvents, usgsEvents, cryptoMarkets] = await Promise.allSettled([
                fetchNewsAPIEvents(),
                fetchNASAEvents(),
                fetchUSGSEarthquakes(),
                fetchCryptoMarkets(),
            ]);

            // Aggregate events from all sources
            let allEvents: WorldEvent[] = [];

            if (newsEvents.status === 'fulfilled') {
                allEvents = [...allEvents, ...newsEvents.value];
            } else {
                // If the promise itself rejected (unlikely due to internal catch), use mock
                allEvents = [...allEvents, ...MOCK_NEWS];
            }

            if (nasaEvents.status === 'fulfilled' && nasaEvents.value.length > 0) {
                allEvents = [...allEvents, ...nasaEvents.value];
            }

            if (usgsEvents.status === 'fulfilled' && usgsEvents.value.length > 0) {
                allEvents = [...allEvents, ...usgsEvents.value];
            }

            // If no real events, use mock data
            if (allEvents.length < 10) {
                console.info('Insufficient API data, supplementing with mock events');
                const mockEvents = generateMockEvents(40);
                allEvents = [...allEvents, ...mockEvents];
            }

            // Sort by timestamp
            allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setEvents(allEvents);

            // Set markets (with mock fallback)
            let markets = cryptoMarkets.status === 'fulfilled' ? cryptoMarkets.value : [];
            if (markets.length < 3) {
                markets = generateMockMarkets();
            } else {
                // Supplement with additional mock market data (stocks, etc.)
                const mockMarkets = generateMockMarkets();
                markets = [...markets, ...mockMarkets.filter(m => !['BTC', 'ETH', 'SOL'].includes(m.symbol))];
            }
            setMarkets(markets);

            // Set prediction markets (always mock for now - Polymarket CORS)
            setPredictions(generateMockPredictions());

            // Set main character
            setMainCharacter(generateMockMainCharacter());

            // Set narratives
            setNarratives(generateMockNarratives());

            // Calculate DEFCON level
            setDefconLevel(calculateDefconLevel(allEvents));

            updateLastUpdated();
            setError(null);

        } catch (error) {
            console.error('Error fetching situation data:', error);
            setError('Failed to fetch live data. Using cached/mock data.');

            // Use all mock data as fallback
            setEvents(generateMockEvents(50));
            setMarkets(generateMockMarkets());
            setPredictions(generateMockPredictions());
            setMainCharacter(generateMockMainCharacter());
            setNarratives(generateMockNarratives());
            setDefconLevel(3);
        } finally {
            setLoading(false);
            isFirstLoad.current = false;
        }
    }, [setEvents, setMarkets, setPredictions, setMainCharacter, setNarratives, setDefconLevel, setLoading, setError, updateLastUpdated]);

    // Initial fetch and interval
    useEffect(() => {
        fetchAllData();

        const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchAllData]);

    return { refetch: fetchAllData };
}
