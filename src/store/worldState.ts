// ============================================
// ZUSTAND GLOBAL STATE - WORLD STATE STORE
// ============================================

import { create } from 'zustand';
import type { WorldEvent, MarketData, PredictionMarket, MainCharacter, NarrativeCluster, WorldState } from '../types';

interface WorldStateActions {
    setEvents: (events: WorldEvent[]) => void;
    addEvent: (event: WorldEvent) => void;
    setMarkets: (markets: MarketData[]) => void;
    setPredictions: (predictions: PredictionMarket[]) => void;
    setMainCharacter: (character: MainCharacter | null) => void;
    setNarratives: (narratives: NarrativeCluster[]) => void;
    setDefconLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    toggleFilter: (filter: keyof WorldState['filters']) => void;
    updateLastUpdated: () => void;
    // Focus Mode
    setFocusedEvent: (event: WorldEvent | null) => void;
    clearFocusedEvent: () => void;
    // Interaction Mode
    setSelectedLocation: (location: string | null) => void;
}

const initialState: WorldState = {
    events: [],
    markets: [],
    predictions: [],
    mainCharacter: null,
    narratives: [],
    defconLevel: 3,
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
    filters: {
        conflict: true,
        weather: true,
        economy: true,
        politics: true,
    },
    focusedEvent: null,
    selectedLocation: null,
};

export const useWorldStore = create<WorldState & WorldStateActions>((set) => ({
    ...initialState,

    setEvents: (events) => set({ events }),

    addEvent: (event) => set((state) => ({
        events: [event, ...state.events].slice(0, 200) // Keep max 200 events
    })),

    setMarkets: (markets) => set({ markets }),

    setPredictions: (predictions) => set({ predictions }),

    setMainCharacter: (mainCharacter) => set({ mainCharacter }),

    setNarratives: (narratives) => set({ narratives }),

    setDefconLevel: (defconLevel) => set({ defconLevel }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    toggleFilter: (filter) => set((state) => ({
        filters: {
            ...state.filters,
            [filter]: !state.filters[filter],
        },
    })),

    updateLastUpdated: () => set({ lastUpdated: new Date() }),

    // Focus Mode
    setFocusedEvent: (focusedEvent) => set({ focusedEvent }),
    clearFocusedEvent: () => set({ focusedEvent: null }),

    // Interaction Mode
    selectedLocation: null,
    setSelectedLocation: (location: string | null) => set({ selectedLocation: location }),
}));

// Selector hooks for optimized re-renders
export const useEvents = () => useWorldStore((state) => state.events);
export const useMarkets = () => useWorldStore((state) => state.markets);
export const usePredictions = () => useWorldStore((state) => state.predictions);
export const useMainCharacter = () => useWorldStore((state) => state.mainCharacter);
export const useNarratives = () => useWorldStore((state) => state.narratives);
export const useDefconLevel = () => useWorldStore((state) => state.defconLevel);
export const useFilters = () => useWorldStore((state) => state.filters);
export const useIsLoading = () => useWorldStore((state) => state.isLoading);
export const useFocusedEvent = () => useWorldStore((state) => state.focusedEvent);
export const useSelectedLocation = () => useWorldStore((state) => state.selectedLocation);
export const useSetSelectedLocation = () => useWorldStore((state) => state.setSelectedLocation);
