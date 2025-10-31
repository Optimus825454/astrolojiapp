import React, { useState, lazy, Suspense } from 'react';
import { LoaderCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { ChartData } from '../utils/chartUtils';
import InterpretationModal from './InterpretationModal';

// Lazy load components for better performance
const HeroSection = lazy(() => import('./HeroSection'));
const PlanetGrid = lazy(() => import('./PlanetGrid'));
const HousesGrid = lazy(() => import('./HousesGrid'));
const AxesGrid = lazy(() => import('./AxesGrid'));
const AspectsGrid = lazy(() => import('./AspectsGrid'));
const InterpretationSection = lazy(() => import('./InterpretationSection'));
const TransitCalculator = lazy(() => import('./TransitCalculator'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoaderCircle className="h-8 w-8 animate-spin" />
    <span className="ml-2">Yükleniyor...</span>
  </div>
);

interface ChartDisplayProps {
  chartData: ChartData;
  onReset: () => void;
}

// Memoize the main component
const ChartDisplay = React.memo<ChartDisplayProps>(({ chartData, onReset }) => {
  ChartDisplay.displayName = 'ChartDisplay';
  const [interpretation, setInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transitData, setTransitData] = useState<any>(null);

  const handleInterpret = async () => {
    setIsInterpreting(true);
    setIsModalOpen(true);
    setError('');
    setInterpretation('');

    try {
      // Önce mevcut transit hesaplamasını al
      const now = new Date();
      const chartDataAny = chartData as any;
      const transitResponse = await fetch('/api/transit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transitDate: now.toISOString(),
          latitude: chartDataAny.birthInfo?.latitude || 41.0082,
          longitude: chartDataAny.birthInfo?.longitude || 28.9784,
          natalChart: chartData,
        }),
      });

      let currentTransitData = null;
      if (transitResponse.ok) {
        currentTransitData = await transitResponse.json();
        setTransitData(currentTransitData);
      }

      // Şimdi yorumlama isteği gönder (natal + transit)
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chartData,
          transitData: currentTransitData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bilinmeyen bir yorumlama hatası');
      }

      setInterpretation(result.interpretation);
      // Modal açık kalacak, kullanıcı kapatacak

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Yorumlama sırasında bir hata oluştu.';
      setError(errorMessage);
      setIsModalOpen(false); // Hata durumunda modal'ı kapat
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32 md:pb-8">
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:block sticky top-4 z-40 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ASTROVISION"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(138, 43, 226, 0.6))' }}
            />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-1">
                ASTROVISION • Doğum Haritanız
              </h2>
              <p className="text-text-secondary text-sm">Kozmik enerjinizin detaylı analizi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onReset} className="btn-premium flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Yeni Harita
            </button>
            <button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="btn-premium text-lg px-6 py-3 flex items-center gap-2"
            >
              {isInterpreting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Yorumlanıyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  AI Yorumla
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple Logo */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-center gap-3 py-4">
          <img
            src="/logo.png"
            alt="ASTROVISION"
            className="w-8 h-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(138, 43, 226, 0.6))' }}
          />
          <h2 className="text-xl font-bold text-gradient">
            ASTROVISION
          </h2>
        </div>
      </div>

      {/* Hero Section - Sun, Moon, Rising */}
      <Suspense fallback={<LoadingFallback />}>
        <HeroSection chartData={chartData} />
      </Suspense>

      {/* All Planets Section */}
      <Suspense fallback={<LoadingFallback />}>
        {chartData?.planets && <PlanetGrid planets={chartData.planets} />}
      </Suspense>

      {/* Houses Section */}
      <Suspense fallback={<LoadingFallback />}>
        {chartData?.houses && chartData.houses.length > 0 && (
          <HousesGrid houses={chartData.houses} />
        )}
      </Suspense>

      {/* Axes Section */}
      <Suspense fallback={<LoadingFallback />}>
        {chartData?.axes && <AxesGrid axes={chartData.axes} />}
      </Suspense>

      {/* Aspects Section */}
      <Suspense fallback={<LoadingFallback />}>
        {chartData?.aspects && <AspectsGrid aspects={chartData.aspects} />}
      </Suspense>

      {/* Chart Patterns Section */}
      {chartData?.chartPatterns && (
        <section className="data-section fade-in-up">
          <h3 className="section-title">
            <span className="section-icon">🌟</span>
            Harita Desenleri
          </h3>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {/* Element Vurgusu */}
              {chartData.chartPatterns.elementEmphasis && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-electric)', marginBottom: '12px' }}>
                    Element Dağılımı
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🔥 Ateş:</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.elementEmphasis.fire || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🌍 Toprak:</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.elementEmphasis.earth || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>💨 Hava:</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.elementEmphasis.air || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>💧 Su:</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.elementEmphasis.water || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modalite Vurgusu */}
              {chartData.chartPatterns.qualityEmphasis && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-electric)', marginBottom: '12px' }}>
                    Modalite Dağılımı
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>⚡ Başlatıcı (Cardinal):</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.qualityEmphasis.cardinal || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🎯 Sabit (Fixed):</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.qualityEmphasis.fixed || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🔄 Değişken (Mutable):</span>
                      <span style={{ fontWeight: '600' }}>{chartData.chartPatterns.qualityEmphasis.mutable || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stelliumlar */}
              {chartData.chartPatterns.stelliums && chartData.chartPatterns.stelliums.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-electric)', marginBottom: '12px' }}>
                    Gezegen Yoğunlaşmaları (Stellium)
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {chartData.chartPatterns.stelliums.map((stellium: string, index: number) => (
                      <span key={index} className="aspect-badge" style={{ fontSize: '14px' }}>
                        {stellium}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Error Section */}
      {error && (
        <div className="glass-card fade-in-up" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', marginBottom: '12px' }}>⚠️ Hata Oluştu</h4>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Transit Calculator */}
      <div className="fade-in-up">
        <Suspense fallback={<LoadingFallback />}>
          <TransitCalculator natalChart={chartData} />
        </Suspense>
      </div>

      {/* Interpretation Modal */}
      <InterpretationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interpretation={interpretation}
        isLoading={isInterpreting}
      />

      {/* Mobile Bottom Navigation - Professional Sticky Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient fade effect */}
        <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />

        <div
          className="relative backdrop-blur-2xl border-t"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 11, 46, 0.85) 0%, rgba(10, 10, 15, 0.95) 100%)',
            borderColor: 'rgba(138, 43, 226, 0.2)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3), 0 -1px 2px rgba(138, 43, 226, 0.1)',
          }}
        >
          <div className="flex items-stretch justify-center gap-3 p-4 max-w-md mx-auto">
            {/* Yeni Harita Button */}
            <button
              onClick={onReset}
              className="flex-1 group relative overflow-hidden rounded-xl transition-all duration-300 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex flex-col items-center justify-center gap-2 py-3 px-4">
                <ArrowLeft className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
                <span className="text-xs font-medium text-purple-100/90 group-hover:text-purple-50 transition-colors">
                  Yeni Harita
                </span>
              </div>
            </button>

            {/* AI Yorumla Button - Primary */}
            <button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="flex-1 group relative overflow-hidden rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isInterpreting
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.3))'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(99, 102, 241, 0.5))',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: isInterpreting
                  ? 'none'
                  : '0 4px 16px rgba(139, 92, 246, 0.25)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-300/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex flex-col items-center justify-center gap-2 py-3 px-4">
                {isInterpreting ? (
                  <>
                    <LoaderCircle className="h-5 w-5 text-purple-200 animate-spin" />
                    <span className="text-xs font-medium text-purple-100">
                      Yorumlanıyor...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-purple-100 group-hover:text-white transition-colors" />
                    <span className="text-xs font-semibold text-purple-50 group-hover:text-white transition-colors">
                      AI Yorumla
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* iPhone bottom safe area */}
          <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
        </div>
      </div>
    </div>
  );
});

export default ChartDisplay;
