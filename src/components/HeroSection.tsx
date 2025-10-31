'use client';

import React from 'react';
import { Sun, Moon, TrendingUp } from 'lucide-react';
import { formatDegree, translateSignName, getZodiacSign, ChartData } from '../utils/chartUtils';

interface HeroSectionProps {
    chartData: ChartData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ chartData }) => {
    const sunData = chartData?.planets?.sun;
    const moonData = chartData?.planets?.moon;
    const risingSign = chartData?.interpretations?.risingSign;

    // Get rising sign name from axes if risingSign interpretation is not available
    const risingSignName = risingSign?.signName
        ? translateSignName(risingSign.signName)
        : chartData?.axes?.asc?.sign
            ? getZodiacSign(chartData.axes.asc.sign)
            : 'N/A';

    return (
        <section className="hero-trinity fade-in-up">
            <div className="trinity-card glow-animation">
                <div className="trinity-icon">
                    <Sun />
                </div>
                <div className="trinity-label">Güneş</div>
                <div className="trinity-value">
                    {sunData?.signName ? translateSignName(sunData.signName) : 'N/A'}
                </div>
                <div className="trinity-degree">
                    {formatDegree(sunData?.position)}
                </div>
            </div>

            <div className="trinity-card glow-animation">
                <div className="trinity-icon">
                    <Moon />
                </div>
                <div className="trinity-label">Ay</div>
                <div className="trinity-value">
                    {moonData?.signName ? translateSignName(moonData.signName) : 'N/A'}
                </div>
                <div className="trinity-degree">
                    {formatDegree(moonData?.position)}
                </div>
            </div>

            <div className="trinity-card glow-animation">
                <div className="trinity-icon">
                    <TrendingUp />
                </div>
                <div className="trinity-label">Yükselen</div>
                <div className="trinity-value">
                    {risingSignName}
                </div>
                <div className="trinity-degree">
                    {chartData?.axes?.asc ? `${formatDegree(chartData.axes.asc.position)}` : 'N/A'}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;