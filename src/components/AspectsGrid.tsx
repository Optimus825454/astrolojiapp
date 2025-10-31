'use client';

import React from 'react';
import { translateSignName } from '../utils/chartUtils';

interface AspectsGridProps {
    aspects: Record<string, any[]>;
}

const AspectsGrid: React.FC<AspectsGridProps> = ({ aspects }) => {
    const flatAspects = Object.entries(aspects).flatMap(([planetName, planetAspects]) =>
        planetAspects
            .filter((aspect: any) => aspect.second?.exist)
            .map((aspect: any, index: number) => ({
                planet1: planetName,
                planet2: aspect.second?.name,
                aspectType: aspect.name,
                key: `${planetName}-${index}`,
            }))
    );

    // Limit to first 15 aspects for performance
    const limitedAspects = flatAspects.slice(0, 15);

    return (
        <section className="data-section fade-in-up">
            <h3 className="section-title">
                <span className="section-icon">🔮</span>
                Gezegen İlişkileri (Aspects)
            </h3>
            <div className="glass-card" style={{ padding: '24px' }}>
                <div className="aspects-container">
                    {limitedAspects.map(({ planet1, planet2, aspectType, key }) => (
                        <span key={key} className="aspect-badge">
                            {planet1} - {planet2}: {aspectType}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AspectsGrid;