'use client';

import { useState } from 'react';
import Image from 'next/image';
import BirthInfoForm from "@/components/BirthInfoForm";
import ChartDisplay from "@/components/ChartDisplay"; // Import the new component

export default function Home() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  const handleChartCalculated = (data: any) => {
    setChartData(data);
    setError(''); // Clear previous errors
  };

  const handleReset = () => {
    setChartData(null);
    setError('');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 text-center">
      {!chartData ? (
        <>
          <div className="mb-10 flex flex-col items-center">
            {/* Logo */}
            <div className="mb-6 relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src="/logo.png"
                alt="ASTROVISION Logo"
                width={160}
                height={160}
                priority
                className="object-contain animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(138, 43, 226, 0.6))',
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              />
            </div>

            {/* App Title */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-3"
              style={{
                textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.4)',
                letterSpacing: '0.05em'
              }}
            >
              ASTROVISION
            </h2>
          </div>
          <BirthInfoForm onChartCalculated={handleChartCalculated} onError={setError} />
          <p className="text-muted mt-6 text-sm sm:text-base max-w-2xl">
            🌟 Doğum haritanızı keşfedin • ✨ AI destekli yorumlar alın • 🌙 Transitlerinizi takip edin
          </p>
          {error && <p className="mt-4 text-red-400">Hata: {error}</p>}
        </>
      ) : (
        <ChartDisplay chartData={chartData} onReset={handleReset} />
      )}
    </main>
  );
}