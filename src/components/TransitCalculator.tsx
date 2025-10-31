'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { Calendar, LoaderCircle, TrendingUp, Sparkles, Clock, MapPin, ArrowRight } from 'lucide-react';
import '../styles/premium-theme.css';

interface TransitCalculatorProps {
  natalChart: any;
}

interface Suggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

// Translate English sign names to Turkish
const translateSignName = (signName: string): string => {
  const translations: any = {
    'Aries': 'Koç',
    'Taurus': 'Boğa',
    'Gemini': 'İkizler',
    'Cancer': 'Yengeç',
    'Leo': 'Aslan',
    'Virgo': 'Başak',
    'Libra': 'Terazi',
    'Scorpio': 'Akrep',
    'Sagittarius': 'Yay',
    'Capricorn': 'Oğlak',
    'Aquarius': 'Kova',
    'Pisces': 'Balık'
  };
  return translations[signName] || signName;
};

export default function TransitCalculator({ natalChart }: TransitCalculatorProps) {
  const [transitDate, setTransitDate] = useState(() => {
    // Varsayılan olarak bugünün tarihi
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [transitTime, setTransitTime] = useState(() => {
    // Varsayılan olarak şu anki saat
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transitCoordinates, setTransitCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [transitData, setTransitData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setTransitCoordinates(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // API direkt results array'i döndürüyor, bu yüzden data.results yerine data kullanıyoruz
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
    setIsLoading(false);
  }, []);

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    debouncedFetch(locationQuery);
    return () => {
      debouncedFetch.cancel();
    };
  }, [locationQuery, debouncedFetch]);

  const handleLocationSelect = (suggestion: Suggestion) => {
    setLocationQuery(suggestion.formatted);
    setTransitCoordinates({
      lat: suggestion.geometry.lat,
      lng: suggestion.geometry.lng,
    });
    setSuggestions([]);
  };

  const handleCalculateTransit = async () => {
    setIsCalculating(true);
    setError('');
    setTransitData(null);

    try {
      // Eğer koordinat yoksa, natal chart koordinatlarını kullan
      const coordinates = transitCoordinates || {
        lat: natalChart.birthInfo.latitude,
        lng: natalChart.birthInfo.longitude
      };

      const response = await fetch('/api/transit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transitDate: `${transitDate}T${transitTime}:00`,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          natalChart,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transit hesaplama hatası');
      }

      setTransitData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transit hesaplanırken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderAspectType = (type: string) => {
    switch (type) {
      case 'harmonious':
        return <span className="text-green-400">✓ Uyumlu</span>;
      case 'challenging':
        return <span className="text-orange-400">⚠ Zorlayıcı</span>;
      case 'major':
        return <span className="text-blue-400">● Önemli</span>;
      default:
        return <span className="text-muted">○</span>;
    }
  };

  return (
    <div className="data-section fade-in-up">
      <h3 className="section-title">
        <span className="section-icon">🌟</span>
        Transit Harita Hesaplama
      </h3>

      {/* Relative container for positioning suggestions outside glass-card */}
      <div className="relative">
        <div className="glass-card" style={{ padding: '30px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarih */}
            <div>
              <label htmlFor="transitDate" className="block text-sm font-medium text-text-secondary mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Transit Tarihi
              </label>
              <input
                type="date"
                id="transitDate"
                value={transitDate}
                onChange={(e) => setTransitDate(e.target.value)}
                className="w-full px-4 py-3 bg-glass-bg border-2 border-glass-border rounded-lg text-text-primary focus:outline-none focus:border-primary-cosmic transition-all duration-300"
                style={{ backdropFilter: 'blur(20px)' }}
              />
            </div>

            {/* Saat */}
            <div>
              <label htmlFor="transitTime" className="block text-sm font-medium text-text-secondary mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Transit Saati
              </label>
              <input
                type="time"
                id="transitTime"
                value={transitTime}
                onChange={(e) => setTransitTime(e.target.value)}
                className="w-full px-4 py-3 bg-glass-bg border-2 border-glass-border rounded-lg text-text-primary focus:outline-none focus:border-primary-cosmic transition-all duration-300"
                style={{ backdropFilter: 'blur(20px)' }}
              />
            </div>

            <div className="relative">
              <label htmlFor="transitLocation" className="block text-sm font-medium text-text-secondary mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Transit Konumu
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="text"
                  id="transitLocation"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Şehir, ülke..."
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-glass-bg border-2 border-glass-border rounded-lg text-text-primary focus:outline-none focus:border-primary-cosmic transition-all duration-300"
                  style={{ backdropFilter: 'blur(20px)' }}
                />
                {isLoading && <LoaderCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary animate-spin" />}
              </div>
              {transitCoordinates && (
                <div className="text-xs text-green-400 mt-1">
                  ✓ Koordinatlar belirlendi: {transitCoordinates.lat.toFixed(4)}, {transitCoordinates.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Hesapla Butonu */}
            <div className="flex items-end">
              <button
                onClick={handleCalculateTransit}
                disabled={isCalculating}
                className="btn-premium w-full flex items-center justify-center gap-2 py-3 px-8"
              >
                {isCalculating ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Hesapla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Öneriler glass-card'ın dışında, relative container'a göre positioned */}
        {suggestions.length > 0 && (
          <ul
            className="absolute z-50 bg-card/95 backdrop-blur-lg border border-border/30 rounded-lg shadow-2xl max-h-60 overflow-auto"
            style={{
              left: '30px',
              right: '30px',
              top: 'calc(100% + 8px)',
              width: 'calc(100% - 60px)'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleLocationSelect(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors duration-200 text-text-primary border-b border-border/10 last:border-b-0"
              >
                {suggestion.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
          <p className="text-red-400">Hata: {error}</p>
        </div>
      )}

      {transitData && (
        <div className="fade-in-up" style={{ marginTop: '30px' }}>
          {/* Transit Summary */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h4 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transit Özeti - {transitData.transitDate}
            </h4>
            {transitData.comparison && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Uyumlu Açılar</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-aurora)' }}>
                    {transitData.comparison.summary.harmonious}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(251, 146, 60, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Zorlayıcı Açılar</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fb923c' }}>
                    {transitData.comparison.summary.challenging}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Toplam Açılar</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-cosmic)' }}>
                    {transitData.comparison.totalAspects}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transit Aspects */}
          {transitData.comparison && transitData.comparison.aspects && transitData.comparison.aspects.length > 0 && (
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h4 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Önemli Transit Açıları
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transitData.comparison.aspects.map((aspect: any, index: number) => (
                  <div key={index} className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {aspect.natalPlanet} ⟷ {aspect.transitPlanet}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {aspect.aspect} • Orb: {aspect.orb}° • %{aspect.exactness}
                        </div>
                      </div>
                      <span className={`aspect-badge ${aspect.type === 'harmonious' ? 'style={{ borderColor: \'var(--accent-aurora)\' }}' : aspect.type === 'challenging' ? 'style={{ borderColor: \'#fb923c\' }}' : ''}`}>
                        {aspect.type === 'harmonious' ? '✓ Uyumlu' : aspect.type === 'challenging' ? '⚠ Zorlayıcı' : '● Önemli'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transit Planets */}
          {transitData.transitChart && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Transit Gezegen Konumları
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {transitData.transitChart.planets && Object.entries(transitData.transitChart.planets).map(([planetName, planet]: [string, any]) => (
                  <div key={planetName} className="glass-card" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(138, 43, 226, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{planetName}</span>
                      {renderAspectType(planet.aspectType || 'minor')}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {translateSignName(planet.signName)} {planet.position?.longitude?.toFixed(1)}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
