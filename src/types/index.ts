// ============================================
// PROJECT WORLDVIEW - TYPE DEFINITIONS
// ============================================

export type EventType = 'conflict' | 'weather' | 'economy' | 'politics';
export type ConfidenceLevel = 'verified' | 'developing' | 'rumor';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface WorldEvent {
    id: string;
    type: EventType;
    lat: number;
    lng: number;
    severity: SeverityLevel;
    title: string;
    summary: string;
    source: string;
    timestamp: Date;
    confidence: ConfidenceLevel;
    url?: string;
    imageUrl?: string;
}

export interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume?: number;
}

export interface PredictionMarket {
    id: string;
    title: string;
    probability: number;
    volume: number;
    lat?: number;
    lng?: number;
    endDate?: Date;
}

export interface MainCharacter {
    name: string;
    mentions: number;
    heatScore: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    imageUrl?: string;
}

export interface NarrativeCluster {
    id: string;
    title: string;
    eventCount: number;
    keywords: string[];
    severity: number;
}

export interface WorldState {
    events: WorldEvent[];
    markets: MarketData[];
    predictions: PredictionMarket[];
    mainCharacter: MainCharacter | null;
    narratives: NarrativeCluster[];
    defconLevel: 1 | 2 | 3 | 4 | 5;
    lastUpdated: Date;
    isLoading: boolean;
    error: string | null;
    filters: {
        conflict: boolean;
        weather: boolean;
        economy: boolean;
        politics: boolean;
    };
    // Interaction State
    focusedEvent: WorldEvent | null;
    selectedLocation: string | null;
}

export interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}
