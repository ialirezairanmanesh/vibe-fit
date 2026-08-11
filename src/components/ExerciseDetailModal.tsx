import React, { useState, useRef, useEffect } from 'react';
import { Exercise, ExerciseLog, WorkoutSession } from '../types';
import { ExerciseAnimation } from './ExerciseAnimation';
import { MuscleWikiDetailModal } from './MuscleWikiDetailModal';
import { X, Dumbbell, Target, Layers, Lightbulb, Trophy, Upload, Link as LinkIcon, Trash2, Image, Check, Edit3, Save, Zap } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  historyLogs?: ExerciseLog[];
  pastSessions?: WorkoutSession[];
  onClose: () => void;
  onUpdateExerciseMedia?: (exerciseId: string, customMediaUrl: string | undefined) => void;
  onUpdateExerciseDetails?: (exerciseId: string, updatedFields: Partial<Exercise>) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  historyLogs = [],
  pastSessions = [],
  onClose,
  onUpdateExerciseMedia,
  onUpdateExerciseDetails
}) => {
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editNameFa, setEditNameFa] = useState<string>('');
  const [editNameEn, setEditNameEn] = useState<string>('');
  const [editTargetSets, setEditTargetSets] = useState<number>(3);
  const [editTargetReps, setEditTargetReps] = useState<string>('8-12');
  const [editTargetMuscleFa, setEditTargetMuscleFa] = useState<string>('');
  const [editEquipmentFa, setEditEquipmentFa] = useState<string>('');
  const [editIsBodyweight, setEditIsBodyweight] = useState<boolean>(false);

  const [showMwModal, setShowMwModal] = useState<boolean>(false);

  useEffect(() => {
    if (exercise) {
      setEditNameFa(exercise.nameFa || '');
      setEditNameEn(exercise.nameEn || '');
      setEditTargetSets(exercise.targetSets || 3);
      setEditTargetReps(exercise.targetReps || '8-12');
      setEditTargetMuscleFa(exercise.targetMuscleFa || '');
      setEditEquipmentFa(exercise.equipmentFa || '');
      setEditIsBodyweight(!!exercise.isBodyweight);
      setIsEditing(false);
    }
  }, [exercise]);

  if (!exercise) return null;

  const handleSaveDetails = () => {
    if (!editNameFa.trim()) {
      alert('نام حرکت نمی‌تواند خالی باشد.');
      return;
    }
    if (onUpdateExerciseDetails) {
      onUpdateExerciseDetails(exercise.id, {
        nameFa: editNameFa.trim(),
        nameEn: editNameEn.trim(),
        targetSets: Math.max(1, Number(editTargetSets) || 3),
        targetReps: editTargetReps.trim() || '8-12',
        targetMuscleFa: editTargetMuscleFa.trim() || exercise.targetMuscleFa,
        equipmentFa: editEquipmentFa.trim() || exercise.equipmentFa,
        isBodyweight: editIsBodyweight
      });
      setUploadSuccessMsg('تغییرات نام و برنامه‌ی حرکت با موفقیت ذخیره شد!');
      setIsEditing(false);
      setTimeout(() => setUploadSuccessMsg(''), 3000);
    }
  };

  // Handle local file upload (images & GIFs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('حجم فایل انتخابی بیش از ۱۵ مگابایت است. لطفاً فایل کوچک‌تری انتخاب کنید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url && onUpdateExerciseMedia) {
        onUpdateExerciseMedia(exercise.id, base64Url);
        setUploadSuccessMsg('تصویر اختصاصی با موفقیت روی این حرکت ذخیره شد!');
        setTimeout(() => setUploadSuccessMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle direct image URL submit
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    if (onUpdateExerciseMedia) {
      onUpdateExerciseMedia(exercise.id, customUrl.trim());
      setUploadSuccessMsg('لینک تصویر شخصی قرار داده شد!');
      setShowUrlInput(false);
      setCustomUrl('');
      setTimeout(() => setUploadSuccessMsg(''), 3000);
    }
  };

  // Handle removing custom media
  const handleRemoveCustomMedia = () => {
    if (onUpdateExerciseMedia) {
      onUpdateExerciseMedia(exercise.id, undefined);
      setUploadSuccessMsg('تصویر شخصی حذف شد و گیف اصلی بازگردانده شد.');
      setTimeout(() => setUploadSuccessMsg(''), 3000);
    }
  };

  // Calculate highest weight lifted for this exercise in history
  let personalRecord = 0;
  
  historyLogs.forEach((log) => {
    log.sets.forEach((set) => {
      if (set.isCompleted && set.actualWeight > personalRecord) {
        personalRecord = set.actualWeight;
      }
    });
  });

  pastSessions.forEach((session) => {
    session.exercises.forEach((exLog) => {
      if (exLog.exerciseId === exercise.id) {
        exLog.sets.forEach((set) => {
          if (set.isCompleted && set.actualWeight > personalRecord) {
            personalRecord = set.actualWeight;
          }
        });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 backdrop-blur gap-2">
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[10px] text-[#D1FF00] font-bold block mb-1">نام فارسی حرکت:</label>
                <input
                  type="text"
                  value={editNameFa}
                  onChange={(e) => setEditNameFa(e.target.value)}
                  className="w-full bg-black/80 border border-[#D1FF00]/50 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#D1FF00]"
                  placeholder="نام حرکت به فارسی"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">نام انگلیسی (جهت جستجوی انیمیشن/گیف):</label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full bg-black/80 border border-neutral-700 rounded-xl px-3 py-1 text-xs text-neutral-300 font-mono dir-ltr focus:outline-none focus:border-[#D1FF00]"
                  placeholder="English Name"
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{exercise.nameFa}</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono dir-ltr text-right">{exercise.nameEn}</p>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {onUpdateExerciseDetails && (
              isEditing ? (
                <button
                  onClick={handleSaveDetails}
                  className="py-1.5 px-3 rounded-xl bg-[#D1FF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[#D1FF00] font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition"
                  title="ویرایش مستقیم نام و مشخصات حرکت"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش</span>
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
          {/* MuscleWiki Comprehensive Intelligence Banner */}
          <div className="p-3.5 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-[#D1FF00]/10 border border-[#D1FF00]/40 rounded-2xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D1FF00]/20 border border-[#D1FF00]/40 flex items-center justify-center text-[#D1FF00] shrink-0">
                <Zap className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white">اطلاعات کامل و زوایای حرکت از MuscleWiki</p>
                <p className="text-[10px] text-neutral-400">مشاهده مدل آقایان/بانوان، آناتومی عضلات و مراحل استاندارد</p>
              </div>
            </div>

            <button
              onClick={() => setShowMwModal(true)}
              className="py-2 px-3.5 bg-[#D1FF00] hover:bg-[#b8e600] text-black font-extrabold text-xs rounded-xl shrink-0 transition active:scale-95 shadow-lg shadow-[#D1FF00]/10 flex items-center gap-1"
            >
              <span>مشاهده</span>
            </button>
          </div>

          {/* Animated Offline Visual Guide */}
          <ExerciseAnimation
            type={exercise.animationType}
            category={exercise.category}
            gifUrl={exercise.gifUrl}
            exerciseNameEn={exercise.nameEn}
            className="w-full h-52 sm:h-60"
          />

          {/* Upload Custom Media Section */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#D1FF00]" />
                تصویر، GIF یا ویدیوی اختصاصی این حرکت
              </span>

              {exercise.gifUrl && (
                <button
                  onClick={handleRemoveCustomMedia}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف و بازگشت به گیف اصلی
                </button>
              )}
            </div>

            {uploadSuccessMsg && (
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*,.gif,.webp,.mp4,.mov,.webm"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-[#D1FF00]/15 hover:bg-[#D1FF00]/25 border border-[#D1FF00]/40 text-[#D1FF00] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>انتخاب عکس/ویدیو از گالری</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <LinkIcon className="w-4 h-4 text-[#D1FF00]" />
                <span>لینک عکس / ویدیو / آپارات</span>
              </button>
            </div>

            {showUrlInput && (
              <form onSubmit={handleUrlSubmit} className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="لینک عکس، ویدیو (MP4) یا آپارات / یوتیوب"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D1FF00]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#D1FF00] text-black font-extrabold text-xs rounded-xl shadow hover:bg-[#b8e600] transition shrink-0"
                >
                  ثبت
                </button>
              </form>
            )}
          </div>

          {/* Quick Badges / Editable Fields */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex items-center gap-2.5">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="w-full">
                <p className="text-slate-400">عضله هدف</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editTargetMuscleFa}
                    onChange={(e) => setEditTargetMuscleFa(e.target.value)}
                    className="w-full mt-1 bg-black/80 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D1FF00]"
                  />
                ) : (
                  <p className="font-semibold text-slate-200">{exercise.targetMuscleFa}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex items-center gap-2.5">
              <Dumbbell className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="w-full">
                <p className="text-slate-400">تجهیزات</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editEquipmentFa}
                    onChange={(e) => setEditEquipmentFa(e.target.value)}
                    className="w-full mt-1 bg-black/80 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D1FF00]"
                  />
                ) : (
                  <p className="font-semibold text-slate-200">{exercise.equipmentFa}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Layers className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="w-full">
                <p className="text-slate-400">برنامه (ست × تکرار)</p>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editTargetSets}
                      onChange={(e) => setEditTargetSets(Number(e.target.value))}
                      className="w-12 bg-black/80 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-[#D1FF00]"
                    />
                    <span className="text-neutral-400">ست ×</span>
                    <input
                      type="text"
                      value={editTargetReps}
                      onChange={(e) => setEditTargetReps(e.target.value)}
                      className="w-16 bg-black/80 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-[#D1FF00]"
                      placeholder="8-12"
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-slate-200">{exercise.targetSets} ست × {exercise.targetReps} تکرار</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-slate-400">رکورد شخصی (PR)</p>
                <p className="font-semibold text-amber-300">
                  {personalRecord > 0 ? `${personalRecord} کیلوگرم` : 'ثبت نشده'}
                </p>
              </div>
            </div>
          </div>

          {/* Bodyweight vs Weight mode toggle */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>{(isEditing ? editIsBodyweight : exercise.isBodyweight) ? '👤 حرکت با وزن بدن (بدون وزنه)' : '🏋️ حرکت با وزنه'}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {(isEditing ? editIsBodyweight : exercise.isBodyweight)
                  ? 'این حرکت بدون نیاز به وزنه ثبت می‌شود (مانند بارفیکس، دراز و نشست، شنا)'
                  : 'برای این حرکت فیلد ثبت مقدار وزنه (کیلوگرم) فعال است'}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setEditIsBodyweight(!editIsBodyweight)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition text-xs shrink-0 ${
                  editIsBodyweight
                    ? 'bg-[#D1FF00]/15 border-[#D1FF00]/40 text-[#D1FF00]'
                    : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                {editIsBodyweight ? 'تغییر به با وزنه' : 'تغییر به وزن بدن'}
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              نحوه اجرای صحیح حرکت
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-800/30 p-3.5 rounded-2xl border border-slate-800">
              {exercise.instructionsFa.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          {exercise.tipsFa && exercise.tipsFa.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                نکات مهم کلیدی
              </h3>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 space-y-1">
                {exercise.tipsFa.map((tip, idx) => (
                  <p key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MuscleWiki Detail Modal */}
      {showMwModal && (
        <MuscleWikiDetailModal
          exercise={exercise}
          onClose={() => setShowMwModal(false)}
          onApplyToExercise={(mwData) => {
            if (onUpdateExerciseMedia) {
              onUpdateExerciseMedia(exercise.id, mwData.gifUrl);
            }
            if (onUpdateExerciseDetails) {
              onUpdateExerciseDetails(exercise.id, {
                instructionsFa: mwData.instructionsFa,
                tipsFa: mwData.tipsFa,
                nameEn: mwData.nameEn || exercise.nameEn
              });
            }
          }}
        />
      )}
    </div>
  );
};
