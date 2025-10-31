'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { MapPin, LoaderCircle } from 'lucide-react';

interface Suggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

interface LocationInputProps {
  onLocationSelect: (location: Suggestion | null) => void;
}

export default function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      onLocationSelect(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
    setIsLoading(false);
  }, [onLocationSelect]);

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    debouncedFetch(query);
    return () => {
      debouncedFetch.cancel();
    };
  }, [query, debouncedFetch]);

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.formatted);
    onLocationSelect(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <label htmlFor="location" className="block text-sm font-medium text-muted mb-1">Doğum Yeri</label>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 h-5 w-5 text-muted" />
        <input
          type="text"
          id="location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Şehir, ülke..."
          autoComplete="off"
          required
          className="pl-10 block w-full px-3 py-2 bg-transparent border-b-2 border-border/50 rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-0 focus:border-accent transition-colors duration-300"
        />
        {isLoading && <LoaderCircle className="absolute right-3 h-5 w-5 text-muted animate-spin" />}
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-card/80 backdrop-blur-lg border border-border/30 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors duration-200"
            >
              {suggestion.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
