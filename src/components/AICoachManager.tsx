import React, { useState, useEffect } from 'react';
import { getCustomAiConfig } from '../utils/aiConfig';
import { RoutineDay, UserProfile } from '../types';
import {
  saveChatSessionsPersistent,
  loadChatSessionsPersistent,
  clearChatHistoryPersistent,
  loadChatHistoryPersistent,
  loadUserChatSessionsPersistent,
  saveUserChatSessionsPersistent,
  ChatSession
} from '../utils/dbStorage';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
  Dumbbell,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  UserCheck,
  Trash2,
  History,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronLeft,
  MessageCircle
} from 'lucide-react';

interface AICoachManagerProps {
  routines: RoutineDay[];
  onApplyOptimizedRoutines: (newRoutines: RoutineDay[]) => void;
  activeUser?: UserProfile;
}

interface AnalysisResult {
  score: number;
  headline: string;
  overallAssessmentFa: string;
  muscleVolumeBreakdown: Array<{
    muscleNameFa: string;
    weeklySets: number;
    statusFa: string;
    recommendationFa: string;
  }>;
  strengthsFa: string[];
  warningsFa: string[];
  actionableTipsFa: string[];
  suggestedOptimizedRoutines?: RoutineDay[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AICoachManager: React.FC<AICoachManagerProps> = ({
  routines,
  onApplyOptimizedRoutines,
  activeUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'chat'>('audit');
  const [userGoal, setUserGoal] = useState<string>(activeUser?.goal || 'عضله‌سازی و افزایش حجم خشک (Hypertrophy)');
  const [userExperience, setUserExperience] = useState<string>(
    activeUser?.experienceLevel ? `${activeUser.experienceLevel}` : 'متوسط (۱ الی ۳ سال سابقه)'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Sync with activeUser when user switches
  useEffect(() => {
    if (activeUser?.goal) {
      setUserGoal(activeUser.goal);
    }
    if (activeUser?.experienceLevel) {
      setUserExperience(activeUser.experienceLevel);
    }
  }, [activeUser?.id, activeUser?.goal, activeUser?.experienceLevel]);

  const DEFAULT_WELCOME_MSG: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: activeUser?.name
      ? `سلام ${activeUser.name} عزیز! 👋 من مربی هوشمند AI شما هستم. با توجه به مشخصات و هدف ورزشی شما (${activeUser.goal || 'تناسب اندام'})، می‌تونم برنامه‌تون رو آنالیز کنم، حجم هر عضله رو ارزیابی کنم و به سوالات تمرین و تغذیه‌ات پاسخ بدم.`
      : 'سلام ورزشکار عزیز! 👋 من مربی هوشمند AI شما هستم. می‌تونم برنامه‌تون رو بر اساس اصول علوم ورزشی آنالیز کنم، حجم هر عضله رو چک کنم یا به سوالات تغذیه، مکمل‌ها و فرم حرکات پاسخ بدم. چه کمکی می‌تونم بکنم؟',
    timestamp: '۱۰:۰۰'
  };

  const DEFAULT_NUTRITION_MESSAGES: ChatMessage[] = [
    DEFAULT_WELCOME_MSG,
    {
      id: 'sample-user-nutrition',
      role: 'user',
      content:
        'سلام مربی! یک راهنمایی و نمونه برنامه غذایی جامع برای افزایش حجم خشک عضله و تنظیم درشت‌مغذی‌ها بهم بده.',
      timestamp: '۱۰:۰۱'
    },
    {
      id: 'sample-ai-nutrition',
      role: 'assistant',
      content:
        'درود! برای **افزایش حجم خشک (Lean Bulking)** و رشد عضلانی بدون چربی اضافه، اصول تغذیه‌ای زیر پیشنهاد میشه:\n\n🥗 **۱. تنظیم درشت‌مغذی‌ها (Macros):**\n• **پروتئین:** ۱.۸ تا ۲.۲ گرم به ازای هر کیلوگرم وزن بدن (منابع: فیله مرغ، تخم‌مرغ، گوشت کم‌چرب، ماهی، پروتئین وی).\n• **کربوهیدرات:** ۴ تا ۵ گرم به ازای هر کیلوگرم وزن بدن (منابع: جو دو سر، برنج، سیب‌زمینی، نان سنگک، موز).\n• **چربی‌های مفید:** ۰.۸ تا ۱ گرم به ازای هر کیلوگرم وزن بدن (منابع: گردو، بادام، روغن زیتون، آووکادو).\n\n⏱️ **۲. زمان‌بندی وعده‌ها (Nutrient Timing):**\n• **صبحانه:** جو دو سر + شیر + ۳ عدد سفیده تخم‌مرغ + ۱ عدد موز و عسل.\n• **میان‌وعده صبح:** یک مشت مغزیجات خام + یک عدد سیب.\n• **ناهار:** ۲۰۰ گرم برنج کته + ۱۵۰ گرم فیله مرغ یا گوشت + سالاد با روغن زیتون.\n• **قبل از تمرین (۲ ساعت قبل):** سیب‌زمینی تنوری/کبابی + فیله مرغ.\n• **بلافاصله بعد از تمرین:** مکمل وی یا سفیده تخم‌مرغ + ۲ عدد خرما برای ریکاوری سریع.\n• **شام:** ۱۵۰ گرم ماهی یا فیله مرغ + سبزیجات بخارپز (بروکلی و هویج).\n\n💧 **۳. مصرف آب:** حداقل ۳ تا ۴ لیتر آب در روز جهت ریکاوری و انتقال مواد مغذی.\n\nهر سوالی درباره جایگزینی مواد غذایی یا برنامه اختصاصی خودت داری، همینجا بپرس!',
      timestamp: '۱۰:۰۲'
    }
  ];

  const INITIAL_SESSIONS: ChatSession[] = [
    {
      id: 'session-nutrition-default',
      title: 'برنامه تغذیه و افزایش حجم خشک',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: '۱۰:۰۲',
      messages: DEFAULT_NUTRITION_MESSAGES
    }
  ];

  // Multi-Session Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-nutrition-default');
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Active Session computation
  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0] || INITIAL_SESSIONS[0];

  // Load persistent chat sessions on mount or when active user changes
  useEffect(() => {
    let isMounted = true;
    const currentUserId = activeUser?.id;

    async function loadSessions() {
      let savedSessions: ChatSession[] | null = null;
      if (currentUserId) {
        savedSessions = await loadUserChatSessionsPersistent(currentUserId);
      } else {
        savedSessions = await loadChatSessionsPersistent();
      }

      if (!isMounted) return;
      if (savedSessions && Array.isArray(savedSessions) && savedSessions.length > 0) {
        setChatSessions(savedSessions);
        setActiveSessionId(savedSessions[0].id);
      } else {
        const oldHistory = await loadChatHistoryPersistent<ChatMessage[]>();
        if (oldHistory && Array.isArray(oldHistory) && oldHistory.length > 0) {
          const migratedSession: ChatSession = {
            id: 'session-migrated-' + Date.now(),
            title: 'گفتگوی قبلی',
            createdAt: new Date().toLocaleDateString('fa-IR'),
            updatedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            messages: oldHistory
          };
          const updated = [migratedSession];
          setChatSessions(updated);
          setActiveSessionId(migratedSession.id);
          if (currentUserId) {
            saveUserChatSessionsPersistent(currentUserId, updated);
          } else {
            saveChatSessionsPersistent(updated);
          }
        } else {
          setChatSessions(INITIAL_SESSIONS);
          setActiveSessionId(INITIAL_SESSIONS[0].id);
          if (currentUserId) {
            saveUserChatSessionsPersistent(currentUserId, INITIAL_SESSIONS);
          } else {
            saveChatSessionsPersistent(INITIAL_SESSIONS);
          }
        }
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, [activeUser?.id]);

  // Auto-save chat sessions whenever updated
  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      if (activeUser?.id) {
        saveUserChatSessionsPersistent(activeUser.id, chatSessions);
      } else {
        saveChatSessionsPersistent(chatSessions);
      }
    }
  }, [chatSessions, activeUser?.id]);

  // Create New Session
  const handleCreateNewSession = () => {
    const newId = 'session-' + Date.now();
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const newSession: ChatSession = {
      id: newId,
      title: 'گفتگوی جدید',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: timeStr,
      messages: [DEFAULT_WELCOME_MSG]
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  // Delete Specific Session
  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (chatSessions.length <= 1) {
      handleClearAllHistory();
      return;
    }
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این گفتگو پاک شود؟')) {
      const remaining = chatSessions.filter((s) => s.id !== sessionId);
      setChatSessions(remaining);
      saveChatSessionsPersistent(remaining);
      if (activeSessionId === sessionId && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Clear All Chat History
  const handleClearAllHistory = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه گفتگوها پاک شوند؟')) {
      await clearChatHistoryPersistent();
      const newId = 'session-' + Date.now();
      const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      const newSession: ChatSession = {
        id: newId,
        title: 'گفتگوی جدید',
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: timeStr,
        messages: [DEFAULT_WELCOME_MSG]
      };
      setChatSessions([newSession]);
      setActiveSessionId(newId);
      await saveChatSessionsPersistent([newSession]);
    }
  };

  // Helper to strip heavy base64 data URLs from routines payload
  const sanitizeRoutinesForAI = (rawRoutines: RoutineDay[]) => {
    if (!Array.isArray(rawRoutines)) return [];
    return rawRoutines.map((day) => ({
      id: day.id,
      titleFa: day.titleFa,
      subtitleFa: day.subtitleFa,
      targetMusclesFa: day.targetMusclesFa,
      exercises: Array.isArray(day.exercises)
        ? day.exercises.map((ex) => ({
            id: ex.id,
            nameFa: ex.nameFa,
            nameEn: ex.nameEn,
            category: ex.category,
            targetMuscleFa: ex.targetMuscleFa,
            equipmentFa: ex.equipmentFa,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            defaultRestSeconds: ex.defaultRestSeconds,
            // Keep URL only if it's a short URL path, not a heavy base64 string
            gifUrl: ex.gifUrl && !ex.gifUrl.startsWith('data:') ? ex.gifUrl : undefined
          }))
        : []
    }));
  };

  const handleRunAudit = async () => {
    if (!routines || routines.length === 0) {
      alert('ابتدا برنامه‌ای وارد کنید تا آنالیز انجام شود.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const cleanRoutines = sanitizeRoutinesForAI(routines);
      const response = await fetch('/api/gemini/analyze-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          routines: cleanRoutines,
          userGoal,
          userExperience,
          customAiConfig: getCustomAiConfig()
        })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error('خطا در دریافت پاسخ از سرور. لطفاً مجدداً سعی کنید.');
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || 'خطا در آنالیز برنامه توسط هوش مصنوعی.');
      }

      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('پاسخ آنالیز دریافت نشد.');
      }
    } catch (err: any) {
      console.error('Audit Error:', err);
      setAnalysisError(err.message || 'ارتباط با سرور هوش مصنوعی برقرار نشد.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || isSendingMessage || !activeSession) return;

    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: timeStr
    };

    // Auto-generate session title if title is default
    const currentTitle = activeSession.title;
    const isDefaultTitle = currentTitle === 'گفتگوی جدید' || currentTitle === 'چت جدید';
    const autoTitle = isDefaultTitle
      ? (messageText.length > 28 ? messageText.slice(0, 28) + '...' : messageText)
      : currentTitle;

    const updatedMessages = [...activeSession.messages, userMsg];

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: autoTitle,
              updatedAt: timeStr,
              messages: updatedMessages
            }
          : s
      )
    );

    if (!textToSend) setInputMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetch('/api/gemini/coach-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          chatHistory: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          currentRoutines: sanitizeRoutinesForAI(routines),
          customAiConfig: getCustomAiConfig()
        })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error('خطا در دریافت پاسخ از مربی هوشمند.');
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || 'خطا در پاسخگویی مربی هوشمند.');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'پاسخی از مربی دریافت نشد.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                messages: [...s.messages, botMsg]
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Chat Error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${err.message || 'مشکلی در اتصال پیش آمده است. لطفا دوباره تلاش کنید.'}`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [...s.messages, errorMsg]
              }
            : s
        )
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  const quickPrompts = [
    '🏋️‍♂️ تحلیل حجم و تعداد ست‌های برنامه فعلی من',
    '💊 بهترین زمان‌بندی مصرف کراتین و پروتئین وی',
    '⚡ سیستم‌های دراپ‌ست و سوپرست رو چطور اجرا کنم؟',
    '🥗 محاسبه درشت‌مغذی‌ها برای حجم خشک',
    '🛡️ راهکار جلوگیری از آسیب سرشانه در پرس‌ها'
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-slate-900 to-black border border-neutral-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1FF00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D1FF00] text-black flex items-center justify-center font-black shadow-lg shadow-[#D1FF00]/20">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                مربی هوشمند و آنالیزور برنامه ورزشی
                <span className="px-2 py-0.5 rounded-full bg-[#D1FF00]/20 text-[#D1FF00] text-[10px] font-bold border border-[#D1FF00]/30">
                  علمی & بیومکانیک
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                بررسی حجم تمرینی، تعادل عضلانی، اصلاح حرکات و مشاوره تخصصی ورزشی با Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="mt-5 flex items-center p-1 bg-neutral-950/80 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'audit'
                ? 'bg-[#D1FF00] text-black shadow-lg'
                : 'text-neutral-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>بررسی تخصصی برنامه ورزشی</span>
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'chat'
                ? 'bg-[#D1FF00] text-black shadow-lg'
                : 'text-neutral-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>چت و مشاوره مربی ورزشی</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PROGRAM SCIENCE AUDIT */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          {/* Goal & Experience Input Config */}
          <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D1FF00]" />
              تنظیم هدف و سطح تمرینی شما
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                  هدف اصلی تمرینی:
                </label>
                <select
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-neutral-800 rounded-2xl p-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D1FF00]"
                >
                  <option value="عضله‌سازی و افزایش حجم خشک (Hypertrophy)">
                    عضله‌سازی و افزایش حجم خشک (Hypertrophy)
                  </option>
                  <option value="افزایش قدرت و رکورد زدن (Powerlifting / Strength)">
                    افزایش قدرت و رکورد زدن (Powerlifting)
                  </option>
                  <option value="چربی‌سوزی و تفکیک عضلانی (Cutting)">
                    چربی‌سوزی و تفکیک عضلانی (Cutting)
                  </option>
                  <option value="فیتنس و سلامت عمومی (General Fitness)">
                    فیتنس و سلامت عمومی (General Fitness)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                  سابقه و سطح ورزشی:
                </label>
                <select
                  value={userExperience}
                  onChange={(e) => setUserExperience(e.target.value)}
                  className="w-full bg-slate-950 border border-neutral-800 rounded-2xl p-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D1FF00]"
                >
                  <option value="مبتدی (زیر ۶ ماه)">مبتدی (زیر ۶ ماه)</option>
                  <option value="متوسط (۱ الی ۳ سال سابقه)">متوسط (۱ الی ۳ سال سابقه)</option>
                  <option value="پیشرفته (بیش از ۳ سال)">پیشرفته (بیش از ۳ سال)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isAnalyzing}
              className="w-full py-4 px-6 rounded-2xl bg-[#D1FF00] hover:bg-[#bce600] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-[#D1FF00]/15 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-5 h-5 animate-bounce text-black" />
                  <span>در حال آنالیز بیومکانیکی و علمی برنامه...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  <span>شروع آنالیز علمی و آسیب‌شناسی برنامه تمرینی</span>
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-neutral-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D1FF00]/15 border border-[#D1FF00]/30 text-[#D1FF00] text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    تأییدیه آنالیز علمی Gym AI
                  </div>
                  <h3 className="text-lg font-black text-slate-100">{analysis.headline}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
                    {analysis.overallAssessmentFa}
                  </p>
                </div>

                <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950 border border-neutral-800 min-w-[140px]">
                  <div className="text-4xl font-black text-[#D1FF00]">{analysis.score}</div>
                  <div className="text-[11px] font-bold text-neutral-400 mt-1">از ۱۰۰ امتیاز</div>
                </div>
              </div>

              {/* Muscle Volume Breakdown Grid */}
              <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#D1FF00]" />
                  تفکیک و آنالیز حجم تمرینی عضلات (ست‌های هفتگی)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {analysis.muscleVolumeBreakdown?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-neutral-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-200">{item.muscleNameFa}</span>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[#D1FF00] text-[10px]">
                          {item.weeklySets} ست/هفته
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-400">
                        وضعیت: <span className="text-slate-200">{item.statusFa}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        {item.recommendationFa}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Warnings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    نقاط قوت و مزایای برنامه شما
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengthsFa?.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warnings / Red Flags */}
                <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/30 space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    هشدارها و موارد نیازمند اصلاح
                  </h4>
                  <ul className="space-y-2">
                    {analysis.warningsFa?.map((warn, idx) => (
                      <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-xl">
                <h4 className="text-xs font-bold text-[#D1FF00] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#D1FF00]" />
                  توصیه‌ها و اصلاحات گام‌به‌گام مربی AI
                </h4>
                <div className="space-y-2">
                  {analysis.actionableTipsFa?.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-neutral-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#D1FF00]/15 text-[#D1FF00] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Optimized Routine Option */}
              {analysis.suggestedOptimizedRoutines && analysis.suggestedOptimizedRoutines.length > 0 && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 space-y-3 text-center shadow-2xl">
                  <h4 className="text-sm font-black text-emerald-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    نسخه اصلاح‌شده و کاملاً علمی هوش مصنوعی آماده است!
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-lg mx-auto leading-relaxed">
                    با کلیک روی دکمه زیر، اصلاحات بیومکانیکی و تعادل حجم عضلانی مستقیماً روی برنامه‌های فعلی شما اعمال می‌شوند.
                  </p>
                  <button
                    onClick={() => {
                      if (analysis.suggestedOptimizedRoutines) {
                        onApplyOptimizedRoutines(analysis.suggestedOptimizedRoutines);
                        alert('برنامه بهینه‌شده با موفقیت جایگزین شد! 🎯');
                      }
                    }}
                    className="py-3.5 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs inline-flex items-center gap-2 shadow-lg transition"
                  >
                    <span>اعمال برنامه اصلاح‌شده هوش مصنوعی (۱ کلیک)</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: AI FITNESS COACH CHAT WITH SESSIONS HISTORY */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          {/* Top Bar / Controls Header */}
          <div className="p-4 bg-slate-900 border border-neutral-800 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
                className={`p-2.5 rounded-2xl border transition flex items-center gap-2 text-xs font-bold ${
                  isHistorySidebarOpen
                    ? 'bg-[#D1FF00]/15 text-[#D1FF00] border-[#D1FF00]/30'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-slate-300 border-neutral-700'
                }`}
                title="نمایش/پنهان‌سازی تاریخچه گفتگوها"
              >
                <History className="w-4 h-4 text-[#D1FF00]" />
                <span>تاریخچه گفتگوها</span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-[10px] text-[#D1FF00] font-extrabold">
                  {chatSessions.length}
                </span>
              </button>

              <div className="h-5 w-[1px] bg-neutral-800 hidden sm:block" />

              <div className="flex items-center gap-2 overflow-hidden">
                <MessageCircle className="w-4 h-4 text-[#D1FF00] shrink-0" />
                <h3 className="text-xs font-bold text-slate-200 truncate max-w-[180px] sm:max-w-[300px]">
                  {activeSession?.title || 'گفتگوی فعال'}
                </h3>
              </div>
            </div>

            <button
              onClick={handleCreateNewSession}
              className="py-2.5 px-4 rounded-2xl bg-[#D1FF00] hover:bg-[#bce600] text-black font-black text-xs transition flex items-center gap-1.5 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>گفتگوی جدید</span>
            </button>
          </div>

          {/* Main Layout: History Sidebar + Active Chat Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* HISTORY SIDEBAR PANEL */}
            {isHistorySidebarOpen && (
              <div className="lg:col-span-4 space-y-3 bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#D1FF00]" />
                    تاریخچه گفتگوهای قبلی
                  </span>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[10px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20"
                    title="حذف کامل تاریخچه"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>پاکسازی کل</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {chatSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-2 group ${
                          isActive
                            ? 'bg-slate-950 border-[#D1FF00]/50 shadow-md ring-1 ring-[#D1FF00]/30'
                            : 'bg-slate-950/60 hover:bg-slate-950 border-neutral-800/80 text-neutral-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D1FF00]' : 'text-neutral-500'}`}
                            />
                            <h4
                              className={`text-xs font-bold truncate ${
                                isActive ? 'text-slate-100' : 'text-slate-300'
                              }`}
                            >
                              {session.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.updatedAt || session.createdAt}
                            </span>
                            <span>•</span>
                            <span>{session.messages.length} پیام</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-80 sm:opacity-0 group-hover:opacity-100 shrink-0"
                          title="حذف این گفتگو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHAT MESSAGES PANEL */}
            <div className={`${isHistorySidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
              {/* Preset Quick Actions */}
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 block">سوالات پیشنهادی سریع:</span>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isSendingMessage}
                      className="px-3 py-1.5 rounded-full bg-slate-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-slate-300 hover:text-[#D1FF00] transition disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Chat Messages Log */}
              <div className="p-4 sm:p-5 bg-slate-900 border border-neutral-800 rounded-3xl min-h-[360px] max-h-[480px] overflow-y-auto space-y-4 shadow-xl">
                {activeSession?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-[#D1FF00] text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-[#D1FF00] text-black font-semibold rounded-tl-none'
                          : 'bg-slate-950 border border-neutral-800 text-slate-200 rounded-tr-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`text-[9px] text-left opacity-60 mt-1 ${
                          msg.role === 'user' ? 'text-black' : 'text-neutral-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {isSendingMessage && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-[#D1FF00] text-black flex items-center justify-center font-bold text-xs shrink-0">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#D1FF00]" />
                      <span>مربی AI در حال آنالیز و پاسخگویی...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-2xl border border-neutral-800 shadow-lg">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="سوال ورزشی، برنامه‌ای یا تغذیه‌ای خود را بپرسید..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-neutral-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isSendingMessage}
                  className="p-3 rounded-xl bg-[#D1FF00] hover:bg-[#bce600] text-black font-bold transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
