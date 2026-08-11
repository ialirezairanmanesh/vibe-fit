import React, { useState, useMemo } from 'react';
import { WorkoutSession, RoutineDay, Exercise } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { TrendingUp, Trophy, Dumbbell, Calendar, Activity, BarChart2, Filter } from 'lucide-react';

interface ProgressAnalyticsProps {
  routines: RoutineDay[];
  pastSessions: WorkoutSession[];
}

type TimeRange = '1w' | '1m' | '3m' | '6m' | 'all';

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  routines,
  pastSessions
}) => {
  // Extract list of all exercises
  const allExercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    routines.forEach((r) => {
      r.exercises.forEach((ex) => map.set(ex.id, ex));
    });
    return Array.from(map.values());
  }, [routines]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    allExercises[0]?.id || ''
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [metricType, setMetricType] = useState<'maxWeight' | 'oneRepMax' | 'volume'>('maxWeight');

  const selectedExercise = useMemo(
    () => allExercises.find((e) => e.id === selectedExerciseId),
    [allExercises, selectedExerciseId]
  );

  // Filter and process chart data
  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    const now = new Date().getTime();
    const cutoffDays = {
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      'all': 9999
    }[timeRange];

    const cutoffTime = now - cutoffDays * 24 * 60 * 60 * 1000;

    const dataPoints: {
      dateStr: string;
      rawDate: string;
      maxWeight: number;
      oneRepMax: number;
      volume: number;
      totalReps: number;
    }[] = [];

    // Sort past sessions chronologically
    const sorted = [...pastSessions]
      .filter((s) => s.isCompleted && new Date(s.startTime).getTime() >= cutoffTime)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    sorted.forEach((session) => {
      const exLog = session.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (!exLog) return;

      let maxW = 0;
      let max1RM = 0;
      let vol = 0;
      let totalR = 0;

      exLog.sets.forEach((s) => {
        if (s.isCompleted && s.actualWeight > 0) {
          if (s.actualWeight > maxW) maxW = s.actualWeight;
          // Epley formula for 1RM: W * (1 + R / 30)
          const est1RM = Math.round(s.actualWeight * (1 + s.actualReps / 30));
          if (est1RM > max1RM) max1RM = est1RM;

          vol += s.actualWeight * s.actualReps;
          totalR += s.actualReps;
        }
      });

      if (maxW > 0) {
        const dateObj = new Date(session.startTime);
        const dateStr = new Intl.DateTimeFormat('fa-IR', {
          month: 'short',
          day: 'numeric'
        }).format(dateObj);

        dataPoints.push({
          dateStr,
          rawDate: session.startTime,
          maxWeight: maxW,
          oneRepMax: max1RM,
          volume: vol,
          totalReps: totalR
        });
      }
    });

    return dataPoints;
  }, [pastSessions, selectedExerciseId, timeRange]);

  // Overall PR
  const overallPR = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.maxWeight > max) max = d.maxWeight;
    });
    return max;
  }, [chartData]);

  // Max 1RM
  const overall1RM = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.oneRepMax > max) max = d.oneRepMax;
    });
    return max;
  }, [chartData]);

  return (
    <div className="space-y-6 pb-28">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            نمودار پیشرفت و رکوردها
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ارزیابی میزان افزایش وزنه، تخمین ۱ تکرار بیشینه و حجم کل تمرین
          </p>
        </div>
      </div>

      {/* Exercise Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4 text-emerald-400" />
          انتخاب حرکت ورزشی:
        </label>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 shadow-lg"
        >
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.nameFa} ({ex.targetMuscleFa})
            </option>
          ))}
        </select>
      </div>

      {/* Metric Selector & Time Range Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Metric Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setMetricType('maxWeight')}
            className={`py-2 px-3 rounded-xl transition ${
              metricType === 'maxWeight'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            بیشترین وزنه
          </button>

          <button
            onClick={() => setMetricType('oneRepMax')}
            className={`py-2 px-3 rounded-xl transition ${
              metricType === 'oneRepMax'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تخمین 1RM
          </button>

          <button
            onClick={() => setMetricType('volume')}
            className={`py-2 px-3 rounded-xl transition ${
              metricType === 'volume'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            حجم کل (کیلو)
          </button>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
          {(['1w', '1m', '3m', '6m', 'all'] as TimeRange[]).map((r) => {
            const labels: Record<TimeRange, string> = {
              '1w': '۱ هفته',
              '1m': '۱ ماه',
              '3m': '۳ ماه',
              '6m': '۶ ماه',
              'all': 'همه'
            };
            return (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  timeRange === r
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">رکورد بیشترین وزنه (PR)</p>
            <p className="text-lg font-bold text-amber-300 font-mono">
              {overallPR > 0 ? `${overallPR} کیلوگرم` : 'ثبت نشده'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">تخمین ۱ تکرار بیشینه (1RM)</p>
            <p className="text-lg font-bold text-emerald-400 font-mono">
              {overall1RM > 0 ? `${overall1RM} کیلوگرم` : 'ثبت نشده'}
            </p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">تعداد جلسات ثبت‌شده</p>
            <p className="text-lg font-bold text-sky-300 font-mono">
              {chartData.length} جلسه
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            روند تغییرات {selectedExercise?.nameFa}
          </h3>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            {metricType === 'maxWeight' && 'بیشترین وزنه جابجا شده (کیلوگرم)'}
            {metricType === 'oneRepMax' && 'تخمین قدرتی 1RM (کیلوگرم)'}
            {metricType === 'volume' && 'حجم کل (وزنه × تکرار)'}
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Dumbbell className="w-12 h-12 text-slate-700 mx-auto animate-bounce" />
            <p className="text-sm text-slate-400 font-medium">
              هنوز برای این حرکت تمرینی در این بازه زمانی ورودی ثبت نشده است.
            </p>
            <p className="text-xs text-slate-500">
              با شروع تمرین و انجام ست‌ها، نمودار تغییرات رکورد شما در اینجا نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          <div className="w-full h-72 dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dateStr"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: number) => [`${value} کیلوگرم`, 'مقدار']}
                  labelFormatter={(label) => `تاریخ: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey={metricType}
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#emeraldGrad)"
                  dot={{ r: 5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#34d399' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
