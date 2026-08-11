import React, { useState } from 'react';
import { RoutineDay, Exercise, WorkoutSession } from '../types';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { MuscleWikiDetailModal } from './MuscleWikiDetailModal';
import { PwaInstallBanner } from './PwaInstallBanner';
import { getCustomAiConfig } from '../utils/aiConfig';
import { 
  Play, 
  Dumbbell, 
  Activity, 
  Zap, 
  ChevronLeft, 
  Sparkles, 
  Info,
  Calendar,
  Layers,
  Flame,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

interface RoutinesOverviewProps {
  routines: RoutineDay[];
  pastSessions: WorkoutSession[];
  onStartWorkout: (routine: RoutineDay) => void;
  onOpenTextImporter: () => void;
  onUpdateRoutines?: (newRoutines: RoutineDay[]) => void;
  onUpdateExerciseMedia?: (exerciseId: string, customMediaUrl: string | undefined) => void;
}

export const RoutinesOverview: React.FC<RoutinesOverviewProps> = ({
  routines,
  pastSessions,
  onStartWorkout,
  onOpenTextImporter,
  onUpdateRoutines,
  onUpdateExerciseMedia
}) => {
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);
  const [selectedMwExerciseModal, setSelectedMwExerciseModal] = useState<Exercise | null>(null);
  const [isFixingWithAi, setIsFixingWithAi] = useState<boolean>(false);

  // Routine header editing state
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineTitleFa, setRoutineTitleFa] = useState<string>('');
  const [routineSubtitleFa, setRoutineSubtitleFa] = useState<string>('');
  const [routineMusclesFa, setRoutineMusclesFa] = useState<string>('');

  // Exercise row inline editing state
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exNameFa, setExNameFa] = useState<string>('');
  const [exTargetSets, setExTargetSets] = useState<number>(3);
  const [exTargetReps, setExTargetReps] = useState<string>('8-12');
  const [exTargetMuscleFa, setExTargetMuscleFa] = useState<string>('');

  // New Exercise adding state
  const [addingToRoutineId, setAddingToRoutineId] = useState<string | null>(null);
  const [newExNameFa, setNewExNameFa] = useState<string>('');
  const [newExSets, setNewExSets] = useState<number>(3);
  const [newExReps, setNewExReps] = useState<string>('8-12');
  const [newExMuscle, setNewExMuscle] = useState<string>('');

  // Routine Day Edit Handlers
  const handleStartEditRoutine = (routine: RoutineDay) => {
    setEditingRoutineId(routine.id);
    setRoutineTitleFa(routine.titleFa || '');
    setRoutineSubtitleFa(routine.subtitleFa || '');
    setRoutineMusclesFa(routine.targetMusclesFa.join('، ') || '');
  };

  const handleSaveRoutineHeader = (routineId: string) => {
    if (!onUpdateRoutines) return;
    if (!routineTitleFa.trim()) {
      alert('عنوان روز تمرین نمی‌تواند خالی باشد.');
      return;
    }

    const musclesList = routineMusclesFa
      .split(/[،,]/)
      .map((m) => m.trim())
      .filter(Boolean);

    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          titleFa: routineTitleFa.trim(),
          subtitleFa: routineSubtitleFa.trim(),
          targetMusclesFa: musclesList.length > 0 ? musclesList : r.targetMusclesFa
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    setEditingRoutineId(null);
  };

  // Exercise Row Inline Edit Handlers
  const handleStartEditExercise = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExerciseId(ex.id);
    setExNameFa(ex.nameFa || '');
    setExTargetSets(ex.targetSets || 3);
    setExTargetReps(ex.targetReps || '8-12');
    setExTargetMuscleFa(ex.targetMuscleFa || '');
  };

  const handleSaveExerciseInline = (routineId: string, exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateRoutines) return;
    if (!exNameFa.trim()) {
      alert('نام حرکت نمی‌تواند خالی باشد.');
      return;
    }

    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                nameFa: exNameFa.trim(),
                targetSets: Math.max(1, Number(exTargetSets) || 3),
                targetReps: exTargetReps.trim() || '8-12',
                targetMuscleFa: exTargetMuscleFa.trim() || ex.targetMuscleFa
              };
            }
            return ex;
          })
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    setEditingExerciseId(null);
  };

  const handleDeleteExerciseInline = (routineId: string, exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateRoutines) return;
    if (!confirm('آیا از حذف این حرکت از روز تمرینی اطمینان دارید؟')) return;

    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.filter((ex) => ex.id !== exerciseId)
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    setEditingExerciseId(null);
  };

  // New Exercise Add Handlers
  const handleSaveNewExercise = (routineId: string) => {
    if (!onUpdateRoutines) return;
    if (!newExNameFa.trim()) {
      alert('نام حرکت جدید را وارد کنید.');
      return;
    }

    const newEx: Exercise = {
      id: `custom_ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nameFa: newExNameFa.trim(),
      nameEn: newExNameFa.trim(),
      category: 'chest',
      targetMuscleFa: newExMuscle.trim() || 'عمومی',
      equipmentFa: 'وزنه / دستگاه',
      targetSets: Math.max(1, Number(newExSets) || 3),
      targetReps: newExReps.trim() || '8-12',
      defaultRestSeconds: 90,
      instructionsFa: ['حرکت را با فرم صحیح و کنترل عضلانی کامل اجرا نمایید.'],
      tipsFa: ['تنفس منظم را حین اجرا حفظ کنید.'],
      animationType: 'generic'
    };

    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: [...r.exercises, newEx]
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    setAddingToRoutineId(null);
    setNewExNameFa('');
    setNewExSets(3);
    setNewExReps('8-12');
    setNewExMuscle('');
  };

  // Fix exercise video/animation mappings with Gemini AI
  const handleFixRoutinesWithAi = async () => {
    if (!onUpdateRoutines) return;
    setIsFixingWithAi(true);

    try {
      const res = await fetch('/api/gemini/fix-routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routines, customAiConfig: getCustomAiConfig() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routines && Array.isArray(data.routines) && data.routines.length > 0) {
          onUpdateRoutines(data.routines);
          alert('ویدیوها و اطلاعات تمامی حرکات با هوش مصنوعی Gemini به روزرسانی و اصلاح شد!');
        } else {
          alert('خطا در تصحیح برنامه.');
        }
      } else {
        alert('امکان برقراری ارتباط با سرویس هوش مصنوعی وجود نداشت.');
      }
    } catch (err) {
      console.error('Error fixing routines with AI:', err);
      alert('خطا در اجرای تصحیح با هوش مصنوعی.');
    } finally {
      setIsFixingWithAi(false);
    }
  };

  // Helper to render icon based on name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="w-6 h-6 text-[#D1FF00]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      default:
        return <Flame className="w-6 h-6 text-[#D1FF00]" />;
    }
  };

  // Find last completed workout
  const lastSession = pastSessions
    .filter((s) => s.isCompleted)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

  return (
    <div className="space-y-6 pb-28">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] via-[#161616] to-[#0d0d0d] border border-[#D1FF00]/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#D1FF00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D1FF00] animate-pulse"></span>
            <span className="text-xs font-bold text-[#D1FF00] tracking-wide uppercase">برنامه تخصصی ۳ روزه</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
            مدیریت هوشمند تمرینات ورزشی
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            برنامه تمرینی با پویانمایی حرکات بارگذاری شده است. می‌توانید هر زمان روی عنوان یا نام هر حرکت کلیک کنید و مستقیماً تغییرات دهید.
          </p>

          <div className="pt-2 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenTextImporter}
              className="py-2.5 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] active:scale-95 text-[#0A0A0A] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#D1FF00]/15 transition"
            >
              <Sparkles className="w-4 h-4" />
              تغییر یا ساخت برنامه با متن کامل (مربی / تلگرام)
            </button>

            <button
              onClick={handleFixRoutinesWithAi}
              disabled={isFixingWithAi}
              className="py-2.5 px-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              {isFixingWithAi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-[#D1FF00] rounded-full animate-spin" />
                  <span>Gemini در حال اصلاح ویدیوها...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#D1FF00]" />
                  <span>تصحیح هوشمند فیلم حرکات با Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* Last Session Banner */}
          {lastSession && (
            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400 border-t border-neutral-800/80 mt-3">
              <Calendar className="w-4 h-4 text-[#D1FF00]" />
              <span>آخرین تمرین ثبت‌شده: <strong className="text-neutral-200">{lastSession.routineTitleFa}</strong> ({new Date(lastSession.startTime).toLocaleDateString('fa-IR')})</span>
            </div>
          )}
        </div>
      </div>

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Routine Cards Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#D1FF00]" />
          روزهای برنامه‌ی تمرینی شما
        </h3>
        <span className="text-xs text-[#D1FF00] font-semibold bg-[#121212] border border-neutral-800 px-3 py-1 rounded-full flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5" />
          امکان ویرایش مستقیم نام روزها و حرکات
        </span>
      </div>

      {/* Routine Day Cards List */}
      <div className="space-y-5">
        {routines.map((routine) => {
          const isHeaderEditing = editingRoutineId === routine.id;

          return (
            <div
              key={routine.id}
              className="group relative bg-[#121212] border border-neutral-800/90 rounded-3xl p-5 sm:p-6 shadow-xl hover:border-[#D1FF00]/40 transition-all duration-300 space-y-4"
            >
              {/* Routine Day Header / Header Edit Form */}
              {isHeaderEditing ? (
                <div className="p-4 bg-neutral-900 border border-[#D1FF00]/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-[#D1FF00]">ویرایش مستقیم نام و مشخصات روز تمرین</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">عنوان روز (مثلاً: روز اول - سینه و جلو بازو):</label>
                      <input
                        type="text"
                        value={routineTitleFa}
                        onChange={(e) => setRoutineTitleFa(e.target.value)}
                        className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">توضیح/زیرعنوان (مثلاً: تمرکز بر هایپرتروفی):</label>
                      <input
                        type="text"
                        value={routineSubtitleFa}
                        onChange={(e) => setRoutineSubtitleFa(e.target.value)}
                        className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">عضلات درگیر (با ویرگول جدا کنید):</label>
                      <input
                        type="text"
                        value={routineMusclesFa}
                        onChange={(e) => setRoutineMusclesFa(e.target.value)}
                        className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                        placeholder="سینه، جلو بازو، شکم"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingRoutineId(null)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleSaveRoutineHeader(routine.id)}
                      className="px-4 py-1.5 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs flex items-center gap-1 hover:bg-[#b8e600]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 shrink-0">
                      {getIcon(routine.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 
                          onClick={() => handleStartEditRoutine(routine)}
                          className="text-lg font-bold text-neutral-100 group-hover:text-[#D1FF00] transition cursor-pointer hover:underline flex items-center gap-1.5"
                          title="برای ویرایش نام کلیک کنید"
                        >
                          <span>{routine.titleFa}</span>
                          <Edit3 className="w-3.5 h-3.5 text-neutral-500 hover:text-[#D1FF00] inline" />
                        </h4>
                      </div>
                      <p 
                        onClick={() => handleStartEditRoutine(routine)}
                        className="text-xs text-neutral-400 mt-1 cursor-pointer hover:text-neutral-200"
                      >
                        {routine.subtitleFa}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEditRoutine(routine)}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-[#D1FF00] border border-neutral-800 transition"
                      title="ویرایش عنوان و عضلات این روز"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onStartWorkout(routine)}
                      className="py-2.5 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] active:scale-95 text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#D1FF00]/15 transition"
                    >
                      <Play className="w-4 h-4 fill-[#0A0A0A]" />
                      شروع تمرین
                    </button>
                  </div>
                </div>
              )}

              {/* Target Muscle Badges */}
              {!isHeaderEditing && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {routine.targetMusclesFa.map((muscle, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800 text-[11px] font-semibold"
                    >
                      💪 {muscle}
                    </span>
                  ))}
                </div>
              )}

              {/* Exercise Preview List & Inline Row Editing */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
                  <span>فهرست حرکات این روز ({routine.exercises.length} حرکت):</span>
                  <span className="text-[11px] text-[#D1FF00] font-normal">
                    روی هر حرکت کلیک کنید جهت آموزش یا ویرایش
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {routine.exercises.map((ex, idx) => {
                    const isExEditing = editingExerciseId === ex.id;

                    if (isExEditing) {
                      return (
                        <div
                          key={ex.id}
                          className="p-3 rounded-2xl bg-black border border-[#D1FF00]/60 space-y-2.5 col-span-1 sm:col-span-2 shadow-lg"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                            <span className="text-xs font-bold text-[#D1FF00]">ویرایش حرکت #{idx + 1}</span>
                            <button
                              onClick={(e) => handleDeleteExerciseInline(routine.id, ex.id, e)}
                              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف حرکت
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="col-span-1 sm:col-span-2">
                              <label className="text-[10px] text-neutral-400 block mb-1">نام حرکت (فارسی):</label>
                              <input
                                type="text"
                                value={exNameFa}
                                onChange={(e) => setExNameFa(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">تعداد ست:</label>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={exTargetSets}
                                onChange={(e) => setExTargetSets(Number(e.target.value))}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">تعداد تکرار (مثلا 10-12):</label>
                              <input
                                type="text"
                                value={exTargetReps}
                                onChange={(e) => setExTargetReps(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                              />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                              <label className="text-[10px] text-neutral-400 block mb-1">عضله هدف:</label>
                              <input
                                type="text"
                                value={exTargetMuscleFa}
                                onChange={(e) => setExTargetMuscleFa(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#D1FF00] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExerciseId(null);
                              }}
                              className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700"
                            >
                              انصراف
                            </button>
                            <button
                              onClick={(e) => handleSaveExerciseInline(routine.id, ex.id, e)}
                              className="px-4 py-1 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs flex items-center gap-1 hover:bg-[#b8e600]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              ذخیره
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={ex.id}
                        onClick={() => setSelectedExerciseModal(ex)}
                        className="p-2.5 rounded-2xl bg-[#0a0a0a] border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between cursor-pointer group/ex transition"
                      >
                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-200 min-w-0 pr-1">
                          <span className="w-5 h-5 rounded-full bg-neutral-800 text-[#D1FF00] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="group-hover/ex:text-[#D1FF00] transition truncate font-bold">{ex.nameFa}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
                            {ex.targetSets} ست × {ex.targetReps}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMwExerciseModal(ex);
                            }}
                            className="py-0.5 px-1.5 rounded-lg bg-[#D1FF00]/10 hover:bg-[#D1FF00]/20 text-[#D1FF00] font-extrabold text-[10px] border border-[#D1FF00]/30 transition flex items-center gap-1"
                            title="مشاهده اطلاعات کامل و زوایای ویدیو از MuscleWiki"
                          >
                            <Zap className="w-3 h-3 stroke-[2.5]" />
                            <span>MW</span>
                          </button>

                          <button
                            onClick={(e) => handleStartEditExercise(ex, e)}
                            className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-[#D1FF00] transition"
                            title="ویرایش مستقیم اسم و ست‌های این حرکت"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <Info className="w-3.5 h-3.5 text-neutral-500 group-hover/ex:text-[#D1FF00] transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Exercise to Day */}
                {addingToRoutineId === routine.id ? (
                  <div className="p-3 bg-neutral-900/90 border border-[#D1FF00]/40 rounded-2xl space-y-2 mt-2">
                    <span className="text-xs font-bold text-[#D1FF00] block">افزودن حرکت جدید به این روز</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="col-span-1 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="نام حرکت (مثال: زیربغل سیم‌کش دست باز)"
                          value={newExNameFa}
                          onChange={(e) => setNewExNameFa(e.target.value)}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-white placeholder-neutral-500 focus:border-[#D1FF00] focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="تعداد ست (مثال 4)"
                          value={newExSets}
                          onChange={(e) => setNewExSets(Number(e.target.value))}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-white focus:border-[#D1FF00] focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="تکرارها (مثال 10-12)"
                          value={newExReps}
                          onChange={(e) => setNewExReps(e.target.value)}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-white focus:border-[#D1FF00] focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="عضله هدف (مثال: زیربغل)"
                          value={newExMuscle}
                          onChange={(e) => setNewExMuscle(e.target.value)}
                          className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-white placeholder-neutral-500 focus:border-[#D1FF00] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setAddingToRoutineId(null)}
                        className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleSaveNewExercise(routine.id)}
                        className="px-4 py-1 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs flex items-center gap-1 hover:bg-[#b8e600]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        افزودن به برنامه
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingToRoutineId(routine.id);
                      setNewExNameFa('');
                      setNewExSets(3);
                      setNewExReps('8-12');
                      setNewExMuscle('');
                    }}
                    className="w-full py-2 border border-dashed border-neutral-800 hover:border-[#D1FF00]/50 rounded-2xl text-xs text-neutral-400 hover:text-[#D1FF00] font-semibold flex items-center justify-center gap-1.5 transition mt-2 bg-[#080808]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن حرکت جدید به این روز</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExerciseModal}
        pastSessions={pastSessions}
        onClose={() => setSelectedExerciseModal(null)}
        onUpdateExerciseMedia={(exerciseId, mediaUrl) => {
          if (selectedExerciseModal && selectedExerciseModal.id === exerciseId) {
            setSelectedExerciseModal({
              ...selectedExerciseModal,
              gifUrl: mediaUrl
            });
          }
          if (onUpdateExerciseMedia) {
            onUpdateExerciseMedia(exerciseId, mediaUrl);
          }
        }}
        onUpdateExerciseDetails={(exerciseId, updatedFields) => {
          if (selectedExerciseModal && selectedExerciseModal.id === exerciseId) {
            setSelectedExerciseModal({
              ...selectedExerciseModal,
              ...updatedFields
            });
          }
          if (onUpdateRoutines) {
            const updated = routines.map((day) => ({
              ...day,
              exercises: day.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updatedFields } : ex))
            }));
            onUpdateRoutines(updated);
          }
        }}
      />

      {/* Standalone MuscleWiki Detail Modal */}
      {selectedMwExerciseModal && (
        <MuscleWikiDetailModal
          exercise={selectedMwExerciseModal}
          onClose={() => setSelectedMwExerciseModal(null)}
          onApplyToExercise={(mwData) => {
            if (onUpdateExerciseMedia) {
              onUpdateExerciseMedia(selectedMwExerciseModal.id, mwData.gifUrl);
            }
            if (onUpdateRoutines) {
              const updated = routines.map((day) => ({
                ...day,
                exercises: day.exercises.map((ex) =>
                  ex.id === selectedMwExerciseModal.id
                    ? {
                        ...ex,
                        gifUrl: mwData.gifUrl,
                        instructionsFa: mwData.instructionsFa,
                        tipsFa: mwData.tipsFa,
                        nameEn: mwData.nameEn || ex.nameEn
                      }
                    : ex
                )
              }));
              onUpdateRoutines(updated);
            }
          }}
        />
      )}
    </div>
  );
};

