'use client';

import { useState } from 'react';
import LocationInput from './LocationInput';
import { Calendar, Clock, Sparkles, LoaderCircle } from 'lucide-react';

// Expanded LocationData to include annotations for timezone
interface LocationData {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
  annotations: {
    timezone: {
      name: string;
    };
  };
}

interface BirthInfoFormProps {
  onChartCalculated: (chart: any) => void;
  onError: (error: string) => void;
}

export default function BirthInfoForm({ onChartCalculated, onError }: BirthInfoFormProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Lütfen geçerli bir doğum yeri seçin.');
      return;
    }

    setIsCalculating(true);
    onError(''); // Clear previous errors

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time, location }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Bilinmeyen bir sunucu hatası');
      }

      onChartCalculated(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hesaplama sırasında bir hata oluştu.';
      onError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-8 p-8 bg-card backdrop-blur-lg border border-border/30 rounded-2xl shadow-2xl shadow-accent/10"
    >
      {/* Input fields remain the same */}
      <div className="relative">
        <label htmlFor="date" className="block text-sm font-medium text-muted mb-1">Doğum Tarihi</label>
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 h-5 w-5 text-muted" />
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="pl-10 block w-full px-3 py-2 bg-transparent border-b-2 border-border/50 rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-0 focus:border-accent transition-colors duration-300"
          />
        </div>
      </div>

      <div className="relative">
        <label htmlFor="time" className="block text-sm font-medium text-muted mb-1">Doğum Saati</label>
        <div className="relative flex items-center">
          <Clock className="absolute left-3 h-5 w-5 text-muted" />
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="pl-10 block w-full px-3 py-2 bg-transparent border-b-2 border-border/50 rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-0 focus:border-accent transition-colors duration-300"
          />
        </div>
      </div>

      <LocationInput onLocationSelect={setLocation as (loc: any) => void} />

      <button
        type="submit"
        disabled={isCalculating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-background bg-accent hover:scale-105 transform-gpu transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? (
          <><LoaderCircle className="h-5 w-5 animate-spin" /> Hesaplanıyor...</>
        ) : (
          <><Sparkles className="h-5 w-5" /> Haritayı Hesapla</>
        )}
      </button>
    </form>
  );
}
