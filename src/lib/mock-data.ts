// ============================================
// MOCK DATA GENERATORS
// Realistic data for demonstration when APIs unavailable
// ============================================

import type { WorldEvent, MarketData, PredictionMarket, MainCharacter, NarrativeCluster, EventType, SeverityLevel } from '../types';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get random item from array
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// ============================================
// MOCK EVENTS
// ============================================

const mockEventTemplates: Array<{
    type: EventType;
    titles: string[];
    locations: Array<{ name: string; lat: number; lng: number }>;
    sources: string[];
}> = [
        {
            type: 'conflict',
            titles: [
                'Tensions escalate in South China Sea as naval forces mobilize',
                'Ceasefire negotiations stall in Ukraine as fighting intensifies',
                'Israeli strikes reported in northern Gaza amid ground operations',
                'Russian military exercises near Baltic states raise NATO concerns',
                'Iran-backed militia launches drone attacks on US base',
                'North Korea conducts another missile test, tensions rise in region',
                'Taiwan reports increased Chinese military activity near airspace',
                'Syrian regime forces advance on rebel-held territory',
                'Houthi rebels claim attack on commercial vessel in Red Sea',
                'Pakistan-India border tensions flare after deadly skirmish',
            ],
            locations: [
                { name: 'South China Sea', lat: 12.5, lng: 114.5 },
                { name: 'Kyiv, Ukraine', lat: 50.45, lng: 30.52 },
                { name: 'Gaza', lat: 31.5, lng: 34.47 },
                { name: 'Baltic Sea', lat: 57.0, lng: 20.0 },
                { name: 'Iraq', lat: 33.3, lng: 44.37 },
                { name: 'Korean Peninsula', lat: 38.0, lng: 127.0 },
                { name: 'Taiwan Strait', lat: 24.5, lng: 119.5 },
                { name: 'Damascus, Syria', lat: 33.5, lng: 36.3 },
                { name: 'Red Sea', lat: 20.0, lng: 38.0 },
                { name: 'Kashmir', lat: 34.0, lng: 74.8 },
            ],
            sources: ['Reuters', 'AP News', 'AFP', 'BBC World', 'Al Jazeera'],
        },
        {
            type: 'weather',
            titles: [
                'Category 4 hurricane makes landfall on Florida coast',
                'Devastating floods displace thousands in Bangladesh',
                'Wildfires spread across California, evacuation orders issued',
                'Record-breaking heatwave grips Southern Europe',
                'Massive earthquake strikes Turkey, casualties reported',
                'Volcanic eruption in Iceland disrupts European air travel',
                'Severe drought conditions worsen in Horn of Africa',
                'Cyclone Amphan causes widespread destruction in Bay of Bengal',
                'Tsunami warning issued after 7.8 magnitude quake in Japan',
                'Arctic ice reaches historic low, scientists warn',
            ],
            locations: [
                { name: 'Miami, Florida', lat: 25.76, lng: -80.19 },
                { name: 'Dhaka, Bangladesh', lat: 23.81, lng: 90.41 },
                { name: 'Los Angeles, CA', lat: 34.05, lng: -118.24 },
                { name: 'Athens, Greece', lat: 37.98, lng: 23.73 },
                { name: 'Ankara, Turkey', lat: 39.93, lng: 32.86 },
                { name: 'Reykjavik, Iceland', lat: 64.15, lng: -21.94 },
                { name: 'Mogadishu, Somalia', lat: 2.04, lng: 45.34 },
                { name: 'Kolkata, India', lat: 22.57, lng: 88.36 },
                { name: 'Tokyo, Japan', lat: 35.68, lng: 139.69 },
                { name: 'Arctic Circle', lat: 71.0, lng: -8.0 },
            ],
            sources: ['NASA', 'NOAA', 'USGS', 'Met Office', 'Reuters'],
        },
        {
            type: 'economy',
            titles: [
                'Federal Reserve signals aggressive rate hikes amid inflation concerns',
                'Bitcoin surges past $100,000 as institutional adoption accelerates',
                'Major bank collapse triggers global market selloff',
                'Oil prices spike after OPEC announces production cuts',
                'China reports slowest economic growth in three decades',
                'US Treasury yields hit 16-year high, mortgage rates soar',
                'European Central Bank holds rates steady despite recession fears',
                'Tech sector layoffs continue as valuations collapse',
                'Dollar strengthens to multi-year high against major currencies',
                'Gold reaches all-time high as investors seek safe haven',
            ],
            locations: [
                { name: 'Washington D.C.', lat: 38.91, lng: -77.04 },
                { name: 'New York', lat: 40.71, lng: -74.01 },
                { name: 'Wall Street', lat: 40.71, lng: -74.01 },
                { name: 'Vienna, Austria', lat: 48.21, lng: 16.37 },
                { name: 'Beijing, China', lat: 39.9, lng: 116.4 },
                { name: 'Chicago', lat: 41.88, lng: -87.63 },
                { name: 'Frankfurt, Germany', lat: 50.11, lng: 8.68 },
                { name: 'San Francisco', lat: 37.77, lng: -122.42 },
                { name: 'London', lat: 51.51, lng: -0.13 },
                { name: 'Zurich', lat: 47.37, lng: 8.54 },
            ],
            sources: ['Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal', 'Reuters'],
        },
        {
            type: 'politics',
            titles: [
                'EU summit ends in deadlock over migration policy',
                'US Congress faces government shutdown deadline',
                'Protests erupt in Paris over pension reform',
                'Brazil election results contested, military on alert',
                'AI regulation bill advances in Senate',
                'UK Prime Minister faces no-confidence vote',
                'German coalition government collapses, snap elections called',
                'India passes controversial citizenship amendment',
                'Australia announces new Pacific security pact',
                'UN Security Council deadlocked on sanctions resolution',
            ],
            locations: [
                { name: 'Brussels, Belgium', lat: 50.85, lng: 4.35 },
                { name: 'Washington D.C.', lat: 38.91, lng: -77.04 },
                { name: 'Paris, France', lat: 48.86, lng: 2.35 },
                { name: 'Brasilia, Brazil', lat: -15.79, lng: -47.88 },
                { name: 'Capitol Hill', lat: 38.89, lng: -77.01 },
                { name: 'London', lat: 51.51, lng: -0.13 },
                { name: 'Berlin, Germany', lat: 52.52, lng: 13.4 },
                { name: 'New Delhi, India', lat: 28.61, lng: 77.21 },
                { name: 'Canberra, Australia', lat: -35.28, lng: 149.13 },
                { name: 'New York (UN)', lat: 40.75, lng: -73.97 },
            ],
            sources: ['Reuters', 'AP News', 'The Guardian', 'Politico', 'BBC'],
        },
    ];

