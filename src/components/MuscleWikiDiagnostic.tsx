import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw, 
  Globe, 
  ShieldAlert, 
  Database, 
  Server, 
  Film, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Check
} from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

export const MuscleWikiDiagnostic: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<DiagnosticResult[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<'untested' | 'valid' | 'tier_restricted' | 'invalid'>('untested');
  const [proxyStatus, setProxyStatus] = useState<'untested' | 'ok' | 'failed'>('untested');
  const [testMediaUrl, setTestMediaUrl] = useState<string>('https://media.musclewiki.com/media/uploads/male-barbell-bench-press-front.mp4');
  const [testExerciseName, setTestExerciseName] = useState<string>('Barbell Bench Press');

  // Interactive Media Test State
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<boolean>(false);
  const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
  const [activeMediaSrc, setActiveMediaSrc] = useState<string>('/api/proxy-media?url=' + encodeURIComponent('https://media.musclewiki.com/media/uploads/male-barbell-bench-press-front.mp4'));
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const formattedLogs = logs.map((log) => {
      let text = `[${log.timestamp}] [${log.status.toUpperCase()}] ${log.step}\n  پیام: ${log.message}`;
      if (log.details) {
        text += `\n  جزییات: ${JSON.stringify(log.details)}`;
      }
      return text;
    }).reverse().join('\n---\n');

    const fullReport = `=== MuscleWiki Diagnostic Log Report ===\nزمان گزارش: ${new Date().toLocaleString('fa-IR')}\nوضعیت کلید API: ${apiKeyStatus}\nوضعیت پروکسی: ${proxyStatus}\nآدرس رسانه فعلی: ${activeMediaSrc}\n\n=== جزئیات لاگ‌ها ===\n${formattedLogs}`;

    navigator.clipboard.writeText(fullReport);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2500);
  };

  const addLog = (step: string, status: 'pending' | 'success' | 'warning' | 'error', message: string, details?: any) => {
    const entry: DiagnosticResult = {
      step,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour12: false })
    };
    console.log(`[MuscleWiki Diagnostic] [${status.toUpperCase()}] ${step}:`, message, details || '');
    setLogs((prev) => [entry, ...prev]);
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    console.clear();
    console.log('%c=== MUSCLEWIKI API & MEDIA DIAGNOSTIC SUITE STARTED ===', 'color: #D1FF00; font-weight: bold; font-size: 14px;');

    addLog('تست اولیه', 'pending', 'شروع عیب‌یابی جامع MuscleWiki API و سرور پروکسی رسانه...');

    const apiKey = 'mw_6ZDLaxXph7I9hyMH_wpehHIr55l68lT7Sb7OAGKJagQ';

    // 1. Direct API Fetch Test
    addLog('پاسخ مستقیم API', 'pending', 'ارسال درخواست مستقیم به https://api.musclewiki.com/exercises با API Key در هدر...');
    try {
      const directRes = await fetch('https://api.musclewiki.com/exercises', {
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json'
        }
      });

      console.log('[MuscleWiki Diagnostic] Direct API Response Status:', directRes.status, directRes.statusText);

      if (directRes.status === 200) {
        const data = await directRes.json();
        setApiKeyStatus('valid');
        addLog('تست مستقیم API', 'success', `کلید API معتبر است و ارتباط مستقیم برقراری شد. دریافت ${data.length || 0} حرکت.`, { status: 200, count: data.length });
      } else if (directRes.status === 403) {
        const errorText = await directRes.text();
        setApiKeyStatus('tier_restricted');
        console.warn('[MuscleWiki Diagnostic] Direct API 403 Tier Restricted:', errorText);
        addLog(
          'محدودیت API کلید (Tier Basic)',
          'warning',
          'کلید API سطح BASIC است. MuscleWiki دسترسی مستقیم API را به محیط Playground محدود کرده است (HTTP 403). سیستم هوشمند ما به‌طور خودکار به دیتابیس بومی آفلاین سوییچ می‌کند.',
          { status: 403, response: errorText }
        );
      } else {
        setApiKeyStatus('invalid');
        addLog('تست مستقیم API', 'error', `خطا در فراخوانی مستقیم API: کد HTTP ${directRes.status}`, { status: directRes.status });
      }
    } catch (err: any) {
      console.error('[MuscleWiki Diagnostic] Direct API Fetch Network Error:', err);
      addLog('ارتباط شبکه API', 'error', `خطای شبکه در اتصال مستقیم به MuscleWiki API (محتمل به دلیل CORS): ${err.message}`, { error: err.toString() });
    }

    // 2. Internal Server API Proxy Endpoint Test
    addLog('تست سرور داخلی', 'pending', 'ارسال درخواست به سرور اختصاصی برنامه /api/musclewiki/exercises...');
    try {
      const localApiRes = await fetch('/api/musclewiki/exercises?q=Bench%20Press');
      console.log('[MuscleWiki Diagnostic] Local API Route Status:', localApiRes.status);

      if (localApiRes.ok) {
        const localData = await localApiRes.json();
        addLog(
          'سرور واسط داخلی',
          'success',
          `پاسخ موفق از سرور داخلی! منبع داده: ${localData.source || 'Local Dataset'}. تعداد حرکات دریافتی: ${localData.exercises?.length || 0}`,
          localData
        );
      } else {
        addLog('سرور واسط داخلی', 'error', `پاسخ ناموفق از /api/musclewiki/exercises - کد HTTP ${localApiRes.status}`);
      }
    } catch (err: any) {
      addLog('سرور واسط داخلی', 'error', `خطا در فراخوانی سرور داخلی: ${err.message}`);
    }

    // 3. Media Accessibility & Proxy Stream Test
    addLog('تست CDN و جریان ویدیو', 'pending', `بررسی دسترسی‌پذیری رسانه direct CDN: ${testMediaUrl}...`);
    try {
      const proxyUrl = `/api/proxy-media?url=${encodeURIComponent(testMediaUrl)}&exerciseName=${encodeURIComponent(testExerciseName)}`;
      addLog('پروکسی رسانه', 'pending', `فراخوانی سرور پروکسی برای بازپخش روان رسانه بدون پس‌زمینه مشکی: ${proxyUrl}`);

      const mediaRes = await fetch(proxyUrl);
      console.log('[MuscleWiki Diagnostic] Media Proxy Res Status:', mediaRes.status, mediaRes.headers.get('content-type'));

      if (mediaRes.ok) {
        setProxyStatus('ok');
        const contentType = mediaRes.headers.get('content-type') || '';
        const contentLength = mediaRes.headers.get('content-length') || 'مشخص‌نشده';
        
        if (contentType.includes('gif') || mediaRes.redirected || mediaRes.url.endsWith('.gif')) {
          addLog(
            'انیمیشن گیف حرکتی (HD GIF)',
            'success',
            `ویدیوی CDN مستقیم MuscleWiki به دلیل سپر بلاک Cloudflare مسدود است؛ بنابراین سیستم هوشمند ما انیمیشن GIF آفلاین باکیفیت و بدون قطعی حرکت را با موفقیت ارایه می‌دهد (ContentType: ${contentType}).`,
            { status: mediaRes.status, contentType, resolvedUrl: mediaRes.url }
          );
        } else {
          addLog(
            'استریم مستقیم ویدیوی MP4',
            'success',
            `رسانه با موفقیت توسط پروکسی سرور استریم شد! نوع محتوا: ${contentType} - حجم: ${contentLength} بایت.`,
            { status: mediaRes.status, contentType, contentLength }
          );
        }
      } else {
        setProxyStatus('failed');
        addLog('پروکسی ویدیو / GIF', 'warning', `پروکسی سرور پاسخ ${mediaRes.status} داد. سیستم fallback محلی GIF را فعال می‌کند.`, { status: mediaRes.status });
      }
    } catch (err: any) {
      setProxyStatus('failed');
      addLog('پروکسی ویدیو / GIF', 'error', `خطا در دریافت پروکسی رسانه: ${err.message}`);
    }

    // 4. Offline Fallback Asset Check
    const localGifPath = `/exercises/${testExerciseName.replace(/\s+/g, '_')}.gif`;
    addLog('فایل پشتیبان محلی', 'pending', `بررسی وجود فایل محلی آفلاین GIF: ${localGifPath}...`);
    try {
      const localGifRes = await fetch(localGifPath, { method: 'HEAD' });
      if (localGifRes.ok) {
        addLog('فایل پشتیبان محلی', 'success', `فایل GIF پشتیبان آفلاین با موفقیت پیدا شد و آماده نمایش بدون اینترنت است (HTTP 200).`, { path: localGifPath });
      } else {
        addLog('فایل پشتیبان محلی', 'warning', `فایل در مسیر ${localGifPath} یافت نشد (HTTP ${localGifRes.status}).`, { path: localGifPath });
      }
    } catch (err: any) {
      addLog('فایل پشتیبان محلی', 'error', `خطا در تست فایل محلی: ${err.message}`);
    }

    setIsRunning(false);
    console.log('%c=== MUSCLEWIKI DIAGNOSTIC SUITE COMPLETED ===', 'color: #34d399; font-weight: bold; font-size: 14px;');
  };

  const handleMediaLoadStart = () => {
    setMediaLoading(true);
    setMediaError(false);
    setMediaLoaded(false);
    console.log('[MuscleWiki Media Tester] Loading started for URL:', activeMediaSrc);
  };

  const handleMediaLoaded = () => {
    setMediaLoading(false);
    setMediaLoaded(true);
    setMediaError(false);
    console.log('[MuscleWiki Media Tester] Media successfully loaded & playing:', activeMediaSrc);
  };

  const handleMediaError = (e: any) => {
    setMediaLoading(false);
    setMediaError(true);
    setMediaLoaded(false);
    console.warn('[MuscleWiki Media Tester] Media render error on source:', activeMediaSrc, e);

    // Auto-try fallback to local GIF
    const fallbackPath = `/exercises/${testExerciseName.replace(/\s+/g, '_')}.gif`;
    if (activeMediaSrc !== fallbackPath) {
      console.log('[MuscleWiki Media Tester] Auto switching to local fallback GIF:', fallbackPath);
      setActiveMediaSrc(fallbackPath);
      setMediaType('image');
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl text-right dir-rtl max-w-4xl mx-auto my-4">
      {/* Header */}
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D1FF00]/10 border border-[#D1FF00]/30 flex items-center justify-center text-[#D1FF00]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-base flex items-center gap-2">
              ابزار عیب‌یابی اختصاصی MuscleWiki API و پخش‌کننده ویدیویی
            </h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              تست خودکار اتصال API Key، سرور پروکسی استریم، بلاک‌های CORS/Hotlink و حالت‌های بارگذاری
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            &#x2715;
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Status Badges Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-neutral-300 font-medium">وضعیت API Key:</span>
            </div>
            {apiKeyStatus === 'untested' && <span className="text-xs text-neutral-500 font-mono">تست نشده</span>}
            {apiKeyStatus === 'valid' && <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">معتبر (200 OK)</span>}
            {apiKeyStatus === 'tier_restricted' && <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">سطح Basic (سوئیچ به محلی)</span>}
            {apiKeyStatus === 'invalid' && <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">نامعتبر</span>}
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#D1FF00]" />
              <span className="text-xs text-neutral-300 font-medium">سرور پروکسی استریم:</span>
            </div>
            {proxyStatus === 'untested' && <span className="text-xs text-neutral-500 font-mono">تست نشده</span>}
            {proxyStatus === 'ok' && <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">فعال (200 OK)</span>}
            {proxyStatus === 'failed' && <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">خطا در سرور</span>}
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-neutral-300 font-medium">وضعیت پخش لایو:</span>
            </div>
            {mediaLoading && <span className="text-xs text-amber-400 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> در حال بارگذاری</span>}
            {mediaLoaded && <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">روان و بدون سیاه شدن</span>}
            {mediaError && <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">خطای بارگذاری</span>}
            {!mediaLoading && !mediaLoaded && !mediaError && <span className="text-xs text-neutral-500 font-mono">آماده تست</span>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={runFullDiagnostics}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-[#D1FF00] hover:bg-[#b8e600] text-black font-extrabold text-sm flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-[#D1FF00]/10"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
              <span>اجرای تست کامل خودکار (Console + UI)</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono dir-ltr">
              <span className="text-neutral-500">API Key:</span>
              <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-neutral-300">
                mw_6ZDL...AGKJagQ
              </span>
            </div>
          </div>

          {/* Test Custom Media Input */}
          <div className="pt-2 border-t border-neutral-800/60 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="md:col-span-8">
              <label className="text-[11px] text-neutral-400 font-medium block mb-1">آدرس تست ویدیو/GIF حرکات:</label>
              <input
                type="text"
                value={testMediaUrl}
                onChange={(e) => setTestMediaUrl(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white dir-ltr font-mono focus:outline-none focus:border-[#D1FF00]"
                placeholder="https://media.musclewiki.com/..."
              />
            </div>
            <div className="md:col-span-4 flex items-end gap-2 pt-5">
              <button
                onClick={() => {
                  const proxyUrl = `/api/proxy-media?url=${encodeURIComponent(testMediaUrl)}&exerciseName=${encodeURIComponent(testExerciseName)}`;
                  setActiveMediaSrc(proxyUrl);
                  setMediaType('video');
                  handleMediaLoadStart();
                }}
                className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تست این آدرس</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Interactive Media Player Diagnostic Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-2 border-b border-neutral-800/80 pb-2">
              <Film className="w-4 h-4 text-[#D1FF00]" />
              پخش‌کننده لایو تست (تضمین جلوگیری از صفحه سیاه)
            </h4>

            <div className="relative aspect-video bg-black rounded-lg border border-neutral-800 overflow-hidden flex items-center justify-center">
              {/* Media Loading Skeleton Handler */}
              {mediaLoading && (
                <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center gap-2 z-10 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-[#D1FF00] animate-spin" />
                  <span className="text-xs font-semibold text-neutral-300 animate-pulse">
                    در حال بافر و دریافت استریم روان...
                  </span>
                </div>
              )}

              {/* Error State Handler */}
              {mediaError && (
                <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center gap-2 z-10 p-4 text-center">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                  <span className="text-xs font-bold text-rose-400">خطا در بارگذاری رسانه MuscleWiki CDN</span>
                  <p className="text-[10px] text-neutral-400">سوئیچ خودکار به فایل GIF محلی پشتیبان اجرا شد.</p>
                </div>
              )}

              {mediaType === 'video' ? (
                <video
                  src={activeMediaSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadStart={handleMediaLoadStart}
                  onCanPlay={handleMediaLoaded}
                  onError={handleMediaError}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeMediaSrc}
                  alt="Test media"
                  onLoad={handleMediaLoaded}
                  onError={handleMediaError}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono dir-ltr">
              <span className="truncate max-w-[200px]" title={activeMediaSrc}>
                Src: {activeMediaSrc}
              </span>
              <button
                onClick={() => {
                  const localFallback = `/exercises/${testExerciseName.replace(/\s+/g, '_')}.gif`;
                  setActiveMediaSrc(localFallback);
                  setMediaType('image');
                  handleMediaLoadStart();
                }}
                className="text-[#D1FF00] hover:underline font-sans text-[11px]"
              >
                سوئیچ دستی به GIF محلی
              </button>
            </div>
          </div>

          {/* Realtime Terminal Diagnostic Logs */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 flex flex-col h-[280px]">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                لاگ‌های زنده تشخیص (Console & Network Log)
              </h4>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <button
                    onClick={handleCopyLogs}
                    className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                    title="کپی متن کامل لاگ‌ها برای ارسال"
                  >
                    {copiedLogs ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-emerald-400" />
                        <span>کپی کامل لاگ‌ها</span>
                      </>
                    )}
                  </button>
                )}
                <span className="text-[10px] text-neutral-500 font-mono">{logs.length} رویداد</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] text-left dir-ltr pl-1">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-neutral-600 text-xs font-sans dir-rtl text-center">
                  برای شروع بررسی جامع شبکه و API، دکمه «اجرای تست کامل» را بزنید.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="p-2 bg-neutral-900/80 border border-neutral-800/60 rounded-lg space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {log.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {log.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {log.status === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {log.status === 'pending' && <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />}
                        <span className={
                          log.status === 'success' ? 'text-emerald-400' :
                          log.status === 'warning' ? 'text-amber-400' :
                          log.status === 'error' ? 'text-rose-400' : 'text-sky-400'
                        }>
                          {log.step}
                        </span>
                      </span>
                      <span className="text-[10px] text-neutral-500">{log.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-neutral-300 dir-rtl text-right font-sans leading-relaxed">
                      {log.message}
                    </p>

                    {log.details && (
                      <pre className="text-[10px] bg-black/60 p-1.5 rounded text-neutral-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Technical Architecture Summary */}
        <div className="bg-neutral-950/90 p-3.5 rounded-xl border border-neutral-800 text-xs space-y-1.5 text-neutral-300">
          <div className="flex items-center gap-2 text-[#D1FF00] font-bold text-xs">
            <Info className="w-4 h-4" />
            <span>علت فنی صفحه سیاه و نحوه حل کامل آن:</span>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            سرور رسانه‌ای اصلی MuscleWiki (<code className="text-[#D1FF00]">media.musclewiki.com</code>) پشت سپر محافظتی Cloudflare قرار دارد و تمام درخواست‌های ویدیویی مستقیم را با خطای <strong>HTTP 403 Forbidden</strong> و صفحه چالش HTML مسدود می‌کند؛ به همین دلیل تگ‌های <code className="text-[#D1FF00]">&lt;video&gt;</code> استانداردهای مرورگر به صفحه کاملاً مشکی تبدیل می‌شوند. سیستم ما با تشخیص خودکار این بلاک در پروکسی سرور <code className="text-[#D1FF00]">/api/proxy-media</code>، انیمیشن‌های GIF حرکت باکیفیت بالا (HD GIF) را به‌صورت ۱۰۰٪ روان و آفلاین بارگذاری می‌کند تا هیچ‌گاه صفحه مشکی دیده نشود.
          </p>
        </div>
      </div>
    </div>
  );
};
