import { RoutineDay, Exercise, ExerciseCategory, AnimationType } from '../types';

export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\u200c\u200b\u200d\u200e\u200f]/g, ' ')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim();
}

// Map exercise keywords to animation types, categories, and dataset GIF filenames
export function inferExerciseMetadata(nameFa: string): {
  category: ExerciseCategory;
  animationType: AnimationType;
  nameEn: string;
  targetMuscleFa: string;
  equipmentFa: string;
} {
  const norm = normalizePersianText(nameFa);

  // Chest / سینه
  if (norm.includes('بالاسینه') || norm.includes('بالا سینه') || norm.includes('اینکلین') || norm.includes('انکلین') || norm.includes('شیب دار')) {
    if (norm.includes('دستگاه') || norm.includes('ماشین') || norm.includes('پرس دستگاه')) {
      return {
        category: 'chest',
        animationType: 'incline_press',
        nameEn: 'Incline_Chest_Press',
        targetMuscleFa: 'عضلات بالا سینه (پکتورالیس ماژور بالا)',
        equipmentFa: 'دستگاه پرس بالا سینه'
      };
    }
    if (norm.includes('فلای') || norm.includes('قفسه')) {
      return {
        category: 'chest',
        animationType: 'fly',
        nameEn: 'Incline_Dumbbell_Fly',
        targetMuscleFa: 'بخش بالایی سینه و کشش عضلانی',
        equipmentFa: 'دمبل و نیمکت شیب‌دار'
      };
    }
    return {
      category: 'chest',
      animationType: 'incline_press',
      nameEn: 'Incline_Dumbbell_Press',
      targetMuscleFa: 'عضلات بالا سینه (پکتورالیس ماژور بالا)',
      equipmentFa: 'دمبل و نیمکت شیب‌دار'
    };
  }

  if (norm.includes('قفسه') || norm.includes('فلای') || norm.includes('پروانه') || norm.includes('پک دک')) {
    return {
      category: 'chest',
      animationType: 'fly',
      nameEn: 'Chest_Fly',
      targetMuscleFa: 'عضلات سینه و کشش قفسه سینه',
      equipmentFa: 'دمبل یا دستگاه پروانه / فلای'
    };
  }

  if (norm.includes('پلاور') || norm.includes('پول اور') || norm.includes('پلوور')) {
    return {
      category: 'chest',
      animationType: 'pullover',
      nameEn: 'Dumbbell_Pullover',
      targetMuscleFa: 'عضلات سینه، زیر بغل و دنده‌ها',
      equipmentFa: 'دمبل یا صفحه وزنه'
    };
  }

  if (norm.includes('سینه') || norm.includes('پرس سینه')) {
    if (norm.includes('دستگاه') || norm.includes('ماشین')) {
      return {
        category: 'chest',
        animationType: 'fly',
        nameEn: 'Chest_Fly',
        targetMuscleFa: 'عضلات سینه (بخش میانی)',
        equipmentFa: 'دستگاه پرس / پروانه سینه'
      };
    }
    return {
      category: 'chest',
      animationType: 'dumbbell_press',
      nameEn: 'Dumbbell_Bench_Press',
      targetMuscleFa: 'عضلات سینه (بخش میانی و داخلی)',
      equipmentFa: 'دمبل / هالتر و نیمکت تخت'
    };
  }

  // Biceps / جلو بازو
  if (norm.includes('چکشی') || norm.includes('همر')) {
    return {
      category: 'biceps',
      animationType: 'hammer_curl',
      nameEn: 'Dumbbell_Hammer_Curl',
      targetMuscleFa: 'عضله دو سر بازویی و براکیورادیالیس',
      equipmentFa: 'دمبل'
    };
  }
  if (norm.includes('لاری') || norm.includes('پریچر')) {
    return {
      category: 'biceps',
      animationType: 'preacher_curl',
      nameEn: 'EZ_Bar_Preacher_Curl',
      targetMuscleFa: 'بخش پایینی عضله جلو بازو',
      equipmentFa: 'میز لاری و هالتر EZ'
    };
  }
  if (norm.includes('جلو بازو') || norm.includes('جلوبازو') || norm.includes('بازو')) {
    return {
      category: 'biceps',
      animationType: 'bicep_curl',
      nameEn: 'Cable_Bicep_Curl',
      targetMuscleFa: 'عضله دو سر بازویی (بایسپس)',
      equipmentFa: 'دستگاه سیمکش / دمبل'
    };
  }

  // Triceps / پشت بازو
  if (norm.includes('جمجمه') || norm.includes('اسکال') || norm.includes('پشت بازو خوابیده') || norm.includes('هالتر خوابیده') || norm.includes('فرانسوی')) {
    return {
      category: 'triceps',
      animationType: 'skullcrusher',
      nameEn: 'Lying_Triceps_Extension',
      targetMuscleFa: 'عضله پشت بازو (سر دراز و میانی)',
      equipmentFa: 'هالتر EZ و نیمکت'
    };
  }
  if (norm.includes('v') || norm.includes('وی') || norm.includes('طناب')) {
    return {
      category: 'triceps',
      animationType: 'triceps_vbar',
      nameEn: 'V_Bar_Triceps_Pushdown',
      targetMuscleFa: 'عضله پشت بازو (بخش خارجی)',
      equipmentFa: 'دستگاه سیمکش و دسته V'
    };
  }
  if (norm.includes('پشت بازو') || norm.includes('پشتبازو') || norm.includes('پوش داون')) {
    return {
      category: 'triceps',
      animationType: 'triceps_pushdown',
      nameEn: 'Triceps_Pushdown',
      targetMuscleFa: 'عضله سه سر بازویی (پشت بازو)',
      equipmentFa: 'دستگاه سیمکش'
    };
  }

  // Legs / پا
  if (norm.includes('جلو پا') || norm.includes('جلوپا')) {
    return {
      category: 'legs',
      animationType: 'leg_extension',
      nameEn: 'Leg_Extension',
      targetMuscleFa: 'عضلات چهارسر ران (کوادریسپس)',
      equipmentFa: 'دستگاه جلو پا'
    };
  }
  if (norm.includes('پشت پا') || norm.includes('پشتپا') || norm.includes('همسترینگ')) {
    return {
      category: 'legs',
      animationType: 'leg_curl',
      nameEn: 'Lying_Leg_Curl',
      targetMuscleFa: 'عضلات پشت ران (همسترینگ)',
      equipmentFa: 'دستگاه پشت پا خوابیده'
    };
  }
  if (norm.includes('ساق') || norm.includes('ساق پا')) {
    return {
      category: 'legs',
      animationType: 'calf_raise',
      nameEn: 'Seated_Calf_Raise',
      targetMuscleFa: 'عضلات ساق پا',
      equipmentFa: 'دستگاه ساق پا نشسته'
    };
  }
  if (norm.includes('اسکات') || norm.includes('اسکوات') || norm.includes('لانج') || norm.includes('پرس پا')) {
    return {
      category: 'legs',
      animationType: 'squat',
      nameEn: 'Barbell_Squat',
      targetMuscleFa: 'عضلات چهارسر ران و سرینی',
      equipmentFa: 'هالتر / رک اسکات'
    };
  }

  // Shoulders / سرشانه
  if (norm.includes('سرشانه دستگاه') || norm.includes('دستگاه سرشانه') || norm.includes('پرس سرشانه دستگاه')) {
    return {
      category: 'shoulders',
      animationType: 'shoulder_press',
      nameEn: 'Machine_Shoulder_Press',
      targetMuscleFa: 'عضلات سرشانه (دلتوئید قدامی و میانی)',
      equipmentFa: 'دستگاه پرس سرشانه'
    };
  }
  if (norm.includes('نشر خم') || norm.includes('دلتا پشت') || norm.includes('پشت سرشانه')) {
    return {
      category: 'shoulders',
      animationType: 'rear_fly',
      nameEn: 'Bent_Over_Rear_Delt_Fly',
      targetMuscleFa: 'بخش پشتی سرشانه (دلتوئید خلفی)',
      equipmentFa: 'دمبل'
    };
  }
  if (norm.includes('نشر جلو') || norm.includes('نشر از جلو')) {
    return {
      category: 'shoulders',
      animationType: 'front_raise',
      nameEn: 'Cable_Front_Raise',
      targetMuscleFa: 'بخش جلویی سرشانه (دلتوئید قدامی)',
      equipmentFa: 'دستگاه سیمکش پایین'
    };
  }
  if (norm.includes('سرشانه') || norm.includes('شانه') || norm.includes('اورهد')) {
    return {
      category: 'shoulders',
      animationType: 'shoulder_press',
      nameEn: 'Dumbbell_Shoulder_Press',
      targetMuscleFa: 'عضلات سرشانه (دلتوئید قدامی و میانی)',
      equipmentFa: 'دمبل'
    };
  }

  // Back / Lats / زیر بغل
  if (norm.includes('مچ معکوس') || norm.includes('دست معکوس')) {
    return {
      category: 'back',
      animationType: 'reverse_pulldown',
      nameEn: 'Reverse_Grip_Lat_Pulldown',
      targetMuscleFa: 'بخش پایینی زیر بغل',
      equipmentFa: 'دستگاه لت سیمکش'
    };
  }
  if (norm.includes('دمبل خم') || norm.includes('قایقی') || norm.includes('روئینگ')) {
    return {
      category: 'back',
      animationType: 'dumbbell_row',
      nameEn: 'Bent_Over_Dumbbell_Row',
      targetMuscleFa: 'بخش میانی پشت و زیر بغل',
      equipmentFa: 'دمبل و نیمکت'
    };
  }
  if (norm.includes('زیر بغل') || norm.includes('زیربغل') || norm.includes('لتبک') || norm.includes('لات') || norm.includes('بارفیکس')) {
    return {
      category: 'back',
      animationType: 'lat_pulldown',
      nameEn: 'Lat_Pulldown',
      targetMuscleFa: 'عضله پهن پشتی (لاتیسموس دورسی)',
      equipmentFa: 'دستگاه لت سیمکش'
    };
  }
  if (norm.includes('فیله') || norm.includes('کمر') || norm.includes('هایپراکستنشن')) {
    return {
      category: 'back',
      animationType: 'hyperextension',
      nameEn: 'Back_Extension',
      targetMuscleFa: 'عضلات فیله کمر',
      equipmentFa: 'میز فیله کمر 45 درجه'
    };
  }

  // Abs / شکم
  if (norm.includes('شکم') || norm.includes('کرانچ') || norm.includes('پلانک') || norm.includes('دراز نشست') || norm.includes('درازونشست')) {
    return {
      category: 'abs',
      animationType: 'crunch',
      nameEn: 'Crunch',
      targetMuscleFa: 'عضلات مستقیم و مورب شکمی',
      equipmentFa: 'تشک ورزشی / نیمکت'
    };
  }

  // Generic default: Incline Chest Press if unrecognized
  return {
    category: 'chest',
    animationType: 'dumbbell_press',
    nameEn: 'Dumbbell_Bench_Press',
    targetMuscleFa: 'عضلات هدف تمرین',
    equipmentFa: 'وزنه یا دستگاه تخصصی'
  };
}

