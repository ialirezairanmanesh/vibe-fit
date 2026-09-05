export interface MuscleWikiExercise {
  id: string;
  nameEn: string;
  nameFa: string;
  category: 'chest' | 'biceps' | 'triceps' | 'legs' | 'shoulders' | 'back' | 'abs' | string;
  targetMuscleEn?: string;
  targetMuscleFa?: string;
  secondaryMusclesFa?: string[];
  equipmentEn?: string;
  equipmentFa?: string;
  difficultyFa?: 'مبتدی' | 'متوسط' | 'پیشرفته' | string;
  gifUrl: string;
  sideGifUrl?: string;
  femaleGifUrl?: string;
  instructionsFa?: string[];
  instructionsEn?: string[];
  tipsFa?: string[];
  defaultSets?: number;
  defaultReps?: string;
  defaultRestSeconds?: number;
  source?: 'Free Exercise DB' | 'MuscleWiki API' | string;
}

export const MUSCLEWIKI_CATEGORIES = [
  { id: 'all', labelFa: 'همه عضلات', labelEn: 'All Muscles' },
  { id: 'chest', labelFa: 'سینه (Chest)', labelEn: 'Chest' },
  { id: 'biceps', labelFa: 'جلو بازو (Biceps)', labelEn: 'Biceps' },
  { id: 'triceps', labelFa: 'پشت بازو (Triceps)', labelEn: 'Triceps' },
  { id: 'shoulders', labelFa: 'سرشانه (Shoulders)', labelEn: 'Shoulders' },
  { id: 'back', labelFa: 'پشت و زیربغل (Back/Lats)', labelEn: 'Back' },
  { id: 'legs', labelFa: 'پا و باسن (Legs/Glutes)', labelEn: 'Legs' },
  { id: 'abs', labelFa: 'شکم و فیله (Core/Abs)', labelEn: 'Abs' }
];

export const MUSCLEWIKI_EQUIPMENT = [
  { id: 'all', labelFa: 'همه تجهیزات' },
  { id: 'barbell', labelFa: 'هالتر (Barbell)' },
  { id: 'dumbbell', labelFa: 'دمبل (Dumbbell)' },
  { id: 'cable', labelFa: 'سیم‌کش (Cable)' },
  { id: 'machine', labelFa: 'دستگاه (Machine)' },
  { id: 'bodyweight', labelFa: 'وزن بدن (Bodyweight)' },
  { id: 'kettlebell', labelFa: 'کتل‌بل (Kettlebell)' }
];
