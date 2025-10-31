'use client';

import React from 'react';
import { getZodiacSign, formatDegree } from '../utils/chartUtils';

interface AxesGridProps {
    axes: Record<string, any>;
}

const AxesGrid: React.FC<AxesGridProps> = ({ axes }) => {
    const axisData = [
        { label: 'Yükselen (ASC)', key: 'asc' },
        { label: 'Orta Göğü (MC)', key: 'mc' },
        { label: 'Alçalan (DC)', key: 'dc' },
        { label: 'Gök Dibi (IC)', key: 'ic' },
    ];

    return (
        <section className="data-section fade-in-up">
            <h3 className="section-title">
                <span className="section-icon">⚡</span>
                Açılar (Axes)
            </h3>
            <div className="axis-grid">
                {axisData.map(({ label, key }) => (
                    <div key={key} className="axis-card">
                        <div className="axis-label">{label}</div>
                        <div className="axis-value">{axes[key] ? getZodiacSign(axes[key].sign) : 'N/A'}</div>
                        <div className="axis-degree">
                            {axes[key] ? `${formatDegree(axes[key].position)}` : 'N/A'}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AxesGrid;