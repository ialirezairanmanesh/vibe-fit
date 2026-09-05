import React, { useState, useEffect, useRef } from 'react';
import { AnimationType, ExerciseCategory } from '../types';
import { Play, Pause, RefreshCw, Maximize2, ShieldCheck, Video, Activity, AlertTriangle, Image as ImageIcon, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { getOfflineCachedMediaUrl } from '../utils/mediaCache';

interface ExerciseAnimationProps {
  type: AnimationType;
  category: ExerciseCategory;
  gifUrl?: string;
  exerciseNameEn?: string;
  className?: string;
}

type MediaType = 'youtube' | 'aparat' | 'vimeo' | 'video' | 'image';

function detectMedia(url?: string): { type: MediaType; embedUrl?: string } {
  if (!url) return { type: 'image' };

  let targetUrl = url;
  if (url.includes('/api/proxy-media')) {
    try {
      const urlObj = new URL(url, 'http://localhost');
      const paramUrl = urlObj.searchParams.get('url');
      if (paramUrl) targetUrl = paramUrl;
    } catch {
      // fallback
    }
  }

  // Data URL checks
  if (targetUrl.startsWith('data:video/')) {
    return { type: 'video' };
  }
  if (targetUrl.startsWith('data:image/')) {
    return { type: 'image' };
  }

  // YouTube match
  const ytMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1`
    };
  }

  // Aparat match
  const aparatMatch = targetUrl.match(/aparat\.com\/v\/([a-zA-Z0-9_-]+)/);
  if (aparatMatch && aparatMatch[1]) {
    return {
      type: 'aparat',
      embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame`
    };
  }

  // Vimeo match
  const vimeoMatch = targetUrl.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1&muted=1`
    };
  }

  // Direct Video file extensions
  const cleanUrl = targetUrl.split('?')[0].toLowerCase();
  if (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.includes('/video/') ||
    cleanUrl.includes('video_') ||
    cleanUrl.includes('_video')
  ) {
    return { type: 'video' };
  }

  return { type: 'image' };
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  type,
  category,
  gifUrl,
  exerciseNameEn,
  className = 'w-full h-48 sm:h-64'
}) => {
  const [urlIndex, setUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [customMediaError, setCustomMediaError] = useState(false);
  const [offlineDisplayUrl, setOfflineDisplayUrl] = useState<string>('');
  const [failedVideoUrls, setFailedVideoUrls] = useState<Set<string>>(new Set());
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Media candidates: only MuscleWiki/API gifUrl (proxied when external)
  const generateCandidates = (): string[] => {
    const urls: string[] = [];

    if (gifUrl && gifUrl.trim()) {
      if (gifUrl.startsWith('http://') || gifUrl.startsWith('https://')) {
        const proxied = `/api/proxy-media?url=${encodeURIComponent(gifUrl)}&exerciseName=${encodeURIComponent(exerciseNameEn || '')}&category=${encodeURIComponent(category || '')}`;
        urls.push(proxied);
        urls.push(gifUrl);
      } else {
        urls.push(gifUrl);
      }
    }

    return urls;
  };

  const candidateUrls = generateCandidates();
  const currentSrc = candidateUrls[urlIndex] || candidateUrls[0];
  const mediaInfo = detectMedia(currentSrc);
  const isCurrentVideo = mediaInfo.type === 'video' && !failedVideoUrls.has(currentSrc);

  useEffect(() => {
    setIsVideoLoaded(false);
  }, [currentSrc]);

  useEffect(() => {
    let isCancelled = false;
    if (currentSrc) {
      console.log('[ExerciseAnimation] Initializing media load:', {
        type,
        category,
        gifUrl,
        exerciseNameEn,
        currentSrc,
        urlIndex,
        candidateUrls
      });
      setOfflineDisplayUrl(currentSrc);
      getOfflineCachedMediaUrl(currentSrc).then((resolvedUrl) => {
        if (!isCancelled) {
          console.log('[ExerciseAnimation] getOfflineCachedMediaUrl resolved:', resolvedUrl);
          setOfflineDisplayUrl(resolvedUrl || currentSrc);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [currentSrc]);

  useEffect(() => {
    setUseCanvasFallback(false);
    setCustomMediaError(false);
    setUrlIndex(0);
  }, [type, gifUrl, exerciseNameEn]);

  useEffect(() => {
    if (isCurrentVideo && currentSrc && !isVideoLoaded) {
      // Video safety watchdog: if video element fails to buffer or render dimensions within 6s, switch to GIF image mode
      const videoSafetyTimer = setTimeout(() => {
        if (!isVideoLoaded && !failedVideoUrls.has(currentSrc)) {
          console.warn('[ExerciseAnimation] Video playback watchdog triggered: video stream stalled or unplayable. Auto switching to GIF.');
          setFailedVideoUrls((prev) => new Set(prev).add(currentSrc));
        }
      }, 6000);

      return () => clearTimeout(videoSafetyTimer);
    }
  }, [isCurrentVideo, currentSrc, isVideoLoaded, failedVideoUrls]);

  useEffect(() => {
    if (currentSrc && currentSrc.startsWith('data:')) {
      setIsLoading(false);
      setUseCanvasFallback(false);
      setCustomMediaError(false);
      return;
    }

    if (mediaInfo.type === 'youtube' || mediaInfo.type === 'aparat' || mediaInfo.type === 'vimeo') {
      setIsLoading(false);
      setUseCanvasFallback(false);
      setCustomMediaError(false);
      return;
    }

    setIsLoading(true);

    // Timeout safety: dismiss spinner after 3.5s if media takes long to trigger events
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [currentSrc, mediaInfo.type, isCurrentVideo]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn('[ExerciseAnimation] Video playback error for:', currentSrc);
    if (currentSrc && !failedVideoUrls.has(currentSrc)) {
      setFailedVideoUrls((prev) => new Set(prev).add(currentSrc));
    }
    handleImageError(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>) => {
    console.warn('[ExerciseAnimation] Media load failed:', {
      currentSrc,
      offlineDisplayUrl,
      urlIndex,
      candidateUrls,
      errorEvent: e
    });

    // If a modified/blob URL failed, revert to original currentSrc first
    if (offlineDisplayUrl && offlineDisplayUrl !== currentSrc) {
      console.log('[ExerciseAnimation] Reverting from failed blob URL to original currentSrc:', currentSrc);
      setOfflineDisplayUrl(currentSrc);
      return;
    }

    // Try next candidate URL if available
    if (urlIndex < candidateUrls.length - 1) {
      const nextIdx = urlIndex + 1;
      console.log(`[ExerciseAnimation] Trying candidate URL #${nextIdx}:`, candidateUrls[nextIdx]);
      setUrlIndex(nextIdx);
      return;
    }

    // If custom gifUrl was specified and all candidates failed
    if (gifUrl && urlIndex === 0 && candidateUrls.length === 1) {
      console.warn('[ExerciseAnimation] Custom gifUrl failed and no candidate fallbacks available.');
      setCustomMediaError(true);
      setIsLoading(false);
      return;
    }

    console.warn('[ExerciseAnimation] All candidate URLs failed. Switching to Canvas procedural fallback.');
    setIsLoading(false);
    setUseCanvasFallback(true);
  };

  const handleImageLoad = () => {
    console.log('[ExerciseAnimation] Media loaded successfully:', offlineDisplayUrl || currentSrc);
    setIsVideoLoaded(true);
    setIsLoading(false);
    setUseCanvasFallback(false);
    setCustomMediaError(false);
  };

  const handleDownloadMedia = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentSrc) return;

    try {
      const ext = mediaInfo.type === 'video' ? 'mp4' : 'gif';
      const cleanName = (exerciseNameEn || type || 'exercise')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      const filename = `${cleanName}.${ext}`;

      if (currentSrc.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = currentSrc;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(currentSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.warn('Direct download fallback:', err);
      const link = document.createElement('a');
      link.href = currentSrc;
      link.target = '_blank';
      link.download = `${exerciseNameEn || type || 'exercise'}-media`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Canvas 2D fallback animation loop
  useEffect(() => {
    if (!useCanvasFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const render = () => {
      t += isPaused ? 0 : 0.04;
      const progress = (Math.sin(t) + 1) / 2;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f0f0f');
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Tech Grid
      ctx.strokeStyle = 'rgba(209, 255, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // Color scheme
      const muscleAccent = '#D1FF00'; // Neon Lime active muscle
      const bodyColor = '#a3a3a3'; // Neutral body
      const eqColor = '#38bdf8'; // Equipment sky blue

      ctx.save();

      // Simple, highly recognizable vector motion graphics
      if (type.includes('press') || type.includes('fly') || type.includes('pullover')) {
        // Bench
        ctx.fillStyle = '#262626';
        ctx.fillRect(centerX - 60, centerY + 25, 120, 10);

        // Figure
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(centerX - 40, centerY + 12, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(centerX - 30, centerY + 6, 60, 18);

        // Active Chest Muscle Glow
        ctx.fillStyle = muscleAccent;
        ctx.shadowColor = muscleAccent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(centerX - 10, centerY + 10, 14 - progress * 4, 8 + progress * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Weights
        const pressY = centerY - 10 - progress * 40;
        ctx.fillStyle = eqColor;
        ctx.fillRect(centerX - 25, pressY - 6, 18, 10);
        ctx.fillRect(centerX + 10, pressY - 6, 18, 10);

        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY + 10);
        ctx.lineTo(centerX - 16, pressY);
        ctx.moveTo(centerX + 5, centerY + 10);
        ctx.lineTo(centerX + 16, pressY);
        ctx.stroke();
      } else if (type.includes('curl')) {
        // Standing figure for curls
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 45, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(centerX - 12, centerY - 30, 24, 55);

        // Arm & Bicep
        const shoulderX = centerX + 10;
        const shoulderY = centerY - 25;
        const elbowX = shoulderX + 4;
        const elbowY = shoulderY + 28;

        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.stroke();

        // Bicep contraction
        ctx.fillStyle = muscleAccent;
        ctx.shadowColor = muscleAccent;
        ctx.shadowBlur = 10 + progress * 6;
        ctx.beginPath();
        ctx.ellipse(shoulderX + 2, shoulderY + 14, 8 + progress * 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Forearm
        const curlAngle = Math.PI / 2 + progress * (Math.PI * 0.65);
        const handX = elbowX + Math.cos(curlAngle) * 28;
        const handY = elbowY - Math.sin(curlAngle) * 28;

        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Weight
        ctx.fillStyle = eqColor;
        ctx.beginPath();
        ctx.arc(handX, handY, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (type.includes('squat') || type.includes('leg') || type.includes('calf')) {
        const squatY = centerY + progress * 25;

        // Barbell
        ctx.fillStyle = eqColor;
        ctx.fillRect(centerX - 55, squatY - 28, 110, 7);

        // Figure
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(centerX, squatY - 38, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(centerX - 10, squatY - 24, 20, 36);

        // Active Leg Muscle
        ctx.fillStyle = muscleAccent;
        ctx.shadowColor = muscleAccent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(centerX - 8, squatY + 20, 6, 12, 0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 8, squatY + 20, 6, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, squatY + 12);
        ctx.lineTo(centerX - 18, squatY + 30);
        ctx.lineTo(centerX - 14, height - 15);
        ctx.moveTo(centerX + 8, squatY + 12);
        ctx.lineTo(centerX + 18, squatY + 30);
        ctx.lineTo(centerX + 14, height - 15);
        ctx.stroke();
      } else {
        // Generic upper/lower body exercise motion
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 35, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(centerX - 12, centerY - 18, 24, 48);

        ctx.fillStyle = muscleAccent;
        ctx.shadowColor = muscleAccent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5 - progress * 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Legend
      ctx.fillStyle = '#D1FF00';
      ctx.font = 'bold 10px Vazirmatn, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('شبیه‌ساز گرافیکی اجرای حرکت', width - 10, 18);

      animFrame = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 320;
        canvas.height = canvas.parentElement.clientHeight || 200;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [useCanvasFallback, type, isPaused]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0d0d0d] group shadow-xl ${className}`}>
      {/* Loading Overlay */}
      {isLoading && !useCanvasFallback && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0d0d]/90 backdrop-blur-sm p-4 text-center">
          <div className="w-8 h-8 border-3 border-[#D1FF00]/20 border-t-[#D1FF00] rounded-full animate-spin mb-2"></div>
          <span className="text-xs font-bold text-neutral-300">در حال دریافت ویدیوی حرکت...</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1">CDN: jsdelivr / exercises-dataset</span>
        </div>
      )}

      {/* Main Content Area */}
      {useCanvasFallback ? (
        /* Canvas Procedural Animation */
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="block w-full h-full" />
          <div className="absolute top-2.5 right-2.5 z-10 bg-[#0a0a0a]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-800 text-[11px] font-bold text-[#D1FF00] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>پویانمایی شبیه‌ساز (آفلاین)</span>
          </div>

          <button
            onClick={() => {
              setUseCanvasFallback(false);
              setIsLoading(true);
              setUrlIndex(0);
            }}
            className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 text-[10px] font-bold text-neutral-300 hover:text-[#D1FF00] flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            تلاش مجدد دریافت GIF
          </button>
        </div>
      ) : customMediaError ? (
        /* Error Overlay for Custom Media */
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">امکان بارگیری تصویر یا ویدیوی اختصاصی وجود ندارد</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
              ممکن است لینک وارد شده مسدود باشد یا پسوند فایل معتبر نباشد. می‌توانید فایل دیگری آپلود کنید یا به گیف اصلی بازگردید.
            </p>
          </div>
          <button
            onClick={() => {
              setCustomMediaError(false);
              if (candidateUrls.length > 1) {
                setUrlIndex(1);
              } else {
                setUseCanvasFallback(true);
              }
            }}
            className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D1FF00]" />
            <span>نمایش گیف هوشمند اصلی</span>
          </button>
        </div>
      ) : (
        /* Media Container (Image / Video / Embed) */
        <div className="relative w-full h-full flex items-center justify-center bg-[#080808]">
          {mediaInfo.type === 'youtube' || mediaInfo.type === 'aparat' || mediaInfo.type === 'vimeo' ? (
            <iframe
              src={mediaInfo.embedUrl}
              title="Exercise Demonstration Video"
              className="w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleImageLoad}
            />
          ) : isCurrentVideo ? (
            <video
              src={offlineDisplayUrl || currentSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls
              onLoadedData={handleImageLoad}
              onCanPlay={handleImageLoad}
              onLoadedMetadata={handleImageLoad}
              onPlay={handleImageLoad}
              onError={handleVideoError}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isPaused ? 'opacity-50 grayscale' : 'opacity-100'
              }`}
            />
          ) : (
            <img
              src={offlineDisplayUrl || currentSrc}
              alt="Exercise Demonstration GIF"
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isPaused ? 'opacity-50 grayscale' : 'opacity-100'
              }`}
            />
          )}

          {/* Top Left Media Action Buttons (Download & Direct Link) */}
          {currentSrc && mediaInfo.type !== 'youtube' && mediaInfo.type !== 'aparat' && mediaInfo.type !== 'vimeo' && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
              <button
                onClick={handleDownloadMedia}
                className="bg-[#0a0a0a]/90 hover:bg-neutral-800 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-800 text-[11px] font-bold text-slate-200 hover:text-[#D1FF00] flex items-center gap-1.5 transition shadow-lg group/dl"
                title="دانلود عکس/گیف/ویدیوی این حرکت"
              >
                <Download className="w-3.5 h-3.5 text-[#D1FF00] group-hover/dl:scale-110 transition-transform" />
                <span className="hidden sm:inline">دانلود</span>
              </button>

              <button
                onClick={() => {
                  const targetUrl = offlineDisplayUrl || currentSrc;
                  window.open(targetUrl, '_blank', 'noopener,noreferrer');
                }}
                className="bg-[#0a0a0a]/90 hover:bg-neutral-800 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-800 text-[11px] font-bold text-[#D1FF00] flex items-center gap-1.5 transition shadow-lg"
                title="باز کردن فایل مستقیم گیف انیمیشن حرکت در تب جدید مرورگر"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>لینک فایل</span>
              </button>
            </div>
          )}

          {/* Top Source Badge */}
          <div className="absolute top-2.5 right-2.5 z-10 bg-[#0a0a0a]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-800 text-[11px] font-bold text-[#D1FF00] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D1FF00] animate-pulse"></span>
            <span>
              {gifUrl && currentSrc === gifUrl
                ? mediaInfo.type === 'youtube' || mediaInfo.type === 'aparat' || mediaInfo.type === 'video'
                  ? '🎬 ویدیوی اختصاصی شما'
                  : '🖼️ تصویر/گیف اختصاصی شما'
                : 'کتابخانه آفلاین حرکات'}
            </span>
          </div>

          {/* Bottom Left Controls */}
          {(mediaInfo.type === 'image' || mediaInfo.type === 'video') && (
            <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-[#0a0a0a]/85 backdrop-blur-md p-1 rounded-xl border border-neutral-800">
              {mediaInfo.type === 'image' && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-[#D1FF00] hover:bg-neutral-800 transition"
                  title={isPaused ? 'پخش' : 'توقف'}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={handleDownloadMedia}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-[#D1FF00] hover:bg-neutral-800 transition"
                title="دانلود این عکس/ویدیو"
              >
                <Download className="w-4 h-4" />
              </button>

              {mediaInfo.type === 'image' && (
                <button
                  onClick={() => setUseCanvasFallback(true)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-[#D1FF00] hover:bg-neutral-800 transition text-[10px] font-bold flex items-center gap-1"
                  title="تغییر به حالت شبیه‌ساز"
                >
                  <Activity className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-[#D1FF00] hover:bg-neutral-800 transition"
                title="بزرگنمایی"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen GIF/Video Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-[#121212] border border-neutral-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-[#D1FF00] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {isCurrentVideo ? 'نمایش باکیفیت ویدیوی حرکت' : 'نمایش باکیفیت گیف حرکت'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMedia}
                  className="px-3 py-1 rounded-xl bg-[#D1FF00]/15 hover:bg-[#D1FF00]/25 text-xs text-[#D1FF00] border border-[#D1FF00]/30 font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isCurrentVideo ? 'دانلود ویدیو' : 'دانلود گیف انیمیشن'}</span>
                </button>
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="px-3 py-1 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 font-bold"
                >
                  بستن ×
                </button>
              </div>
            </div>
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {isCurrentVideo ? (
                <video
                  src={offlineDisplayUrl || currentSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  onLoadedData={handleImageLoad}
                  onCanPlay={handleImageLoad}
                  onError={handleVideoError}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={offlineDisplayUrl || currentSrc}
                  alt="Full size GIF"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