export function generateMockEvents(count: number = 50): WorldEvent[] {
    const events: WorldEvent[] = [];

    for (let i = 0; i < count; i++) {
        const template = randomFrom(mockEventTemplates);
        const titleIndex = Math.floor(Math.random() * template.titles.length);
        const location = template.locations[titleIndex % template.locations.length];

        events.push({
            id: generateId(),
            type: template.type,
            lat: location.lat + randomBetween(-2, 2),
            lng: location.lng + randomBetween(-2, 2),
            severity: Math.ceil(randomBetween(3, 10)) as SeverityLevel,
            title: template.titles[titleIndex],
            summary: `Breaking: ${template.titles[titleIndex]}. Situation developing rapidly with significant implications for regional stability.`,
            source: randomFrom(template.sources),
            timestamp: new Date(Date.now() - Math.random() * 3600000 * 24), // Random time in last 24h
            confidence: randomFrom(['verified', 'developing', 'rumor'] as const),
        });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ============================================
// MOCK MARKETS
// ============================================

export function generateMockMarkets(): MarketData[] {
    const baseData = [
        { symbol: 'BTC', name: 'Bitcoin', basePrice: 98500 },
        { symbol: 'ETH', name: 'Ethereum', basePrice: 3850 },
        { symbol: 'SOL', name: 'Solana', basePrice: 245 },
        { symbol: 'SPY', name: 'S&P 500', basePrice: 598 },
        { symbol: 'QQQ', name: 'NASDAQ 100', basePrice: 520 },
        { symbol: 'DXY', name: 'US Dollar Index', basePrice: 106.5 },
        { symbol: 'GOLD', name: 'Gold', basePrice: 2680 },
        { symbol: 'OIL', name: 'Crude Oil', basePrice: 78.5 },
        { symbol: 'XAG', name: 'Silver', basePrice: 32.4 },
        { symbol: 'TSLA', name: 'Tesla', basePrice: 410 },
    ];

    return baseData.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: item.basePrice * (1 + randomBetween(-0.02, 0.02)),
        change24h: randomBetween(-5, 5),
        volume: Math.floor(randomBetween(1e9, 50e9)),
    }));
}

// ============================================
// MOCK PREDICTION MARKETS
// ============================================

