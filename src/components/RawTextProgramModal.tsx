import React, { useState } from 'react';
import { RoutineDay, Exercise } from '../types';
import { parseWorkoutText, SAMPLE_WORKOUT_TEXT, inferExerciseMetadata } from '../utils/workoutTextParser';
import { getCustomAiConfig } from '../utils/aiConfig';
import { 
  X, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Dumbbell, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Plus, 
  Zap, 
  Info,
  RotateCcw
} from 'lucide-react';

interface RawTextProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutines: (newRoutines: RoutineDay[], mode: 'replace' | 'append') => void;
}

export const RawTextProgramModal: React.FC<RawTextProgramModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutines
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedRoutines, setParsedRoutines] = useState<RoutineDay[]>([]);
  const [activeStep, setActiveStep] = useState<'input' | 'preview'>('input');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Insert sample workout text
  const handleLoadSample = () => {
    setRawText(SAMPLE_WORKOUT_TEXT);
  };

  // Parse text using Server-Side Gemini API with local fallback
  const handleParseText = async () => {
    if (!rawText.trim()) {
      alert('لطفاً ابتدا متن برنامه تمرینی خود را وارد یا پیست کنید.');
      return;
    }

    setIsAiLoading(true);

    try {
      const res = await fetch('/api/gemini/parse-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, customAiConfig: getCustomAiConfig() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routines && Array.isArray(data.routines) && data.routines.length > 0) {
          // Normalize IDs if missing
          const normalized: RoutineDay[] = data.routines.map((r: any, idx: number) => ({
            ...r,
            id: r.id || `ai-day-${Date.now()}-${idx + 1}`,
            exercises: (r.exercises || []).map((ex: any, exIdx: number) => ({
              ...ex,
              id: ex.id || `ai-ex-${Date.now()}-${idx}-${exIdx}`,
              defaultRestSeconds: ex.defaultRestSeconds || 75
            }))
          }));

          setParsedRoutines(normalized);
          setActiveStep('preview');
          setIsAiLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI Parsing failed or offline, falling back to local parser:', err);
    }

    // Fallback to local parser
    const localResult = parseWorkoutText(rawText);
    if (localResult.length === 0) {
      alert('متن وارد شده قابل شناسایی نبود. لطفاً از فرمت نمونه استفاده کنید.');
    } else {
      setParsedRoutines(localResult);
      setActiveStep('preview');
    }
    setIsAiLoading(false);
  };

  // Delete exercise from preview
  const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const updated = [...parsedRoutines];
    updated[dayIndex].exercises.splice(exerciseIndex, 1);
    // Remove day if empty
    if (updated[dayIndex].exercises.length === 0) {
      updated.splice(dayIndex, 1);
    }
    setParsedRoutines(updated);
  };

  // Delete entire day from preview
  const handleDeleteDay = (dayIndex: number) => {
    const updated = parsedRoutines.filter((_, idx) => idx !== dayIndex);
    setParsedRoutines(updated);
  };

  // Final submit
  const handleFinalSubmit = () => {
    if (parsedRoutines.length === 0) {
      alert('هیچ روز یا حرکتی برای ثبت وجود ندارد.');
      return;
    }

    onSaveRoutines(parsedRoutines, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D1FF00]/10 border border-[#D1FF00]/30 text-[#D1FF00]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                ورودی و ساخت هوشمند برنامه از روی متن
                <Sparkles className="w-4 h-4 text-[#D1FF00]" />
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                متن کامل برنامه مربی را وارد کنید تا برنامه جدید ساخته شود
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* STEP 1: INPUT TEXT AREA */}
          {activeStep === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-[#D1FF00]" />
                  متن کامل برنامه ماه جدید یا برنامه مربی را اینجا پیست کنید:
                </label>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-bold text-[#D1FF00] bg-[#D1FF00]/10 hover:bg-[#D1FF00]/20 px-3 py-1.5 rounded-xl border border-[#D1FF00]/30 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  جایگذاری متن نمونه
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`مثال:\nروز اول: سینه + جلو بازو\n- پرس سینه دمبل: ۴ ست ۱۲ تایی\n- پرس بالا سینه: ۳ ست ۱۰ تایی\n- جلو بازو سیم کش: ۴ ست ۱۲ تایی\n\nروز دوم: پا + پشت بازو\n- اسکات هالتر: ۴ ست ۱۰ تایی\n...`}
                rows={10}
                className="w-full p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 text-xs sm:text-sm font-sans focus:outline-none focus:border-[#D1FF00] transition leading-relaxed resize-y"
              />

              {/* Explanatory tips */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-start gap-2.5 text-xs text-neutral-400">
                <Info className="w-4 h-4 text-[#D1FF00] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  سیستم به صورت هوشمند نام روزها، اسم حرکات، تعداد ست‌ها و تکرارها را پردازش کرده و گیف انیمیشن آموزشی مربوط به هر حرکت را متصل می‌کند.
                </p>
              </div>

              {/* Parse Button */}
              <button
                type="button"
                onClick={handleParseText}
                disabled={isAiLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] active:scale-[0.99] text-[#0A0A0A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D1FF00]/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>هوش مصنوعی Gemini در حال تحلیل و تطبیق فیلم حرکات...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>پردازش و استخراج هوشمند برنامه جدید با Gemini</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PREVIEW & CONFIRMATION */}
          {activeStep === 'preview' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D1FF00]" />
                    برنامه استخراج‌شده ({parsedRoutines.length} روز)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    بررسی و تایید نهایی روزها و حرکات استخراج‌شده
                  </p>
                </div>

                <button
                  onClick={() => setActiveStep('input')}
                  className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 underline"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  ویرایش متن
                </button>
              </div>

              {/* Mode Selection */}
              <div className="p-3 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">نحوه اعمال برنامه جدید:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      importMode === 'replace'
                        ? 'bg-[#D1FF00] text-[#0A0A0A] border-[#D1FF00]'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    جایگزینی کامل برنامه قبلی
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      importMode === 'append'
                        ? 'bg-[#D1FF00] text-[#0A0A0A] border-[#D1FF00]'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    افزودن به روزهای موجود
                  </button>
                </div>
              </div>

              {/* Parsed Days List */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {parsedRoutines.map((routine, dayIdx) => (
                  <div
                    key={routine.id}
                    className="p-4 rounded-2xl bg-[#0a0a0a] border border-neutral-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#D1FF00] text-[#0A0A0A] font-extrabold text-xs flex items-center justify-center">
                          {dayIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={routine.titleFa}
                          onChange={(e) => {
                            const updated = [...parsedRoutines];
                            updated[dayIdx].titleFa = e.target.value;
                            setParsedRoutines(updated);
                          }}
                          className="bg-transparent text-sm font-bold text-neutral-100 border-b border-transparent hover:border-neutral-700 focus:border-[#D1FF00] focus:outline-none px-1"
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteDay(dayIdx)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="حذف این روز"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-2 pt-1 border-t border-neutral-800/60">
                      {routine.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id}
                          className="p-2.5 rounded-xl bg-[#121212] border border-neutral-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 text-[10px] flex items-center justify-center shrink-0">
                              {exIdx + 1}
                            </span>
                            <span className="font-semibold text-neutral-200 truncate">{ex.nameFa}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 font-mono text-[#D1FF00] text-[11px]">
                              {ex.targetSets} ست × {ex.targetReps}
                            </span>
                            <button
                              onClick={() => handleDeleteExercise(dayIdx, exIdx)}
                              className="text-neutral-500 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('input')}
                  className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition"
                >
                  بازگشت و اصلاح
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="py-3 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] active:scale-[0.99] text-[#0A0A0A] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#D1FF00]/15 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ذخیره و جایگزینی برنامه
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
