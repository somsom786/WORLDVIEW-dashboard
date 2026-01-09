import { useEffect, useState } from 'react';

// Simplified interface for Tree of Alpha news item
interface TreeNews {
    id: string;
    title: string;
    time: number;
    source: string;
}

export function useTreeOfAlpha() {
    const [news, setNews] = useState<TreeNews[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

    useEffect(() => {
        let ws: WebSocket | null = null;
        let mounted = true;

        try {
            console.log('Connecting to Tree of Alpha...');
            // Note: Tree of Alpha often requires auth, so we might need to fallback or use a public feed if available.
            // Using a known public stream or simulating for safety if auth is needed.
            // For this task, we will attempt connection but wrap in safety.
            ws = new WebSocket('wss://news.treeofalpha.com/ws');

            ws.onopen = () => {
                if (mounted) setStatus('connected');
                console.log('Tree of Alpha Connected');
                // Subscribe if protocol requires
                ws?.send(JSON.stringify({ type: 'auth', key: 'demo' })); // Example
            };

            ws.onmessage = (event) => {
                if (!mounted) return;
                try {
                    const data = JSON.parse(event.data);
                    // Transform and add to state
                    // (Implementation depends on actual payload structure)
                    if (data.title) {
                        setNews(prev => [{
                            id: data._id || Date.now().toString(),
                            title: data.title,
                            time: data.time || Date.now(),
                            source: data.source || 'TreeOfAlpha'
                        }, ...prev.slice(0, 19)]);
                    }
                } catch (err) {
                    console.warn('Error parsing Tree of Alpha message', err);
                }
            };

            ws.onerror = (error) => {
                if (mounted) setStatus('error');
                console.warn('Tree of Alpha WS Error:', error);
            };

            ws.onclose = () => {
                if (mounted) setStatus('error');
                console.log('Tree of Alpha Disconnected');
            };

        } catch (error) {
            console.error('Failed to initialize Tree of Alpha WebSocket:', error);
            if (mounted) setStatus('error');
        }

        return () => {
            mounted = false;
            if (ws) ws.close();
        };
    }, []);

    return { news, status };
}
