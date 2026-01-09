// ============================================
// MAIN CHARACTER & NARRATIVE PANEL - RIGHT SIDE
// Trending entities and story clusters
// ============================================

import { Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { useMainCharacter, useNarratives } from '../../store/worldState';
import type { NarrativeCluster } from '../../types';


function MainCharacterCard() {
    const mainCharacter = useMainCharacter();

    if (!mainCharacter) {
        return (
            <div className="main-character-card">
                <div className="skeleton" style={{ height: '80px', borderRadius: '6px' }} />
            </div>
        );
    }

    const sentimentColor = {
        positive: 'var(--accent-money)',
        negative: 'var(--accent-danger)',
        neutral: 'var(--accent-tech)',
    }[mainCharacter.sentiment];

    return (
        <div className="main-character-card">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
            }}>
                <Flame size={14} color="var(--accent-alert)" />
                <span className="text-micro">Main Character Today</span>
            </div>

            <h2 className="character-name" style={{ color: sentimentColor }}>
                {mainCharacter.name}
            </h2>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                }}>
                    <TrendingUp size={12} />
                    <span style={{ fontFamily: 'JetBrains Mono' }}>
                        {mainCharacter.mentions}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>mentions</span>
                </div>
            </div>

            <div className="heat-meter" style={{ marginTop: '12px' }}>
                <span className="text-micro">Heat</span>
                <div className="heat-bar">
                    <div
                        className="heat-bar-fill"
                        style={{ width: `${mainCharacter.heatScore}%` }}
                    />
                </div>
                <span className="heat-value">{mainCharacter.heatScore}</span>
            </div>
        </div>
    );
}

function NarrativeItem({ narrative }: { narrative: NarrativeCluster }) {
    const severityClass = narrative.severity >= 8 ? 'high' : narrative.severity >= 5 ? 'medium' : 'low';

    return (
        <div className="narrative-item">
            <div className={`narrative-severity ${severityClass}`} />

            <div className="narrative-content">
                <h4 className="narrative-title">{narrative.title}</h4>
                <div className="narrative-count">
                    {narrative.eventCount} related events
                </div>
            </div>

            <AlertTriangle
                size={14}
                style={{
                    color: severityClass === 'high'
                        ? 'var(--accent-danger)'
                        : severityClass === 'medium'
                            ? 'var(--accent-warning)'
                            : 'var(--text-muted)',
                    flexShrink: 0
                }}
            />
        </div>
    );
}

export function MainCharacterPanel() {
    const narratives = useNarratives();

    return (
        <div className="panel" style={{ gridColumn: 3, gridRow: 1 }}>
            <div className="panel-header">
                <span className="panel-title">🎭 Narrative Engine</span>
            </div>

            <div className="panel-content">
                <MainCharacterCard />

                <div style={{
                    padding: '12px 16px 8px',
                    borderBottom: '1px solid var(--border-subtle)'
                }}>
                    <span className="text-micro">Active Story Clusters</span>
                </div>

                {narratives.map((narrative) => (
                    <NarrativeItem key={narrative.id} narrative={narrative} />
                ))}
            </div>
        </div>
    );
}
