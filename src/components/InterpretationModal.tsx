'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Loader2, Volume2, VolumeX } from 'lucide-react';

interface InterpretationModalProps {
    isOpen: boolean;
    onClose: () => void;
    interpretation: string;
    isLoading: boolean;
}

const mysteriousMessages = [
    "🌟 Kozmik enerjiler hizalanıyor...",
    "✨ Yıldızlardan mesajlar alınıyor...",
    "🔮 Doğum haritanız analiz ediliyor...",
    "🌙 Gezegenlerin konumları değerlendiriliyor...",
    "⭐ Astrolojik desenler inceleniyor...",
    "🌌 Transit etkileri hesaplanıyor...",
    "💫 Kişisel yorumunuz hazırlanıyor...",
    "🎴 Kozmik bilgiler derleniyor...",
    "🌠 Evrensel enerjiler yorumlanıyor...",
    "✨ Birazdan genel doğum haritanız hazır olacak...",
    "🔮 Olaylar bazında transit yorumunuz oluşturuluyor...",
];

export default function InterpretationModal({
    isOpen,
    onClose,
    interpretation,
    isLoading,
}: InterpretationModalProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isReading, setIsReading] = useState(false);
    const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSpeechSynthesis(window.speechSynthesis);
        }
    }, []);

    const handleTextToSpeech = () => {
        if (!speechSynthesis) return;

        if (isReading) {
            speechSynthesis.cancel();
            setIsReading(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(interpretation);
            utterance.lang = 'tr-TR';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onend = () => setIsReading(false);
            utterance.onerror = () => setIsReading(false);

            speechSynthesis.speak(utterance);
            setIsReading(true);
        }
    };

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setCurrentMessageIndex((prev) => (prev + 1) % mysteriousMessages.length);
            }, 3000); // 3 saniyede bir mesaj değişir

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden rounded-t-3xl sm:rounded-3xl border-t border-purple-500/30 sm:border border-purple-500/30 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
                style={{
                    background: 'linear-gradient(135deg, rgba(26, 11, 46, 0.98), rgba(10, 10, 15, 0.98))',
                    boxShadow: '0 -10px 60px rgba(138, 43, 226, 0.4), inset 0 0 40px rgba(138, 43, 226, 0.1)',
                }}
            >
                {/* Header - Sticky */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:p-5 md:p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400 animate-pulse" />
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gradient">
                            Kişisel Astroloji Yorumunuz
                        </h2>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={handleTextToSpeech}
                            className="p-2 rounded-full hover:bg-purple-500/20 transition-all duration-200 group"
                            aria-label={isReading ? "Okumayı Durdur" : "Sesli Oku"}
                        >
                            {isReading ? (
                                <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 group-hover:text-purple-100 transition-colors" />
                            ) : (
                                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 group-hover:text-purple-100 transition-colors" />
                            )}
                        </button>
                    )}
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto h-[calc(95vh-60px)] sm:h-auto sm:max-h-[calc(90vh-80px)] p-4 sm:p-6 md:p-8 pb-20 sm:pb-24">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-spin" />
                                <div className="absolute inset-0 blur-xl bg-purple-500/30 animate-pulse" />
                            </div>

                            <div className="text-center space-y-2 sm:space-y-3 px-4">
                                <p
                                    className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-200 animate-in fade-in slide-in-from-bottom-3 duration-500"
                                    key={currentMessageIndex}
                                >
                                    {mysteriousMessages[currentMessageIndex]}
                                </p>
                                <p className="text-xs sm:text-sm text-purple-300/70">
                                    Lütfen bekleyiniz, detaylı analiz hazırlanıyor...
                                </p>
                            </div>

                            {/* Animated dots */}
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="prose prose-invert prose-purple max-w-none animate-in fade-in slide-in-from-bottom-5 duration-700"
                            style={{
                                fontSize: '14px',
                                lineHeight: '1.7',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.3px',
                            }}
                        >
                            {interpretation.split('\n').map((paragraph, index) => (
                                paragraph.trim() && (
                                    <p
                                        key={index}
                                        className="mb-3 sm:mb-4 text-sm sm:text-base text-purple-50/90 leading-relaxed"
                                    >
                                        {paragraph}
                                    </p>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Close Button - Fixed at bottom right */}
                <button
                    onClick={onClose}
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group border border-purple-400/30"
                    aria-label="Kapat"
                    style={{
                        boxShadow: '0 0 20px rgba(138, 43, 226, 0.6)',
                    }}
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
}
