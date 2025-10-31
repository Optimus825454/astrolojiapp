/**
 * Utility functions for ChartDisplay component
 */

// Get planet icon identifier (for icon component mapping)
export const getPlanetIconId = (planetName: string): string => {
  const icons: Record<string, string> = {
    sun: "sun",
    moon: "moon",
    mercury: "circle",
    venus: "star",
    mars: "zap",
    jupiter: "star",
    saturn: "circle",
    uranus: "zap",
    neptune: "star",
    pluto: "zap",
  };
  return icons[planetName.toLowerCase()] || "circle";
};

// Get zodiac sign symbol
export const getZodiacSymbol = (signNumber: number): string => {
  const symbols = [
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
  ];
  return symbols[signNumber - 1] || "?";
};

// Get zodiac sign name
export const getZodiacSign = (signNumber: number): string => {
  const signs = [
    "Koç",
    "Boğa",
    "İkizler",
    "Yengeç",
    "Aslan",
    "Başak",
    "Terazi",
    "Akrep",
    "Yay",
    "Oğlak",
    "Kova",
    "Balık",
  ];
  return signs[signNumber - 1] || "Bilinmeyen";
};

// Translate English sign names to Turkish
export const translateSignName = (signName: string): string => {
  const translations: Record<string, string> = {
    Aries: "Koç",
    Taurus: "Boğa",
    Gemini: "İkizler",
    Cancer: "Yengeç",
    Leo: "Aslan",
    Virgo: "Başak",
    Libra: "Terazi",
    Scorpio: "Akrep",
    Sagittarius: "Yay",
    Capricorn: "Oğlak",
    Aquarius: "Kova",
    Pisces: "Balık",
  };
  return translations[signName] || signName;
};

// Calculate position data
export const calculatePosition = (position: any) => {
  if (!position) return { degree: 0, minute: 0, second: 0, longitude: 0 };
  return {
    degree: position.degrees || 0,
    minute: position.minutes || 0,
    second: position.seconds || 0,
    longitude: position.longitude || 0,
  };
};

// Format degree with minutes
export const formatDegree = (position: any): string => {
  const calc = calculatePosition(position);
  return `${calc.longitude.toFixed(1)}°`;
};

// Check if planet is retrograde
export const isRetrograde = (planet: any): boolean => {
  return planet?.retrograde === true || planet?.retrograde === "R";
};

// Type definitions
export interface ChartData {
  planets?: Record<string, any>;
  houses?: any[];
  axes?: Record<string, any>;
  aspects?: Record<string, any[]>;
  chartPatterns?: any;
  interpretations?: any;
}

export interface PlanetData {
  name: string;
  signName: string;
  position: {
    longitude: number;
    degrees?: number;
    minutes?: number;
    seconds?: number;
  };
  retrograde?: boolean;
}
