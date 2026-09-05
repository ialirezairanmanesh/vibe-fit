import React, { useRef, useState, useEffect } from 'react';
import { RoutineDay, WorkoutSession, UserProfile } from '../types';
import { FullDeviceExportData } from '../utils/dbStorage';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Database,
  FileText,
  Sparkles,
  HardDriveDownload,
  CheckCircle,
  RefreshCw,
  Key,
  Bot,
  Cpu,
  Check,
  AlertCircle,
  Save,
  Sliders,
  User,
  Users,
  Shield,
  Layers
} from 'lucide-react';
import { PwaInstallBanner } from './PwaInstallBanner';
import { cacheAllRoutinesMedia } from '../utils/mediaCache';
import { getCustomAiConfig, saveCustomAiConfig, PRESETS, CustomAiConfig, AiProvider } from '../utils/aiConfig';

interface SettingsManagerProps {
  routines: RoutineDay[];
  pastSessions: WorkoutSession[];
  onResetPlan: () => void;
  onImportData: (routines: RoutineDay[], sessions: WorkoutSession[]) => void;
  onOpenTextImporter: () => void;
  onAutoRecoverData?: () => Promise<{
    recoveredMediaCount: number;
    recoveredRoutinesCount: number;
    recoveredSessionsCount: number;
  }>;
  users?: UserProfile[];
  activeUser?: UserProfile;
  onOpenUserModal?: () => void;
  onExportAllUsers?: () => void;
  onImportAllUsers?: (data: FullDeviceExportData) => Promise<number>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  routines,
  pastSessions,
  onResetPlan,
  onImportData,
  onOpenTextImporter,
  onAutoRecoverData,
  users = [],
  activeUser,
  onOpenUserModal,
  onExportAllUsers,
  onImportAllUsers
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCachingMedia, setIsCachingMedia] = useState<boolean>(false);
  const [cacheProgress, setCacheProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  // AI Configuration State
  const [aiPresetId, setAiPresetId] = useState<string>('gemini');
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [modelName, setModelName] = useState<string>('gemini-3.6-flash');
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    const cfg = getCustomAiConfig();
    setProvider(cfg.provider || 'gemini');
    setApiKey(cfg.apiKey || '');
    setBaseUrl(cfg.baseUrl || '');
    setModelName(cfg.modelName || 'gemini-3.6-flash');

    // Find matching preset
    const match = PRESETS.find(
      (p) => p.provider === cfg.provider && (p.baseUrl === cfg.baseUrl || (!p.baseUrl && !cfg.baseUrl))
    );
    if (match) {
      setAiPresetId(match.id);
    } else {
      setAiPresetId('custom');
    }
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setAiPresetId(presetId);
    setTestResult(null);
    const selected = PRESETS.find((p) => p.id === presetId);
    if (selected) {
      setProvider(selected.provider);
      setBaseUrl(selected.baseUrl);
      setModelName(selected.defaultModel);
    }
  };

  const handleSaveAiConfig = () => {
    const configToSave: CustomAiConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      modelName: modelName.trim()
    };
    saveCustomAiConfig(configToSave);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 4000);
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setTestResult(null);

    const configToTest: CustomAiConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      modelName: modelName.trim()
    };

    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAiConfig: configToTest })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `ارتباط با موفقیت برقرار شد! پاسخ هوش مصنوعی: "${data.reply}"`
        });
        saveCustomAiConfig(configToTest);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'ارتباط با مدل هوش مصنوعی برقرار نشد. لطفاً کلید API، آدرس سرور و نام مدل را بررسی کنید.'
        });
      }
    } catch (err: any) {
      console.error('Test AI Connection Error:', err);
      setTestResult({
        success: false,
        message: 'خطا در برقراری ارتباط با سرور. لطفاً از اتصال اینترنت یا فعال بودن سرویس مطمئن شوید.'
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleCacheAllMedia = async () => {
    setIsCachingMedia(true);
    setCacheProgress({ current: 0, total: 1, name: 'در حال شروع...' });

    try {
      const res = await cacheAllRoutinesMedia(routines, (cached, total, currentName) => {
        setCacheProgress({ current: cached, total, name: currentName });
      });

      alert(
        `دانلود و ذخیره‌سازی آفلاین کامل شد! 📱⚡\n\n- کل رسانه‌های برنامه: ${res.total} عدد\n- ذخیره‌شده در حافظه داخلی: ${res.cached} عدد\n\nاکنون می‌توانید بدون نیاز به اینترنت، تمامی گیف‌ها و ویدیوهای حرکتی را مشاهده کنید.`
      );
    } catch (err) {
      console.error('Cache all media error:', err);
      alert('خطا در ذخیره‌سازی آفلاین رسانه‌ها.');
    } finally {
      setIsCachingMedia(false);
      setCacheProgress(null);
    }
  };

  const handleAutoRecoverClick = async () => {
    if (onAutoRecoverData) {
      try {
        const res = await onAutoRecoverData();
        alert(
          `اسکن و بازگردانی خودکار حافظه مرورگر انجام شد! 🎉\n\n- عکس‌ها و ویدیوهای بازیابی‌شده: ${res.recoveredMediaCount} عدد\n- روزهای تمرینی: ${res.recoveredRoutinesCount} روز\n- سوابق جلسات: ${res.recoveredSessionsCount} جلسه\n\nهمه عکس‌ها، ویدیوها و اطلاعات شما با موفقیت ترکیب و در دیتابیس امن ذخیره شدند.`
        );
      } catch (err) {
        console.error('Auto recover error:', err);
        alert('خطا در بازگردانی داده‌های مرورگر.');
      }
    }
  };

  // Export JSON Backup using Blob (supports large custom base64 media files)
  const handleExport = () => {
    try {
      let mediaCount = 0;
      routines.forEach((r) => {
        r.exercises.forEach((ex) => {
          if (ex.gifUrl) mediaCount++;
        });
      });

      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        routines,
        pastSessions
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      alert(
        `دانلود فایل پشتیبان کامل انجام شد! 🎉\n\nمحتویات فایل دانلود شده:\n- برنامه‌های تمرینی: ${routines.length} روز\n- سوابق ثبت‌شده: ${pastSessions.length} جلسه\n- عکس‌ها و ویدیوهای اختصاصی تمرینات: ${mediaCount} عدد`
      );
    } catch (err) {
      console.error('Export error:', err);
      alert('خطا در دانلود فایل پشتیبان. لطفاً مجدداً تلاش نمایید.');
    }
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          alert('فایل انتخاب شده خالی است.');
          return;
        }

        const parsed = JSON.parse(text);

        // Check if multi-user device backup
        if (parsed.version === '2.0_multi_user' && onImportAllUsers) {
          onImportAllUsers(parsed)
            .then((userCount) => {
              alert(
                `بازیابی بکاپ چندکاربره با موفقیت انجام شد! 🎉\n\nتعداد ${userCount} کاربر به همراه تمامی برنامه‌ها و سوابق تمرینی آنها روی این دستگاه بازگردانی شدند.`
              );
            })
            .catch((err) => {
              alert('خطا در بازیابی بکاپ چندکاربره: ' + (err.message || 'فایل نامعتبر است'));
            });
          return;
        }

        const importedRoutines = parsed.routines && Array.isArray(parsed.routines)
          ? parsed.routines
          : Array.isArray(parsed)
          ? parsed
          : null;

        if (importedRoutines) {
          const importedSessions = Array.isArray(parsed.pastSessions) ? parsed.pastSessions : [];

          let mediaCount = 0;
          importedRoutines.forEach((r: RoutineDay) => {
            if (r.exercises && Array.isArray(r.exercises)) {
              r.exercises.forEach((ex) => {
                if (ex.gifUrl) mediaCount++;
              });
            }
          });

          onImportData(importedRoutines, importedSessions);

          alert(
            `بازیابی با موفقیت کامل انجام شد! 🎉\n\n- برنامه‌های بازگردانی‌شده: ${importedRoutines.length} روز\n- سوابق تمرینی: ${importedSessions.length} جلسه\n- عکس‌ها و ویدیوهای اختصاصی: ${mediaCount} عدد`
          );
        } else {
          alert('فرمت فایل پشتیبان معتبر نیست. لطفاً یک فایل پشتیبان JSON معتبر انتخاب کنید.');
        }
      } catch (err) {
        console.error('Error parsing JSON backup file:', err);
        alert('خطا در خواندن یا بازیابی فایل پشتیبان. ممکن است فایل آسیب دیده باشد.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      alert('خطا در خواندن فایل از دستگاه.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#D1FF00]" />
          تنظیمات و مدیریت برنامه
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          مدیریت کاربران دستگاه، نصب آفلاین، پشتیبان‌گیری، کلید API و بازگردانی اطلاعات
        </p>
      </div>

      {/* Active User & Local Device Storage Section */}
      <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/30 border border-emerald-500/30 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-lg shrink-0"
              style={{ backgroundColor: activeUser?.avatarColor || '#D1FF00' }}
            >
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-100">
                  {activeUser?.name || 'ورزشکار فعال'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D1FF00] text-slate-950">
                  کاربر فعلی دستگاه
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeUser?.goal || 'عضله‌سازی و هایپرتروفی'}
                {activeUser?.experienceLevel && ` • سابقه: ${activeUser.experienceLevel}`}
                {activeUser?.weightKg && ` • ${activeUser.weightKg} کیلو`}
                {activeUser?.heightCm && ` • ${activeUser.heightCm} سانت`}
              </p>
            </div>
          </div>

          {onOpenUserModal && (
            <button
              onClick={onOpenUserModal}
              className="px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-[#D1FF00] border border-neutral-700 hover:border-[#D1FF00]/40 text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>مدیریت کاربران ({users.length} کاربر)</span>
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-emerald-300">ذخیره‌سازی ۱۰۰٪ محلی روی همین دستگاه:</strong> اطلاعات و برنامه‌های ورزشی هر کاربر مستقلاً در حافظه مرورگر ذخیره می‌شود. هیچ داده‌ای با سایرین یا روی سرور عمومی به اشتراک گذاشته نمی‌شود.
          </span>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* AI Model & API Key Configuration Section */}
      <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>تنظیمات کلید API و مدل هوش مصنوعی</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              جهت استفاده از مربی هوشمند، آنالیز برنامه ورزشی و تبدیل متون مربی به برنامه، می‌توانید کلید API اختصاصی خود را تنظیم کنید. (پشتیبانی از Gemini، DeepSeek، OpenRouter، Groq، Cursor و Ollama)
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-black rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
            چند مدله
          </span>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            انتخاب سریع سرویس‌دهنده (Preset):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isSelected = aiPresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700/60'
                  }`}
                >
                  <span className="truncate">{p.nameFa}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider Switch (Gemini vs OpenAI Compatible) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950/80 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setProvider('gemini');
              if (aiPresetId !== 'custom') setAiPresetId('custom');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition text-center ${
              provider === 'gemini'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Google Gemini API
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider('openai_compatible');
              if (aiPresetId !== 'custom') setAiPresetId('custom');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition text-center ${
              provider === 'openai_compatible'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            سازگار با OpenAI (DeepSeek/Groq/...)
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            کلید API اختصاصی (API Key):
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
            dir="ltr"
            className="w-full py-2.5 px-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
          />
          <p className="text-[10px] text-neutral-400">
            {provider === 'gemini'
              ? 'کلید گوگل جمینای خود را وارد کنید. برای نسخه رایگان نیازی به کارت اعتباری نیست.'
              : 'کلید مربوط به سرویس انتخابی (یا لایسنس Cursor/DeepSeek/Groq) را وارد نمایید.'}
          </p>
        </div>

        {/* Base URL Input (Required if openai_compatible or custom) */}
        {provider === 'openai_compatible' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              آدرس سرور پایه (Base URL):
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              dir="ltr"
              className="w-full py-2.5 px-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
            />
            <p className="text-[10px] text-neutral-400">
              نمونه: DeepSeek: https://api.deepseek.com | Groq: https://api.groq.com/openai/v1 | OpenRouter: https://openrouter.ai/api/v1
            </p>
          </div>
        )}

        {/* Model Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            نام دقیق مدل (Model Name):
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder={provider === 'gemini' ? 'gemini-3.6-flash' : 'gpt-4o-mini'}
            dir="ltr"
            className="w-full py-2.5 px-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={isTestingAi}
            onClick={handleTestAiConnection}
            className="flex-1 py-3 px-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isTestingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
            <span>{isTestingAi ? 'در حال تست ارتباط...' : 'تست ارتباط با مدل هوش مصنوعی'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAiConfig}
            className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تنظیمات مدل</span>
          </button>
        </div>

        {/* Messages */}
        {saveSuccessMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تنظیمات مدل هوش مصنوعی با موفقیت در دستگاه شما ذخیره شد.</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-medium'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-medium'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? 'ارتباط موفقیت‌آمیز!' : 'خطا در ارتباط'}</p>
              <p className="mt-0.5 text-[11px] opacity-90">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Offline Media Caching Section */}
      <div className="p-5 bg-neutral-900 border border-emerald-500/30 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <HardDriveDownload className="w-4 h-4 text-emerald-400" />
          ذخیره‌سازی یکجای تمام گیف‌ها و ویدیوها برای استفاده ۱۰۰٪ آفلاین
        </h3>

        <p className="text-xs text-neutral-400 leading-relaxed">
          با کلیک روی این دکمه، تمام گیف‌ها و عکس‌های تمام حرکات برنامه در حافظه داخلی گوشی یا مرورگر شما ذخیره می‌شوند تا حتی بدون اینترنت هم حرکات به صورت کامل نمایش داده شوند.
        </p>

        {isCachingMedia && cacheProgress ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                در حال ذخیره‌سازی: {cacheProgress.name}
              </span>
              <span>{Math.round((cacheProgress.current / (cacheProgress.total || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${Math.round((cacheProgress.current / (cacheProgress.total || 1)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              {cacheProgress.current} از {cacheProgress.total} تصویر/گیف دانلود و کش شد.
            </p>
          </div>
        ) : (
          <button
            onClick={handleCacheAllMedia}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/10"
          >
            <HardDriveDownload className="w-4 h-4 text-emerald-400" />
            <span>دانلود و کش یکجای تمامی عکس‌ها و گیف‌ها (آفلاین‌سازی)</span>
          </button>
        )}
      </div>

      {/* Backup & Restore Section */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#D1FF00]" />
          پشتیبان‌گیری و انتقال اطلاعات (آفلاین)
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          تمامی برنامه‌ها، سوابق تمرینی و <strong>عکس‌ها/ویدیوهای اختصاصی آپلود شده</strong> به صورت فایل کامل ذخیره می‌شوند. با دریافت فایل پشتیبان، در صورت تغییر مرورگر یا گوشی می‌توانید همه‌چیز (شامل رسانه‌ها) را یکجا بازگردانی کنید.
        </p>

        <div className="space-y-3 pt-2">
          {onAutoRecoverData && (
            <button
              onClick={handleAutoRecoverClick}
              className="w-full py-3 px-4 rounded-2xl bg-[#D1FF00]/15 hover:bg-[#D1FF00]/25 border border-[#D1FF00]/40 text-[#D1FF00] font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#D1FF00]/10"
            >
              <Sparkles className="w-4 h-4 text-[#D1FF00]" />
              <span>جستجو و بازگردانی خودکار عکس‌ها/ویدیوها از حافظه مرورگر</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-[#D1FF00]" />
              دانلود پشتیبان کاربر فعلی (JSON)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              بازیابی از فایل پشتیبان (تک‌کاربر / چندکاربر)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {onExportAllUsers && (
            <button
              onClick={onExportAllUsers}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/10"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>دانلود فایل پشتیبان کامل همه کاربران این دستگاه (چندکاربره)</span>
            </button>
          )}
        </div>
      </div>

      {/* Text Program Importer Section */}
      <div className="p-5 bg-neutral-900 border border-[#D1FF00]/30 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D1FF00]" />
          تغییر و ساخت برنامه از روی متن کامل (پیام مربی / تلگرام)
        </h3>

        <p className="text-xs text-neutral-400 leading-relaxed">
          اگر ماه آینده برنامه جدیدی از مربی گرفتید، می‌توانید کپی متن پیام را اینجا پیست کنید تا برنامه‌ی جدید به طور خودکار تفکیک شده و حرکات متناظر با گیف‌های حرکتی ساخته شوند.
        </p>

        <button
          onClick={onOpenTextImporter}
          className="py-3 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] text-[#0A0A0A] font-extrabold text-xs flex items-center justify-center gap-2 transition w-full sm:w-auto shadow-lg shadow-[#D1FF00]/10"
        >
          <Sparkles className="w-4 h-4" />
          ورودی و ساخت هوشمند برنامه از روی متن
        </button>
      </div>

      {/* Clear Routines Section */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          پاکسازی و شروع مجدد برنامه کاربر
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          اگر می‌خواهید کلیه روزها و حرکات ثبت‌شده برای این کاربر را پاک کرده و از نو با متن پیام مربی یا دستی روزهای جدید ایجاد کنید، از این دکمه استفاده نمایید.
        </p>

        <button
          onClick={() => {
            if (confirm('آیا از پاکسازی کلیه روزها و حرکات برنامه این کاربر اطمینان دارید؟')) {
              onResetPlan();
            }
          }}
          className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          پاکسازی برنامه و شروع مجدد
        </button>
      </div>

      {/* App & Dataset Info */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-slate-200 text-sm font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          درباره اپلیکیشن و قابلیت‌های آفلاین
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          این اپلیکیشن کاملاً به صورت PWA (برنامه وب پیشرونده) طراحی شده است. پس از یک بار باز کردن، کلیه اسکریپت‌ها، فونت‌ها و فایل‌های ویدئویی حرکات ورزشی در حافظه دستگاه شما ذخیره می‌شوند و حتی در صورت قطعی کامل اینترنت و عدم آنتن‌دهی در باشگاه، ۱۰۰٪ کارآمد و قابل اجرا است.
        </p>
      </div>
    </div>
  );
};