// Convert Persian numbers to English digits for parser
function toEnglishDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str
    .replace(/[۰-۹]/g, (w) => `${persianDigits.indexOf(w)}`)
    .replace(/[0-9]/g, (w) => `${arabicDigits.indexOf(w)}`);
}

// Extract sets and reps pattern from text
function parseSetsAndReps(text: string): { sets: number; reps: string } {
  const cleaned = toEnglishDigits(text);

  // Pattern 1: e.g. "4 ست 12 تایی" or "4 ست 12 تکرار" or "4 ست x 12" or "4*12" or "4x12"
  const matchMult = cleaned.match(/(\d+)\s*(?:ست|set|sets|x|\*|\×)\s*(?:تایی|تکرار|تایی‌|x|\*|\×)?\s*(\d+[-–]\d+[-–]?\d*|\d+)/i);
  if (matchMult) {
    const sets = parseInt(matchMult[1], 10) || 3;
    const reps = matchMult[2] || '10';
    return { sets, reps };
  }

  // Pattern 2: e.g. "12-10-8-6" or "12*4"
  const matchPyramid = cleaned.match(/(\d+[-–]\d+(?:[-–]\d+)*)/);
  if (matchPyramid) {
    const parts = matchPyramid[1].split(/[-–]/);
    return { sets: parts.length, reps: matchPyramid[1] };
  }

  // Pattern 3: e.g. "3 ست"
  const matchSetsOnly = cleaned.match(/(\d+)\s*(?:ست|set|sets)/i);
  if (matchSetsOnly) {
    const sets = parseInt(matchSetsOnly[1], 10) || 3;
    return { sets, reps: '10-12' };
  }

  // Default fallback
  return { sets: 3, reps: '10-12' };
}

