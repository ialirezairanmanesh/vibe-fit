import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, WifiOff, HardDriveDownload, ExternalLink, Laptop, Info, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is in standalone mode
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    // Detect if embedded in iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isAppleDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIos(isAppleDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setInstalledSuccess(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    // Check service worker registration state
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDirectInstall = async () => {
    // 1. If deferredPrompt is available (native browser install prompt ready)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.error('Install prompt failed:', err);
      }
    }

    // 2. If in iframe, open standalone tab where beforeinstallprompt can fire natively
    if (isInIframe) {
      window.open(window.location.href, '_blank');
      setShowInstallGuideModal(true);
      return;
    }

    // 3. Fallback to guide modal for iOS or manual install
    setShowInstallGuideModal(true);
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  // Do not render banner if already in installed standalone mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-black border border-[#D1FF00]/40 rounded-3xl p-4 my-3 text-neutral-100 shadow-2xl relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D1FF00]/10 rounded-full blur-2xl pointer-events-none" />

      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 left-3 text-neutral-400 hover:text-neutral-100 p-1.5 rounded-full hover:bg-neutral-800/80 transition"
        title="بستن"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3.5 pr-1">
        <div className="w-12 h-12 rounded-2xl bg-[#D1FF00]/15 border border-[#D1FF00]/40 flex items-center justify-center text-[#D1FF00] shrink-0 mt-0.5">
          <HardDriveDownload className="w-6 h-6 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-sm text-neutral-100 tracking-tight">
              نصب نسخه آفلاین اپلیکیشن (PWA)
            </h3>
            {isOfflineReady && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                آفلاین و آماده
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
            با نصب برنامه روی گوشی یا کامپیوتر، بدون نیاز به اینترنت به برنامه‌های ورزشی و ویدیوهای حرکات دسترسی خواهید داشت.
          </p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDirectInstall}
              className="py-2.5 px-4 rounded-xl bg-[#D1FF00] hover:bg-[#b8e600] active:scale-95 text-[#0A0A0A] font-black text-xs flex items-center gap-2 shadow-lg shadow-[#D1FF00]/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>نصب مستقیم برنامه (PWA)</span>
            </button>

            {isInIframe && (
              <button
                onClick={handleOpenNewTab}
                className="py-2.5 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="باز کردن مستقیم در صفحه جدید مرورگر"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D1FF00]" />
                <span>باز کردن در تب جدید</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive PWA Installation Guide Modal */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 max-w-md w-full text-right shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto dir-rtl">
            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 left-4 text-neutral-400 hover:text-white p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D1FF00]/20 border border-[#D1FF00]/40 flex items-center justify-center text-[#D1FF00] shrink-0">
                <HardDriveDownload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">راهنمای نصب نسخه مستقل آفلاین</h4>
                <p className="text-xs text-neutral-400 mt-0.5">روی تمامی گوشی‌ها و سیستم‌عامل‌ها</p>
              </div>
            </div>

            {/* Direct Open in New Tab Button inside modal */}
            {isInIframe && (
              <div className="p-3 bg-neutral-800/80 border border-[#D1FF00]/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D1FF00]">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>برنامه در کادر پیش‌نمایش قرار دارد</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  برای فعال‌سازی دکمه نصب مستقیم مرورگر، ابتدا برنامه را در یک تب مجزا باز کنید:
                </p>
                <button
                  onClick={handleOpenNewTab}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow hover:bg-[#b8e600] transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>باز کردن در تب جدید مرورگر</span>
                </button>
              </div>
            )}

            {/* Direct Prompt trigger if available inside modal */}
            {deferredPrompt && (
              <button
                onClick={handleDirectInstall}
                className="w-full py-3 rounded-2xl bg-[#D1FF00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D1FF00]/20 hover:bg-[#b8e600] transition"
              >
                <Download className="w-4 h-4" />
                <span>کلیک برای نصب مستقیم در مرورگر</span>
              </button>
            )}

            {/* Platform Guides */}
            <div className="space-y-4 pt-1">
              {/* Android Guide */}
              <div className="p-3.5 bg-neutral-800/50 border border-neutral-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                  <span>نصب در گوشی‌های اندروید (Chrome / Samsung Internet)</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-neutral-300 space-y-1.5 leading-relaxed pr-1">
                  <li>روی منوی ۳ نقطه بالا سمت راست مرورگر کلیک کنید.</li>
                  <li>گزینه <strong className="text-white">"نصب برنامه" (Install App)</strong> یا <strong className="text-white">"افزودن به صفحه اصلی" (Add to Home screen)</strong> را بزنید.</li>
                  <li>در پنجره باز شده دکمه Install را تایید کنید.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="p-3.5 bg-neutral-800/50 border border-neutral-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span>نصب در آیفون و آیپد (iOS - Safari)</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-neutral-300 space-y-1.5 leading-relaxed pr-1">
                  <li>برنامه را در مرورگر Safari باز کنید.</li>
                  <li>در پایین صفحه دکمه <strong className="text-white">اشتراک‌گذاری (Share)</strong> <Share className="w-3 h-3 inline mx-0.5 text-amber-400" /> را بزنید.</li>
                  <li>گزینه <strong className="text-white">"Add to Home Screen" (افزودن به صفحه اصلی)</strong> <PlusSquare className="w-3 h-3 inline mx-0.5 text-amber-400" /> را انتخاب کنید.</li>
                </ol>
              </div>

              {/* PC / Laptop Guide */}
              <div className="p-3.5 bg-neutral-800/50 border border-neutral-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-sky-400">
                  <Laptop className="w-4 h-4" />
                  <span>نصب در ویندوز و مک (Chrome / Edge)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  در آدرس‌بار مرورگر روی آیکون کوچک <strong className="text-white">نصب (Install)</strong> در سمت راست کادر نوار آدرس کلیک کنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition"
            >
              متوجه شدم و بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

