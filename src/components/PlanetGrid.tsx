'use client';

import React from 'react';
import { Sun, Moon, Star, Zap, Circle } from 'lucide-react';
import { getPlanetIconId, formatDegree, translateSignName, isRetrograde } from '../utils/chartUtils';

interface PlanetGridProps {
    planets: Record<string, any>;
}

// Get the appropriate icon component based on planet icon ID
const getPlanetIcon = (iconId: string) => {
    const iconMap = {
        sun: Sun,
        moon: Moon,
        star: Star,
        zap: Zap,
        circle: Circle,
    };
    const IconComponent = iconMap[iconId as keyof typeof iconMap] || Circle;
    return <IconComponent className="w-full h-full" />;
};

const PlanetGrid: React.FC<PlanetGridProps> = ({ planets }) => {
    return (
        <section className="data-section fade-in-up">
            <h3 className="section-title">
                <span className="section-icon">✨</span>
                Tüm Gezegenler
            </h3>
            <div className="data-grid">
                {Object.entries(planets).map(([planetName, planet]: [string, any]) => (
                    <div key={planetName} className="planet-card">
                        <div className="planet-icon">
                            {getPlanetIcon(getPlanetIconId(planetName))}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {planet.name}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-electric)', marginBottom: '4px' }}>
                            {translateSignName(planet.signName)}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {formatDegree(planet.position)} • {isRetrograde(planet) ? 'R' : 'D'}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PlanetGrid;