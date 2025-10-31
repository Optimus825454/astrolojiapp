'use client';

import React from 'react';
import { LoaderCircle, Sparkles } from 'lucide-react';

interface InterpretationSectionProps {
    chartData: any;
    interpretation: string;
    isInterpreting: boolean;
    error: string;
    onInterpret: () => void;
}

const InterpretationSection: React.FC<InterpretationSectionProps> = ({
    chartData,
    interpretation,
    isInterpreting,
    error,
    onInterpret,
}) => {
    return (
        <>
            <section className="data-section fade-in-up">
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(75, 0, 130, 0.1))' }}>
                    <h3 className="section-title" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                        <span className="section-icon">✨</span>
                        Profesyonel Astroloji Yorumu
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                        Haritanızdaki tüm verilerin AI destekli profesyonel yorumunu alın
                    </p>
                    <button
                        onClick={onInterpret}
                        disabled={isInterpreting}
                        className="btn-premium text-lg px-10 py-5"
                        style={{ fontSize: '18px', fontWeight: '600' }}
                    >
                        {isInterpreting ? (
                            <>
                                <LoaderCircle className="h-6 w-6 animate-spin inline mr-2" />
                                Haritanız Yorumlanıyor...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-6 w-6 inline mr-2" />
                                Şimdi Yorumla
                            </>
                        )}
                    </button>
                </div>
            </section>

            {error && (
                <div className="glass-card fade-in-up" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', marginBottom: '12px' }}>⚠️ Hata Oluştu</h4>
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {interpretation && (
                <section className="data-section fade-in-up">
                    <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(75, 0, 130, 0.05))' }}>
                        <h3 className="text-3xl font-bold text-gradient mb-6" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Sparkles className="h-8 w-8" style={{ color: 'var(--accent-electric)' }} />
                            Kişisel Astroloji Yorumunuz
                        </h3>
                        <div style={{
                            fontSize: '16px',
                            lineHeight: '1.8',
                            color: 'var(--text-primary)',
                            whiteSpace: 'pre-wrap',
                            letterSpacing: '0.3px'
                        }}>
                            {interpretation}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default InterpretationSection;