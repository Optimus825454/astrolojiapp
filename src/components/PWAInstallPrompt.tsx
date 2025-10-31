'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Mobil cihaz kontrolü
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
        };

        checkMobile();

        // Eğer zaten yüklenmişse gösterme
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // localStorage'da daha önce gösterilip reddedildiyse tekrar gösterme
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            return;
        }

        // beforeinstallprompt event'i dinle
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // 2 saniye sonra prompt'u göster
            setTimeout(() => {
                setShowPrompt(true);
            }, 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Install prompt'u göster
        await deferredPrompt.prompt();

        // Kullanıcının seçimini bekle
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA yüklendi');
        } else {
            console.log('PWA yüklenmesi reddedildi');
        }

        // Prompt'u temizle
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !isMobile) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 animate-in fade-in duration-300 pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={handleDismiss}
            />

            {/* Prompt Card */}
            <div
                className="relative w-full max-w-md mb-20 pointer-events-auto animate-in slide-in-from-bottom duration-500"
                style={{
                    background: 'linear-gradient(135deg, rgba(26, 11, 46, 0.98), rgba(10, 10, 15, 0.98))',
                    borderRadius: '24px',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    boxShadow: '0 0 40px rgba(138, 43, 226, 0.5), inset 0 0 30px rgba(138, 43, 226, 0.1)',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-purple-500/20 transition-all duration-200 group"
                    aria-label="Kapat"
                >
                    <X className="w-5 h-5 text-purple-300 group-hover:text-purple-100 transition-colors" />
                </button>

                <div className="p-6 pt-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/30 blur-xl animate-pulse" />
                            <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-2xl">
                                <Smartphone className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gradient mb-2">
                            ASTROVISION Uygulamasını Yükle
                        </h3>
                        <p className="text-purple-200/80 text-sm leading-relaxed">
                            Ana ekranınıza ekleyerek daha hızlı erişim sağlayın ve mobil uygulama deneyimi yaşayın
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-3 text-sm text-purple-100/90">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>🚀 Hızlı başlatma</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-purple-100/90">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>📱 Tam ekran deneyim</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-purple-100/90">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>⚡ Çevrimdışı erişim</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-3 px-4 rounded-xl border border-purple-500/30 text-purple-200 hover:bg-purple-500/10 transition-all duration-200"
                        >
                            Daha Sonra
                        </button>
                        <button
                            onClick={handleInstall}
                            className="flex-1 btn-premium py-3 px-4 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Yükle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
