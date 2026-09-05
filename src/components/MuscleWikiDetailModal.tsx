import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { MuscleWikiExercise } from '../data/musclewikiDataset';
import { ExerciseAnimation } from './ExerciseAnimation';
import { MuscleWikiDiagnostic } from './MuscleWikiDiagnostic';
import { 
  X, 
  Search, 
  Dumbbell, 
  Target, 
  Layers, 
  Lightbulb, 
  Check, 
  Sparkles, 
  Maximize2, 
  Zap, 
  User, 
  ExternalLink,
  BookOpen,
  Info,
  ChevronDown,
  Activity
} from 'lucide-react';

interface MuscleWikiDetailModalProps {
  exercise: Exercise | MuscleWikiExercise | null;
  onClose: () => void;
  onApplyToExercise?: (mwData: { gifUrl: string; instructionsFa: string[]; tipsFa: string[]; nameEn: string }) => void;
}

function isMuscleWikiExercise(ex: Exercise | MuscleWikiExercise): ex is MuscleWikiExercise {
  return 'gifUrl' in ex && ('source' in ex || 'sideGifUrl' in ex || 'instructionsEn' in ex);
}

export const MuscleWikiDetailModal: React.FC<MuscleWikiDetailModalProps> = ({
  exercise,
  onClose,
  onApplyToExercise
}) => {
  const [matchedMwExercise, setMatchedMwExercise] = useState<MuscleWikiExercise | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MuscleWikiExercise[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');
  const [activeAngle, setActiveAngle] = useState<'front' | 'side'>('front');
  const [showEnglishText, setShowEnglishText] = useState<boolean>(false);
  const [isFullscreenGif, setIsFullscreenGif] = useState<boolean>(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);

  useEffect(() => {
    if (!exercise) return;

    setActiveAngle('front');
    setSearchQuery('');
    setSearchResults([]);

    // Already a MuscleWiki API exercise (from library) — use as-is
    if (isMuscleWikiExercise(exercise) && exercise.gifUrl?.includes('/api/proxy-media')) {
      setMatchedMwExercise(exercise);
      return;
    }
    if (isMuscleWikiExercise(exercise) && exercise.source === 'MuscleWiki API') {
      setMatchedMwExercise(exercise);
      return;
    }

    let cancelled = false;
    setIsResolving(true);
    const q = ('nameEn' in exercise && exercise.nameEn) || ('nameFa' in exercise && exercise.nameFa) || '';
    const category = ('category' in exercise && exercise.category) || '';

    fetch(`/api/musclewiki/exercises?q=${encodeURIComponent(String(q))}&category=${encodeURIComponent(String(category))}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.exercises) ? data.exercises : [];
        setMatchedMwExercise(list[0] || null);
      })
      .catch((err) => {
        console.warn('[MuscleWikiDetailModal] API match failed:', err);
        if (!cancelled) setMatchedMwExercise(null);
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exercise]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const qLower = query.trim();
    if (!qLower) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/musclewiki/exercises?q=${encodeURIComponent(query)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.exercises)) {
        setSearchResults(data.exercises);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn('Network search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (!exercise) return null;

  const currentMw = matchedMwExercise;

  const activeGifUrl = currentMw
    ? activeGender === 'female' && currentMw.femaleGifUrl
      ? currentMw.femaleGifUrl
      : activeAngle === 'side' && currentMw.sideGifUrl
      ? currentMw.sideGifUrl
      : currentMw.gifUrl
    : ('gifUrl' in exercise ? exercise.gifUrl : undefined);

  const handleApply = () => {
    if (onApplyToExercise && currentMw) {
      onApplyToExercise({
        gifUrl: currentMw.gifUrl,
        instructionsFa: currentMw.instructionsFa || [],
        tipsFa: currentMw.tipsFa || [],
        nameEn: currentMw.nameEn
      });
      setApplySuccessMsg('اطلاعات و انیمیشن MuscleWiki با موفقیت روی حرکت شما ثبت شد!');
      setTimeout(() => {
        setApplySuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  const displayNameFa = currentMw?.nameFa || ('nameFa' in exercise ? exercise.nameFa : 'حرکت');
  const displayNameEn = currentMw?.nameEn || ('nameEn' in exercise ? exercise.nameEn : '');
  const displayCategory = (currentMw?.category || ('category' in exercise ? exercise.category : 'chest')) as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0D0D0D] border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        
        {/* Modal Top Header */}
        <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D1FF00]/10 border border-[#D1FF00]/30 flex items-center justify-center text-[#D1FF00] shrink-0">
              <Zap className="w-5 h-5 fill-[#D1FF00]/20 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#D1FF00]/20 text-[#D1FF00] font-bold text-[10px] tracking-wide border border-[#D1FF00]/40">
                  اطلاعات جامع MuscleWiki
                </span>
                <span className="text-xs text-neutral-400 font-medium">پایگاه داده بین‌المللی تمرینات</span>
              </div>
              <h2 className="text-base font-extrabold text-white truncate mt-0.5">
                {displayNameFa}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar to browse other MuscleWiki exercises */}
        <div className="p-3 bg-neutral-950/90 border-b border-neutral-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در تمام حرکات MuscleWiki (مثلاً: Bench Press, جلو بازو, Squat)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D1FF00] transition"
            />
            {isSearching && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#D1FF00] animate-pulse">
                در حال جستجو...
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
              <p className="text-[10px] text-neutral-400 px-2 py-1 font-bold">نتایج پیدا شده ({searchResults.length} حرکت):</p>
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMatchedMwExercise(item);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between hover:bg-neutral-800 transition ${
                    currentMw?.id === item.id ? 'bg-[#D1FF00]/10 border border-[#D1FF00]/30 text-[#D1FF00] font-bold' : 'text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D1FF00]" />
                    <span>{item.nameFa}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">({item.nameEn})</span>
                  </div>
                  <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-lg text-neutral-400">{item.equipmentFa}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Body Content */}
        <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {isResolving && (
            <div className="py-8 text-center text-xs text-neutral-400">در حال دریافت حرکت از MuscleWiki API...</div>
          )}
          {!isResolving && !currentMw && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
              حرکتی از MuscleWiki پیدا نشد. جستجو کنید یا API key را بررسی کنید.
            </div>
          )}

          {/* GIF & Angles Display Section */}
          <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner group">
            {/* Top Gender / Angle Toggle Buttons */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 bg-black/80 backdrop-blur-md rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveGender('male')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeGender === 'male'
                    ? 'bg-[#D1FF00] text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>آقایان</span>
              </button>
              
              <button
                onClick={() => setActiveGender('female')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeGender === 'female'
                    ? 'bg-[#D1FF00] text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>بانوان</span>
              </button>

              {currentMw?.sideGifUrl && (
                <div className="flex items-center gap-1 pr-1 border-r border-neutral-700">
                  <button
                    onClick={() => setActiveAngle('front')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      activeAngle === 'front'
                        ? 'bg-neutral-200 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    روبه‌رو
                  </button>
                  <button
                    onClick={() => setActiveAngle('side')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      activeAngle === 'side'
                        ? 'bg-neutral-200 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    نیم‌رخ
                  </button>
                </div>
              )}
            </div>

            {/* Fullscreen Expand Button */}
            <button
              onClick={() => setIsFullscreenGif(!isFullscreenGif)}
              className="absolute top-3 left-3 z-10 p-2 rounded-xl bg-black/80 backdrop-blur-md text-neutral-300 hover:text-[#D1FF00] border border-neutral-800 transition"
              title="مشاهده تصویر بزرگ‌تر"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* GIF / Video Container */}
            <div className="w-full h-64 sm:h-72 flex items-center justify-center p-2 bg-neutral-950 overflow-hidden rounded-xl">
              <ExerciseAnimation
                type="generic"
                category={displayCategory}
                gifUrl={activeGifUrl}
                exerciseNameEn={displayNameEn}
                className="w-full h-full"
              />
            </div>

            <div className="px-3 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                نام بین‌المللی: <strong className="text-white font-mono dir-ltr">{displayNameEn}</strong>
              </span>

              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="px-2.5 py-1 rounded-lg bg-[#D1FF00]/10 border border-[#D1FF00]/30 hover:bg-[#D1FF00] hover:text-black text-[#D1FF00] font-bold text-[10px] flex items-center gap-1.5 transition"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{showDiagnostic ? 'بستن پنل عیب‌یابی' : 'تست شبکه و API لایو'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Utility Sandbox */}
          {showDiagnostic && (
            <MuscleWikiDiagnostic onClose={() => setShowDiagnostic(false)} />
          )}

          {/* Quick Badges: Primary Muscle, Secondary, Equipment, Recommended Sets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-[10px] flex items-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                عضله اصلی هدف
              </p>
              <p className="font-extrabold text-emerald-300 text-xs">{currentMw?.targetMuscleFa || currentMw?.targetMuscleEn || "—"}</p>
              <p className="text-[10px] text-neutral-500 font-mono dir-ltr text-right">{currentMw?.targetMuscleEn || ""}</p>
            </div>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-[10px] flex items-center gap-1 mb-1">
                <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                تجهیزات مورد نیاز
              </p>
              <p className="font-bold text-sky-300 text-xs">{currentMw?.equipmentFa || currentMw?.equipmentEn || "—"}</p>
              <p className="text-[10px] text-neutral-500 font-mono dir-ltr text-right">{currentMw?.equipmentEn || ""}</p>
            </div>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-[10px] flex items-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                برنامه پیشنهادی
              </p>
              <p className="font-bold text-purple-300 text-xs">{currentMw?.defaultSets || "—"} ست × {currentMw?.defaultReps || "—"}</p>
              <p className="text-[10px] text-neutral-400">استراحت: {currentMw?.defaultRestSeconds || "—"} ثانیه</p>
            </div>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
              <p className="text-neutral-400 text-[10px] flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                عضلات کمکی
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(currentMw?.secondaryMusclesFa || []).map((sec, idx) => (
                  <span key={idx} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-md">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Success toast if applied */}
          {applySuccessMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{applySuccessMsg}</span>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D1FF00]" />
                مراحل اجرای صحیح حرکت طبق استانداردهای MuscleWiki
              </h3>

              <button
                onClick={() => setShowEnglishText(!showEnglishText)}
                className="text-[11px] text-neutral-400 hover:text-[#D1FF00] font-medium flex items-center gap-1 transition"
              >
                <span>{showEnglishText ? 'نمایش متن فارسی' : 'Show English Steps'}</span>
              </button>
            </div>

            <ol className="space-y-2.5 text-xs leading-relaxed">
              {(showEnglishText ? (currentMw?.instructionsEn || []) : (currentMw?.instructionsFa || [])).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-neutral-200">
                  <span className="w-5 h-5 rounded-full bg-[#D1FF00]/15 border border-[#D1FF00]/30 text-[#D1FF00] font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className={showEnglishText ? 'font-mono text-left dir-ltr block text-neutral-300' : ''}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pro Tips / Technique Highlights */}
          {currentMw?.tipsFa && currentMw.tipsFa.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                نکات کلیدی هایپرتروفی و پیشگیری از آسیب (MuscleWiki Tips)
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-200/90 leading-relaxed">
                {currentMw.tipsFa!.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Footer: Apply MuscleWiki Data to Current Exercise */}
          {onApplyToExercise && (
            <div className="pt-2">
              <button
                onClick={handleApply}
                disabled={!currentMw}
                className="w-full py-3.5 px-4 bg-[#D1FF00] hover:bg-[#b8e600] text-black font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#D1FF00]/10 transition active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Sparkles className="w-4 h-4 fill-black/20" />
                <span>انتقال اطلاعات و انیمیشن این حرکت از MuscleWiki به تمرین شما</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Fullscreen GIF Modal */}
      {isFullscreenGif && (
        <div 
          onClick={() => setIsFullscreenGif(false)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl w-full text-center space-y-3">
            <button
              onClick={() => setIsFullscreenGif(false)}
              className="absolute -top-12 left-0 p-2 bg-neutral-800 text-white rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full h-[70vh] flex items-center justify-center">
              <ExerciseAnimation
                type="generic"
                category={displayCategory}
                gifUrl={activeGifUrl}
                exerciseNameEn={displayNameEn}
                className="w-full h-full rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl"
              />
            </div>
            <p className="text-sm font-bold text-white">{displayNameFa} - {displayNameEn}</p>
          </div>
        </div>
      )}
    </div>
  );
};