export function generateMockPredictions(): PredictionMarket[] {
    return [
        {
            id: generateId(),
            title: 'Trump wins 2028 election',
            probability: 0.52 + randomBetween(-0.05, 0.05),
            volume: 45000000,
            lat: 38.91,
            lng: -77.04,
        },
        {
            id: generateId(),
            title: 'Israel-Hamas ceasefire by March',
            probability: 0.28 + randomBetween(-0.05, 0.05),
            volume: 12000000,
            lat: 31.5,
            lng: 34.47,
        },
        {
            id: generateId(),
            title: 'Bitcoin above $150k by EOY',
            probability: 0.35 + randomBetween(-0.05, 0.05),
            volume: 28000000,
        },
        {
            id: generateId(),
            title: 'Fed rate cut in Q1',
            probability: 0.68 + randomBetween(-0.05, 0.05),
            volume: 18000000,
            lat: 38.89,
            lng: -77.03,
        },
        {
            id: generateId(),
            title: 'China invades Taiwan by 2027',
            probability: 0.08 + randomBetween(-0.02, 0.02),
            volume: 8500000,
            lat: 25.03,
            lng: 121.57,
        },
        {
            id: generateId(),
            title: 'AI causes major cyber incident in 2026',
            probability: 0.42 + randomBetween(-0.05, 0.05),
            volume: 6200000,
        },
        {
            id: generateId(),
            title: 'Russia-Ukraine conflict ends by 2027',
            probability: 0.22 + randomBetween(-0.05, 0.05),
            volume: 15000000,
            lat: 50.45,
            lng: 30.52,
        },
        {
            id: generateId(),
            title: 'US recession in 2026',
            probability: 0.38 + randomBetween(-0.05, 0.05),
            volume: 22000000,
            lat: 40.71,
            lng: -74.01,
        },
    ];
}

// ============================================
// MOCK MAIN CHARACTER
// ============================================

export function generateMockMainCharacter(): MainCharacter {
    const candidates = [
        { name: 'Donald Trump', sentiment: 'negative' as const },
        { name: 'Vladimir Putin', sentiment: 'negative' as const },
        { name: 'Elon Musk', sentiment: 'neutral' as const },
        { name: 'Xi Jinping', sentiment: 'negative' as const },
        { name: 'Jerome Powell', sentiment: 'neutral' as const },
    ];

    const selected = randomFrom(candidates);

    return {
        name: selected.name,
        mentions: Math.floor(randomBetween(50, 200)),
        heatScore: Math.floor(randomBetween(70, 99)),
        sentiment: selected.sentiment,
    };
}

// ============================================
// MOCK NARRATIVES
// ============================================

export function generateMockNarratives(): NarrativeCluster[] {
    return [
        {
            id: generateId(),
            title: 'Red Sea Shipping Crisis',
            eventCount: Math.floor(randomBetween(15, 35)),
            keywords: ['Houthi', 'Yemen', 'shipping', 'Suez', 'maritime'],
            severity: 8,
        },
        {
            id: generateId(),
            title: 'Ukraine Counter-Offensive',
            eventCount: Math.floor(randomBetween(25, 50)),
            keywords: ['Kyiv', 'Russia', 'NATO', 'weapons', 'offensive'],
            severity: 9,
        },
        {
            id: generateId(),
            title: 'AI Regulation Debate',
            eventCount: Math.floor(randomBetween(10, 25)),
            keywords: ['OpenAI', 'regulation', 'safety', 'Congress', 'EU'],
            severity: 5,
        },
        {
            id: generateId(),
            title: 'Global Inflation Fight',
            eventCount: Math.floor(randomBetween(20, 40)),
            keywords: ['Fed', 'rates', 'inflation', 'recession', 'economy'],
            severity: 7,
        },
        {
            id: generateId(),
            title: 'Middle East Tensions',
            eventCount: Math.floor(randomBetween(30, 60)),
            keywords: ['Israel', 'Gaza', 'Iran', 'Hamas', 'ceasefire'],
            severity: 9,
        },
    ].sort((a, b) => b.severity - a.severity);
}

// ============================================
// CALCULATE DEFCON LEVEL
// ============================================

export function calculateDefconLevel(events: WorldEvent[]): 1 | 2 | 3 | 4 | 5 {
    const recentEvents = events.filter(
        e => Date.now() - e.timestamp.getTime() < 3600000 // Last hour
    );

    const conflictCount = recentEvents.filter(e => e.type === 'conflict').length;
    const highSeverityCount = recentEvents.filter(e => e.severity >= 8).length;

    const score = conflictCount * 2 + highSeverityCount * 3;

    if (score >= 20) return 1;
    if (score >= 15) return 2;
    if (score >= 10) return 3;
    if (score >= 5) return 4;
    return 5;
}
