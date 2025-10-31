'use client';

import React from 'react';
import { getZodiacSymbol, getZodiacSign, formatDegree } from '../utils/chartUtils';

interface HousesGridProps {
    houses: any[];
}

const HousesGrid: React.FC<HousesGridProps> = ({ houses }) => {
    return (
        <section className="data-section fade-in-up">
            <h3 className="section-title">
                <span className="section-icon">🏠</span>
                Evler (Houses)
            </h3>
            <div className="data-grid">
                {houses.map((house: any, index: number) => (
                    <div key={index} className="house-card">
                        <div className="house-number">EV {index + 1}</div>
                        <div className="house-sign">
                            <span className="sign-symbol">{getZodiacSymbol(house.sign)}</span>
                            {getZodiacSign(house.sign)}
                        </div>
                        <div className="house-degree">
                            {formatDegree(house.position)}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HousesGrid;