import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, ExerciseCategory, RoutineDay } from '../types';
import { ExerciseAnimation } from './ExerciseAnimation';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { MuscleWikiDetailModal } from './MuscleWikiDetailModal';
import {
  Search,
  Dumbbell,
  Filter,
  Plus,
  Info,
  Sparkles,
  Check,
  X,
  Globe,
  Layers,
  Cpu,
  BookmarkPlus,
  BookOpen,
  HelpCircle,
  Terminal,
  ExternalLink,
  Copy,
  Code,
  Zap,
  Play,
  Video,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import {
  MUSCLEWIKI_CATEGORIES,
  MUSCLEWIKI_EQUIPMENT,
  MuscleWikiExercise
} from '../data/musclewikiDataset';

interface ExerciseLibraryProps {
  routines: RoutineDay[];
  onAddCustomExercise?: (newEx: Exercise, dayId: string) => void;
  onUpdateExerciseMedia?: (exerciseId: string, customMediaUrl: string | undefined) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  routines,
  onAddCustomExercise,
  onUpdateExerciseMedia
}) => {
  // Aggregate all exercises from user's current routines
  const localExercises = useMemo(() => {
    const list: Exercise[] = [];
    const seen = new Set<string>();

    routines.forEach((r) => {
      r.exercises.forEach((ex) => {
        if (!seen.has(ex.id)) {
          seen.add(ex.id);
          list.push(ex);
        }
      });
    });

    return list;
  }, [routines]);

  // View Sub-Tab
  const [activeTab, setActiveTab] = useState<'local' | 'musclewiki' | 'inspector'>('local');

  // MuscleWiki API Inspector & Tester State
  const [testQuery, setTestQuery] = useState<string>('Bench Press');
  const [testCategory, setTestCategory] = useState<string>('all');
  const [testEquipment, setTestEquipment] = useState<string>('all');
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const [testResponseTimeMs, setTestResponseTimeMs] = useState<number | null>(null);
  const [testStatusCode, setTestStatusCode] = useState<number | null>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [copiedUrlToast, setCopiedUrlToast] = useState<string | null>(null);

  // Inspector API Call Runner
  const handleRunInspectorTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTestingApi(true);
    const start = performance.now();
    try {
      const params = new URLSearchParams();
      if (testQuery) params.append('q', testQuery);
      if (testCategory && testCategory !== 'all') params.append('category', testCategory);
      if (testEquipment && testEquipment !== 'all') params.append('equipment', testEquipment);

      const url = `/api/musclewiki/exercises?${params.toString()}`;
      console.log('[MuscleWiki Inspector] Testing endpoint:', url);

      const res = await fetch(url);
      const duration = Math.round(performance.now() - start);
      setTestResponseTimeMs(duration);
      setTestStatusCode(res.status);

      if (res.ok) {
        const json = await res.json();
        setTestResponseData(json);
      } else {
        const errText = await res.text();
        setTestResponseData({ error: true, status: res.status, raw: errText });
      }
    } catch (err: any) {
      console.error('[MuscleWiki Inspector] Test failed:', err);
      setTestResponseData({ error: true, message: err.message });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Local Search & Category State
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localCategory, setLocalCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);

  // MuscleWiki Explorer State
  const [mwSearchTerm, setMwSearchTerm] = useState('');
  const [mwCategory, setMwCategory] = useState<string>('all');
  const [mwEquipment, setMwEquipment] = useState<string>('all');
  const [mwExercises, setMwExercises] = useState<MuscleWikiExercise[]>([]);
  const [mwFetchError, setMwFetchError] = useState<string | null>(null);
  const [isLoadingMw, setIsLoadingMw] = useState<boolean>(false);
  const [selectedMwModal, setSelectedMwModal] = useState<MuscleWikiExercise | null>(null);

  // Add to Routine Picker Modal State
  const [addingMwExercise, setAddingMwExercise] = useState<MuscleWikiExercise | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>(routines[0]?.id || 'day-1');
  const [targetSets, setTargetSets] = useState<number>(3);
  const [targetReps, setTargetReps] = useState<string>('10-12');
  const [addedSuccessToast, setAddedSuccessToast] = useState<string | null>(null);

  // New Custom Exercise Form Modal State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newExNameFa, setNewExNameFa] = useState('');
  const [newExNameEn, setNewExNameEn] = useState('');
  const [newExCategory, setNewExCategory] = useState<ExerciseCategory>('chest');
  const [newExTargetMuscle, setNewExTargetMuscle] = useState('');
  const [newExEquipment, setNewExEquipment] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState('10');
  const [newExTargetDayId, setNewExTargetDayId] = useState(routines[0]?.id || 'day-1');
  const [newExIsBodyweight, setNewExIsBodyweight] = useState(false);

  // MCP Info Modal State
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);

  // Fetch MuscleWiki exercises via backend API when filters change
  useEffect(() => {
    if (activeTab !== 'musclewiki') return;

    let isMounted = true;
    setIsLoadingMw(true);

    const queryParams = new URLSearchParams();
    if (mwSearchTerm) queryParams.append('search', mwSearchTerm);
    if (mwCategory && mwCategory !== 'all') queryParams.append('category', mwCategory);
    if (mwEquipment && mwEquipment !== 'all') queryParams.append('equipment', mwEquipment);

    console.log('[ExerciseLibrary] Fetching MuscleWiki exercises:', queryParams.toString());

    setMwFetchError(null);
    fetch(`/api/musclewiki/exercises?${queryParams.toString()}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        return data;
      })
      .then((data) => {
        if (!isMounted) return;
        console.log('[ExerciseLibrary] Received MuscleWiki exercises count:', data?.exercises?.length, 'source:', data?.source);
        setMwExercises(Array.isArray(data?.exercises) ? data.exercises : []);
        setMwFetchError(null);
      })
      .catch((err) => {
        console.warn('[ExerciseLibrary] MuscleWiki API fetch error:', err);
        if (isMounted) {
          setMwExercises([]);
          setMwFetchError(err?.message || 'خطا در دریافت حرکات از MuscleWiki API');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingMw(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, mwSearchTerm, mwCategory, mwEquipment]);

  // Filtered Local Exercises
  const filteredLocalExercises = useMemo(() => {
    return localExercises.filter((ex) => {
      const matchesSearch =
        ex.nameFa.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        ex.nameEn.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        ex.targetMuscleFa.toLowerCase().includes(localSearchTerm.toLowerCase());

      const matchesCategory = localCategory === 'all' || ex.category === localCategory;

      return matchesSearch && matchesCategory;
    });
  }, [localExercises, localSearchTerm, localCategory]);

  const localCategoryLabels: { id: ExerciseCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'همه حرکات' },
    { id: 'chest', label: 'سینه' },
    { id: 'biceps', label: 'جلو بازو' },
    { id: 'triceps', label: 'پشت بازو' },
    { id: 'legs', label: 'عضلات پا' },
    { id: 'shoulders', label: 'سرشانه' },
    { id: 'back', label: 'زیر بغل و پشت' },
    { id: 'abs', label: 'شکم' }
  ];

  // Handle adding custom manual exercise
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExNameFa.trim()) return;

    const created: Exercise = {
      id: `custom-${Date.now()}`,
      nameFa: newExNameFa.trim(),
      nameEn: newExNameEn.trim() || newExNameFa.trim(),
      category: newExCategory,
      targetMuscleFa: newExTargetMuscle || 'عضلات هدف',
      equipmentFa: newExEquipment || (newExIsBodyweight ? 'وزن بدن' : 'دمبل / وزنه'),
      targetSets: newExSets,
      targetReps: newExReps,
      defaultRestSeconds: 60,
      instructionsFa: ['حرکت را با کنترل انجام دهید.', 'در اوج حرکت ۱ ثانیه انقباض ایجاد کنید.'],
      tipsFa: ['فرم صحیح تنفس را رعایت کنید.'],
      animationType: 'generic',
      isBodyweight: newExIsBodyweight
    };

    if (onAddCustomExercise) {
      onAddCustomExercise(created, newExTargetDayId);
    }

    setIsAddFormOpen(false);
    setNewExNameFa('');
    setNewExNameEn('');
  };

  // Convert MuscleWiki exercise to App Exercise and add to routine
  const handleConfirmAddMwToRoutine = () => {
    if (!addingMwExercise) return;

    const converted: Exercise = {
      id: `mw-${addingMwExercise.id}-${Date.now()}`,
      nameFa: addingMwExercise.nameFa,
      nameEn: addingMwExercise.nameEn,
      category: addingMwExercise.category as ExerciseCategory,
      targetMuscleFa: addingMwExercise.targetMuscleFa || addingMwExercise.targetMuscleEn || 'عضلات هدف',
      equipmentFa: addingMwExercise.equipmentFa || addingMwExercise.equipmentEn || 'تجهیزات',
      targetSets: targetSets,
      targetReps: targetReps,
      defaultRestSeconds: addingMwExercise.defaultRestSeconds || 60,
      instructionsFa: addingMwExercise.instructionsFa || [],
      tipsFa: addingMwExercise.tipsFa || [],
      animationType: 'generic',
      gifUrl: addingMwExercise.gifUrl,
      isBodyweight: (addingMwExercise.equipmentEn || '').toLowerCase().includes('bodyweight')
    };

    if (onAddCustomExercise) {
      onAddCustomExercise(converted, targetDayId);
    }

    const targetDayObj = routines.find((r) => r.id === targetDayId);
    setAddedSuccessToast(
      `حرکت "${addingMwExercise.nameFa}" با موفقیت به ${targetDayObj?.titleFa || 'برنامه'} اضافه شد!`
    );
    setTimeout(() => setAddedSuccessToast(null), 4000);

    setAddingMwExercise(null);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {addedSuccessToast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 bg-slate-950 text-emerald-400 rounded-full p-1" />
            <span>{addedSuccessToast}</span>
          </div>
          <button onClick={() => setAddedSuccessToast(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#D1FF00]" />
            بانک و مرجع تخصصی حرکات ورزشی
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            مشاهده حرکات برنامه‌تان + دسترسی به دیتابیس کامل و بین‌المللی MuscleWiki
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMcpModalOpen(true)}
            className="px-3 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-[#D1FF00] border border-neutral-800 text-xs font-bold transition flex items-center gap-1.5"
            title="اطلاعات پروتکل MCP و سرویس MuscleWiki"
          >
            <Cpu className="w-4 h-4" />
            <span>پروتکل MCP</span>
          </button>

          <button
            onClick={() => setIsAddFormOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] text-[#0A0A0A] font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D1FF00]/15 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>افزودن حرکت جدید</span>
          </button>
        </div>
      </div>

      {/* Main Tab Toggle: Local Library vs MuscleWiki Database vs API Inspector */}
      <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveTab('local')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'local'
              ? 'bg-[#D1FF00] text-[#0A0A0A] shadow-md scale-[1.01]'
              : 'text-neutral-400 hover:text-slate-200 hover:bg-neutral-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>برنامه من ({localExercises.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('musclewiki')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'musclewiki'
              ? 'bg-[#D1FF00] text-[#0A0A0A] shadow-md scale-[1.01]'
              : 'text-neutral-400 hover:text-slate-200 hover:bg-neutral-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>مرجع MuscleWiki</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('inspector');
            if (!testResponseData) handleRunInspectorTest();
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'inspector'
              ? 'bg-[#D1FF00] text-[#0A0A0A] shadow-md scale-[1.01]'
              : 'text-neutral-400 hover:text-slate-200 hover:bg-neutral-800/60'
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>دیباگ & تست MuscleWiki</span>
          <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[9px] font-black border border-cyan-800/50">
            تست ویدیو
          </span>
        </button>
      </div>

      {/* TAB 1: LOCAL PROGRAM LIBRARY */}
      {activeTab === 'local' && (
        <div className="space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder="جستجوی نام حرکت یا عضله در برنامه‌تان (مثلاً: پرس سینه، دمبل چکشی، اسکوات...)"
              className="w-full pl-4 pr-11 py-3 bg-[#121212] border border-neutral-800 rounded-2xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#D1FF00] shadow-lg transition"
            />
          </div>

          {/* Categories Horizontal Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {localCategoryLabels.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setLocalCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  localCategory === cat.id
                    ? 'bg-[#D1FF00] text-[#0A0A0A] font-bold shadow-md shadow-[#D1FF00]/20 scale-105'
                    : 'bg-[#121212] text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLocalExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-[#121212] border border-neutral-800/90 rounded-3xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative">
                    <ExerciseAnimation
                      type={exercise.animationType}
                      category={exercise.category}
                      gifUrl={exercise.gifUrl}
                      exerciseNameEn={exercise.nameEn}
                      className="w-full h-48 sm:h-52"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-neutral-100">{exercise.nameFa}</h3>
                        <p className="text-xs text-neutral-400 font-mono dir-ltr text-right">{exercise.nameEn}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-neutral-900 text-[#D1FF00] text-[11px] font-semibold border border-neutral-800 shrink-0">
                        {exercise.targetSets} ست × {exercise.targetReps}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1">
                      <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-xl text-neutral-300">
                        🎯 {exercise.targetMuscleFa}
                      </span>
                      <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-xl text-neutral-300">
                        🛠️ {exercise.equipmentFa}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedExerciseModal(exercise)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Info className="w-4 h-4 text-[#D1FF00]" />
                    مشاهده ویدیوی باکیفیت و آموزش حرکت
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MUSCLEWIKI INTERNATIONAL DATABASE EXPLORER */}
      {activeTab === 'musclewiki' && (
        <div className="space-y-5">
          {/* MuscleWiki Banner & Intro */}
          <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#D1FF00] flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                پایگاه داده بین‌المللی MuscleWiki API
              </span>
              <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-800 font-mono">
                +1,900 Exercises & GIFs
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              جستجو در بانک حرکات MuscleWiki به زبان فارسی و انگلیسی. می‌توانید هر حرکت را مشاهده کرده و مستقیماً با یک کلیک به برنامه روزانه خود اضافه کنید!
            </p>
          </div>

          {/* MuscleWiki Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={mwSearchTerm}
              onChange={(e) => setMwSearchTerm(e.target.value)}
              placeholder="جستجوی حرکت در MuscleWiki (مثلاً: Bicep Curl, Bench Press, Squat, سینه...)"
              className="w-full pl-4 pr-11 py-3 bg-[#121212] border border-neutral-800 rounded-2xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#D1FF00] shadow-lg transition"
            />
          </div>

          {/* Muscle Categories Horizontal Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 block">فیلتر بر اساس عضله هدف:</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {MUSCLEWIKI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setMwCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    mwCategory === cat.id
                      ? 'bg-[#D1FF00] text-[#0A0A0A] font-bold shadow-md shadow-[#D1FF00]/20 scale-105'
                      : 'bg-[#121212] text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {cat.labelFa}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Selector Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 block">فیلتر بر اساس تجهیزات:</span>
            <div className="flex flex-wrap gap-2">
              {MUSCLEWIKI_EQUIPMENT.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => setMwEquipment(eq.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition ${
                    mwEquipment === eq.id
                      ? 'bg-neutral-100 text-black shadow-sm'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {eq.labelFa}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingMw && (
            <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D1FF00] animate-spin" />
              <span>در حال فراخوانی MuscleWiki API...</span>
            </div>
          )}

          {!isLoadingMw && mwFetchError && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
              {mwFetchError}
            </div>
          )}

          {!isLoadingMw && !mwFetchError && mwExercises.length === 0 && (
            <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-neutral-400 text-sm text-center">
              حرکتی از MuscleWiki پیدا نشد.
            </div>
          )}

          {/* MuscleWiki Exercise Grid */}
          {!isLoadingMw && !mwFetchError && mwExercises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mwExercises.map((mwEx) => (
                <div
                  key={mwEx.id}
                  className="bg-[#121212] border border-neutral-800 rounded-3xl overflow-hidden hover:border-[#D1FF00]/40 transition flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Media Preview */}
                    <div className="relative bg-slate-950 h-52 overflow-hidden flex items-center justify-center border-b border-neutral-800">
                      <ExerciseAnimation
                        type="generic"
                        category={(mwEx.category as ExerciseCategory) || 'chest'}
                        gifUrl={mwEx.gifUrl}
                        exerciseNameEn={mwEx.nameEn}
                        className="w-full h-full"
                      />

                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-[#D1FF00] font-bold border border-[#D1FF00]/20">
                        MuscleWiki API
                      </span>

                      {mwEx.difficultyFa && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-neutral-900/90 text-[10px] text-neutral-300 font-bold border border-neutral-800">
                          {mwEx.difficultyFa}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-100">{mwEx.nameFa}</h3>
                          <p className="text-xs text-neutral-400 font-mono dir-ltr text-right">{mwEx.nameEn}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1">
                        {(mwEx.targetMuscleFa || mwEx.targetMuscleEn) && (
                          <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-xl text-slate-300">
                            🎯 {mwEx.targetMuscleFa || mwEx.targetMuscleEn}
                          </span>
                        )}
                        {(mwEx.equipmentFa || mwEx.equipmentEn) && (
                          <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-xl text-slate-300">
                            🛠️ {mwEx.equipmentFa || mwEx.equipmentEn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedMwModal(mwEx)}
                      className="py-2.5 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Info className="w-3.5 h-3.5 text-[#D1FF00]" />
                      <span>راهنمای اجرا</span>
                    </button>

                    <button
                      onClick={() => setAddingMwExercise(mwEx)}
                      className="py-2.5 px-3 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-md"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>افزودن به برنامه</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MUSCLEWIKI API INSPECTOR & MEDIA TESTER */}
      {activeTab === 'inspector' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Info Banner */}
          <div className="p-5 bg-[#0D0D0D] border border-[#D1FF00]/30 rounded-3xl shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D1FF00]/10 border border-[#D1FF00]/40 flex items-center justify-center text-[#D1FF00]">
                  <Terminal className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    پنل تست زنده، دیباگر و مانیتورینگ MuscleWiki API
                  </h3>
                  <p className="text-xs text-neutral-400">
                    بررسی تمام داده‌های دریافتی از MuscleWiki API + دریافت و تست مستقیم ویدیوها
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                سرویس API سرور فعال است
              </span>
            </div>

            {/* Config & Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                <span className="text-neutral-400 block mb-1">کلید API:</span>
                <code className="text-[#D1FF00] font-mono text-[11px] block truncate">
                  از env: MUSCLEWIKI_API_KEY
                </code>
                <span className="text-[10px] text-neutral-500 mt-1 block">بدون کلید محلی — فقط API زنده</span>
              </div>

              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                <span className="text-neutral-400 block mb-1">اندپوینت سرور Express:</span>
                <code className="text-cyan-400 font-mono text-[11px] block">
                  /api/musclewiki/exercises
                </code>
                <span className="text-[10px] text-neutral-500 mt-1 block">حافظه In-Memory Cache (24 ساعت)</span>
              </div>

              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                <span className="text-neutral-400 block mb-1">مسیر پروکسی رسانه‌ها:</span>
                <code className="text-purple-400 font-mono text-[11px] block">
                  /api/proxy-media?url=...
                </code>
                <span className="text-[10px] text-neutral-500 mt-1 block">حل مشکل CORS و بارگذاری مستقیم</span>
              </div>
            </div>
          </div>

          {/* Interactive Request Form */}
          <form onSubmit={handleRunInspectorTest} className="p-4 bg-[#121212] border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D1FF00]" />
                ارسال درخواست زنده به سرور برای تست MuscleWiki
              </h4>
              <span className="text-[11px] text-neutral-500">متدهای پشتیبانی شده: GET, POST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">جستجوی عبارت (q):</label>
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="مثلا: Bench Press یا Squat"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#D1FF00]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">دسته‌بندی (category):</label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#D1FF00]"
                >
                  {MUSCLEWIKI_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.labelFa}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">تجهیزات (equipment):</label>
                <select
                  value={testEquipment}
                  onChange={(e) => setTestEquipment(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#D1FF00]"
                >
                  {MUSCLEWIKI_EQUIPMENT.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.labelFa}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={isTestingApi}
                className="py-2.5 px-5 rounded-2xl bg-[#D1FF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-[#D1FF00]/10"
              >
                {isTestingApi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال فراخوانی سرور...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>🚀 ارسال درخواست تست به API سرور</span>
                  </>
                )}
              </button>

              {testResponseData && (
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span>{showRawJson ? 'مخفی‌سازی JSON خام' : 'مشاهده JSON خام پاسخ'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Test Metrics Banner */}
          {testStatusCode !== null && (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40">
                  HTTP {testStatusCode} OK
                </span>
                <span className="text-neutral-400">
                  زمان پاسخ: <strong className="text-white font-mono">{testResponseTimeMs}ms</strong>
                </span>
                <span className="text-neutral-400">
                  تعداد حرکات دریافتی: <strong className="text-[#D1FF00] font-mono">{testResponseData?.count || testResponseData?.exercises?.length || 0}</strong>
                </span>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-300 text-[11px]">
                منبع دیتا: <strong className="text-cyan-400">{testResponseData?.source || 'MuscleWiki API'}</strong>
              </span>
            </div>
          )}

          {/* Raw JSON Code Block */}
          {showRawJson && testResponseData && (
            <div className="p-4 bg-[#090909] border border-cyan-900/50 rounded-2xl overflow-hidden space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                  <Code className="w-4 h-4" />
                  خروجی خام JSON دریافتی از API:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(testResponseData, null, 2));
                    setCopiedUrlToast('JSON به حافظه کپی شد!');
                    setTimeout(() => setCopiedUrlToast(null), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>کپی JSON</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono text-emerald-400 bg-black/90 p-3 rounded-xl overflow-x-auto max-h-80 custom-scrollbar ltr text-left">
                {JSON.stringify(testResponseData, null, 2)}
              </pre>
            </div>
          )}

          {/* Media & Direct Video Links Tester List */}
          {testResponseData?.exercises && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#D1FF00]" />
                  لیست حرکات دریافتی + لینک‌های مستقیم ویدیو/GIF برای تست:
                </h4>
                <span className="text-xs text-neutral-400">
                  برای تست مستقیم روی دکمه «لینک مستقیم» کلیک کنید تا در تب جدید مرورگر باز شود
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResponseData.exercises.map((ex: any, idx: number) => {
                  const mediaUrl = ex.gifUrl || ex.videoUrl || '';
                  return (
                    <div
                      key={ex.id || idx}
                      className="p-4 bg-[#121212] border border-neutral-800 rounded-3xl space-y-3 shadow-xl hover:border-neutral-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-bold text-white">{ex.nameFa || ex.nameEn}</h5>
                          <p className="text-xs text-neutral-400 font-mono text-right dir-ltr">{ex.nameEn}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#D1FF00]/10 text-[#D1FF00] text-[10px] font-bold border border-[#D1FF00]/30">
                          {ex.equipmentFa || ex.equipmentEn}
                        </span>
                      </div>

                      {/* Video / Animation Preview Box */}
                      <div className="relative h-48 bg-black rounded-2xl overflow-hidden border border-neutral-800">
                        <ExerciseAnimation
                          type="generic"
                          category={ex.category}
                          gifUrl={mediaUrl}
                          exerciseNameEn={ex.nameEn}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Direct Video Link Box & Buttons */}
                      <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                        <span className="text-[11px] font-bold text-neutral-400 block">لینک رسانه دریافتی:</span>
                        <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 font-mono text-[10px] text-cyan-300 truncate dir-ltr text-left">
                          {mediaUrl || 'بدون لینک رسانه'}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              if (mediaUrl) {
                                window.open(mediaUrl, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-[#D1FF00] hover:bg-[#b8e600] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>🔗 باز کردن مستقیم لینک</span>
                          </button>

                          <button
                            onClick={() => {
                              if (mediaUrl) {
                                navigator.clipboard.writeText(mediaUrl);
                                setCopiedUrlToast(`لینک ${ex.nameFa} کپی شد!`);
                                setTimeout(() => setCopiedUrlToast(null), 2000);
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#D1FF00]" />
                            <span>📋 کپی لینک</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Copied URL Toast */}
          {copiedUrlToast && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 bg-black text-emerald-400 rounded-full p-0.5" />
              <span>{copiedUrlToast}</span>
            </div>
          )}
        </div>
      )}
      {addingMwExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-[#D1FF00]" />
                افزودن حرکت به برنامه روزانه
              </h3>
              <button
                onClick={() => setAddingMwExercise(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <div className="w-14 h-14 bg-neutral-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-neutral-800">
                <img
                  src={addingMwExercise.gifUrl}
                  alt={addingMwExercise.nameFa}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-100 truncate">{addingMwExercise.nameFa}</h4>
                <p className="text-[10px] text-neutral-400 font-mono dir-ltr text-right truncate">
                  {addingMwExercise.nameEn}
                </p>
                <span className="text-[10px] text-[#D1FF00] block mt-0.5">
                  عضله: {addingMwExercise.targetMuscleFa}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">انتخاب روز برنامه:</label>
                <select
                  value={targetDayId}
                  onChange={(e) => setTargetDayId(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                >
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.titleFa} ({r.subtitleFa})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تعداد ست هدف:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={targetSets}
                    onChange={(e) => setTargetSets(parseInt(e.target.value, 10) || 3)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تکرار هدف:</label>
                  <input
                    type="text"
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                    placeholder="مثلا 10-12"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddingMwExercise(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmAddMwToRoutine}
                className="px-5 py-2.5 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs hover:bg-[#b8e600] shadow-md"
              >
                تایید و اضافه به برنامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MUSCLEWIKI EXERCISE COMPREHENSIVE DETAIL MODAL */}
      {selectedMwModal && (
        <MuscleWikiDetailModal
          exercise={selectedMwModal}
          onClose={() => setSelectedMwModal(null)}
          onApplyToExercise={() => {
            const m = selectedMwModal;
            setSelectedMwModal(null);
            setAddingMwExercise(m);
          }}
        />
      )}

      {/* MODAL 3: MCP PROTOCOL INFORMATION MODAL */}
      {isMcpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D1FF00]" />
                پروتکل Model Context Protocol (MCP)
              </h3>
              <button onClick={() => setIsMcpModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p>
                این اپلیکیشن شامل سرویس کامل <strong className="text-slate-100">MCP Server</strong> برای ارتباط همگام هوش مصنوعی با پایگاه داده MuscleWiki است.
              </p>

              <div className="p-3 bg-slate-950 rounded-2xl border border-neutral-800 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>MCP Endpoint:</span>
                  <span className="text-[#D1FF00]">/api/musclewiki/mcp</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Exercises Route:</span>
                  <span className="text-[#D1FF00]">/api/musclewiki/exercises</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Protocol Standard:</span>
                  <span className="text-slate-200">MCP v1.0.0</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-200 block">ابزارهای تعریف‌شده در MCP:</span>
                <ul className="list-disc pr-4 space-y-1 text-neutral-400 text-[11px]">
                  <li><strong className="text-slate-200">get_musclewiki_exercises</strong>: جستجو و فیلتر خودکار حرکات، عضلات هدف و تجهیزات</li>
                  <li><strong className="text-slate-200">get_exercise_details</strong>: دریافت انیمیشن‌های باکیفیت و آنالیز بیومکانیکی حرکت</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsMcpModalOpen(false)}
                className="py-2.5 px-5 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs hover:bg-[#b8e600]"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD CUSTOM MANUAL EXERCISE FORM */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleCreateExercise}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">افزودن حرکت سفارشی به برنامه</h3>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نام فارسی حرکت:</label>
                <input
                  type="text"
                  required
                  value={newExNameFa}
                  onChange={(e) => setNewExNameFa(e.target.value)}
                  placeholder="مثلا: جلو بازو لاری دمبل تک"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">دسته‌بندی:</label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value as ExerciseCategory)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  >
                    <option value="chest">سینه</option>
                    <option value="biceps">جلو بازو</option>
                    <option value="triceps">پشت بازو</option>
                    <option value="legs">عضلات پا</option>
                    <option value="shoulders">سرشانه</option>
                    <option value="back">زیر بغل</option>
                    <option value="abs">شکم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">روز برنامه:</label>
                  <select
                    value={newExTargetDayId}
                    onChange={(e) => setNewExTargetDayId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  >
                    {routines.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.titleFa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تعداد ست:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newExSets}
                    onChange={(e) => setNewExSets(parseInt(e.target.value, 10) || 3)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تکرار هدف:</label>
                  <input
                    type="text"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="مثلا 10 یا 12-10-8"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">عضله هدف:</label>
                <input
                  type="text"
                  value={newExTargetMuscle}
                  onChange={(e) => setNewExTargetMuscle(e.target.value)}
                  placeholder="مثلا بخش پایینی سینه"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-[#D1FF00]"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">حرکت با وزن بدن (بدون وزنه)</label>
                  <p className="text-[10px] text-slate-400">مانند بارفیکس، دراز و نشست، شنا و دیپس</p>
                </div>
                <input
                  type="checkbox"
                  checked={newExIsBodyweight}
                  onChange={(e) => setNewExIsBodyweight(e.target.checked)}
                  className="w-4 h-4 accent-[#D1FF00] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#D1FF00] text-black font-extrabold text-xs hover:bg-[#b8e600]"
              >
                ذخیره و افزودن
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExerciseModal}
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
      />
    </div>
  );
};