export function parseWorkoutText(rawText: string): RoutineDay[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const routines: RoutineDay[] = [];

  let currentRoutine: RoutineDay | null = null;
  let dayIndex = 1;

  // Regex to detect day headers
  const dayHeaderRegex = /^(?:روز|جلسه|برنامه|day|session)\s*([۰-۹0-9a-zA-Zآ-ی\s]+)|^(?:شنبه|یکشنبه|دوشنبه|سه\s*شنبه|چهارشنبه|پنج\s*شنبه|جمعه)|^[#\*]{1,3}\s*(.*)/i;

  for (const line of lines) {
    // Check if line is a Day Header
    const isHeaderLine = dayHeaderRegex.test(line) || line.includes(':') && (line.includes('روز') || line.includes('جلسه') || line.includes('Day'));

    if (isHeaderLine) {
      // Save previous routine if exists and has exercises
      if (currentRoutine && currentRoutine.exercises.length > 0) {
        routines.push(currentRoutine);
      }

      const titleClean = line.replace(/^[#\*\-–:]+\s*/, '').trim();
      const id = `custom-day-${Date.now()}-${dayIndex}`;

      // Extract muscles or subtitle if contained in header
      const targetMusclesFa: string[] = [];
      if (titleClean.includes('سینه')) targetMusclesFa.push('سینه');
      if (titleClean.includes('بازو')) targetMusclesFa.push('جلو/پشت بازو');
      if (titleClean.includes('پا')) targetMusclesFa.push('عضلات پا');
      if (titleClean.includes('سرشانه') || titleClean.includes('شانه')) targetMusclesFa.push('سرشانه');
      if (titleClean.includes('زیر بغل') || titleClean.includes('پشت')) targetMusclesFa.push('زیر بغل و پشت');
      if (titleClean.includes('شکم')) targetMusclesFa.push('شکم');

      if (targetMusclesFa.length === 0) targetMusclesFa.push('عضلات هدف');

      currentRoutine = {
        id,
        titleFa: titleClean || `روز ${dayIndex}`,
        subtitleFa: `برنامه تفکیکی ${titleClean}`,
        targetMusclesFa,
        iconName: dayIndex % 3 === 1 ? 'Dumbbell' : dayIndex % 3 === 2 ? 'Activity' : 'Zap',
        exercises: []
      };

      dayIndex++;
      continue;
    }

    // If we reach here, treat line as an exercise line
    // Strip leading numbers or bullets like "1- ", "• ", "* ", "۱) "
    const cleanedExLine = line.replace(/^(?:[\d۰-۹]+[\.\)\-–]|[\*•\-–]+)\s*/, '').trim();
    if (cleanedExLine.length < 2) continue;

    // Create current routine if none existed yet
    if (!currentRoutine) {
      currentRoutine = {
        id: `custom-day-${Date.now()}-${dayIndex}`,
        titleFa: 'روز اول: برنامه جدید',
        subtitleFa: 'برنامه اختصاصی وارد شده',
        targetMusclesFa: ['عضلات بدن'],
        iconName: 'Dumbbell',
        exercises: []
      };
      dayIndex++;
    }

    // Extract sets & reps
    const { sets, reps } = parseSetsAndReps(cleanedExLine);

    // Clean exercise name by removing set/rep numbers from the name text
    let nameFa = cleanedExLine
      .replace(/(\d+|[۰-۹]+)\s*(?:ست|set|sets)?\s*(?:x|\*|ضرب در|تایی|تکرار|تا)?\s*(\d+|[۰-۹]+)?/gi, '')
      .replace(/[-–:]/g, ' ')
      .trim();

    if (!nameFa) nameFa = cleanedExLine;

    // Get metadata from exercise name
    const meta = inferExerciseMetadata(nameFa);
    const exerciseId = `ex-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newExercise: Exercise = {
      id: exerciseId,
      nameFa,
      nameEn: meta.nameEn,
      category: meta.category,
      targetMuscleFa: meta.targetMuscleFa,
      equipmentFa: meta.equipmentFa,
      targetSets: sets,
      targetReps: reps,
      defaultRestSeconds: 90,
      instructionsFa: [
        `حرکت ${nameFa} را با کنترل و با دامنه حرکتی کامل انجام دهید.`,
        `در بخش انقباض ۱ ثانیه مکث کنید و با دم به نقطه اولیه بازگردید.`
      ],
      tipsFa: ['حفظ فرم صحیح حرکتی', 'تنفس منظم هنگام فشار'],
      animationType: meta.animationType
    };

    currentRoutine.exercises.push(newExercise);
  }

  // Push final routine if valid
  if (currentRoutine && currentRoutine.exercises.length > 0) {
    routines.push(currentRoutine);
  }

  return routines;
}

export function isExerciseBodyweightByKeywords(nameFa: string, equipmentFa?: string): boolean {
  const norm = normalizePersianText((nameFa || '') + ' ' + (equipmentFa || ''));
  return (
    norm.includes('بارفیکس') ||
    norm.includes('دراز نشست') ||
    norm.includes('درازونشست') ||
    norm.includes('کرانچ') ||
    norm.includes('شنا سویدی') ||
    norm.includes('شنا سوئدی') ||
    norm.includes('پلانک') ||
    norm.includes('دیپ') ||
    norm.includes('فیله کمر') ||
    norm.includes('وزن بدن') ||
    norm.includes('بدون وزنه')
  );
}

// Re-map and auto-correct routine exercise GIF names for cached/persisted routines
export function autoFixRoutinesMetadata(routines: RoutineDay[]): RoutineDay[] {
  if (!Array.isArray(routines)) return [];

  return routines.map((routine) => ({
    ...routine,
    exercises: (routine.exercises || []).map((ex) => {
      const meta = inferExerciseMetadata(ex.nameFa || '');
      // If nameEn is missing or equal to Persian nameFa or outdated, fix it!
      const shouldFix = !ex.nameEn || ex.nameEn === ex.nameFa || !/^[a-zA-Z0-9_]+$/.test(ex.nameEn);
      const isBodyweight = ex.isBodyweight !== undefined ? ex.isBodyweight : isExerciseBodyweightByKeywords(ex.nameFa, ex.equipmentFa);

      return {
        ...ex,
        nameEn: shouldFix ? meta.nameEn : ex.nameEn,
        category: ex.category || meta.category,
        animationType: ex.animationType || meta.animationType,
        targetMuscleFa: ex.targetMuscleFa || meta.targetMuscleFa,
        equipmentFa: ex.equipmentFa || meta.equipmentFa,
        isBodyweight
      };
    })
  }));
}

export const SAMPLE_WORKOUT_TEXT = `روز اول: سینه + جلو بازو
- پرس سینه دمبل: ۴ ست ۱۲ تایی
- پرس بالا سینه دمبل: ۳ ست ۱۰ تایی
- قفسه سینه دمبل: ۳ ست ۱۲ تایی
- پلاور سینه با وزنه: ۳ ست ۱۰ تایی
- جلو بازو سیم کش: ۴ ست ۱۲ تایی
- جلو بازو چکشی: ۳ ست ۱۰ تایی
- کرانچ شکم: ۳ ست ۱۵ تایی

روز دوم: پا + پشت بازو
- اسکات هالتر: ۴ ست ۱۰ تایی
- جلو پا ماشین: ۴ ست ۱۲ تایی
- پشت پا خوابیده: ۴ ست ۱۰ تایی
- ساق پا نشسته: ۴ ست ۱۵ تایی
- پشت بازو سیم کش v: ۴ ست ۱۲ تایی
- پشت بازو هالتر خوابیده: ۳ ست ۱۰ تایی

روز سوم: سرشانه + زیر بغل
- پرس سرشانه دمبل: ۴ ست ۱۰ تایی
- نشر جانب دمبل: ۳ ست ۱۲ تایی
- نشر خم دمبل: ۳ ست ۱۲ تایی
- زیر بغل سیمکش لتبک: ۴ ست ۱۰ تایی
- زیر بغل دمبل خم: ۴ ست ۱۰ تایی
- فیله کمر: ۳ ست ۱۵ تایی`;
