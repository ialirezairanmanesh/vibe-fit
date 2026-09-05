export type ExerciseCategory = 
  | 'chest' 
  | 'biceps' 
  | 'triceps' 
  | 'legs' 
  | 'shoulders' 
  | 'back' 
  | 'abs';

export type AnimationType = 
  | 'dumbbell_press'
  | 'incline_press'
  | 'fly'
  | 'pullover'
  | 'bicep_curl'
  | 'hammer_curl'
  | 'preacher_curl'
  | 'crunch'
  | 'leg_extension'
  | 'squat'
  | 'leg_curl'
  | 'calf_raise'
  | 'triceps_pushdown'
  | 'skullcrusher'
  | 'triceps_vbar'
  | 'front_raise'
  | 'shoulder_press'
  | 'rear_fly'
  | 'shoulder_front'
  | 'lat_pulldown'
  | 'dumbbell_row'
  | 'reverse_pulldown'
  | 'hyperextension'
  | 'generic';

export interface Exercise {
  id: string;
  nameFa: string;
  nameEn: string;
  category: ExerciseCategory;
  targetMuscleFa: string;
  equipmentFa: string;
  targetSets: number;
  targetReps: string; // e.g., "10" or "12-10-8" or "12*3"
  defaultRestSeconds: number;
  instructionsFa: string[];
  tipsFa: string[];
  animationType: AnimationType;
  gifUrl?: string;
  isBodyweight?: boolean;
}

export interface SetLog {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  actualReps: number;
  actualWeight: number;
  isCompleted: boolean;
  type: 'normal' | 'warmup' | 'drop' | 'failure';
  isBodyweight?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseNameFa: string;
  category: ExerciseCategory;
  sets: SetLog[];
  notes?: string;
  isBodyweight?: boolean;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineTitleFa: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  durationSeconds: number;
  exercises: ExerciseLog[];
  isCompleted: boolean;
  totalVolumeKg: number;
}

export interface ActiveWorkoutState {
  routine: RoutineDay;
  startTime: string;
  elapsedSeconds: number;
  exerciseLogs: ExerciseLog[];
  activeExerciseIndex: number;
}

export interface RoutineDay {
  id: string;
  titleFa: string;
  subtitleFa: string;
  targetMusclesFa: string[];
  iconName: string;
  exercises: Exercise[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
  gender?: 'male' | 'female';
  goal?: string; // e.g. 'عضله‌سازی و هایپرتروفی', 'کاهش وزن و چربی‌سوزی', 'افزایش قدرت', 'تناسب اندام عمومی'
  experienceLevel?: 'مبتدی' | 'متوسط' | 'پیشرفته';
  weightKg?: number;
  heightCm?: number;
  createdAt: string;
}

export type ActiveTab = 'routines' | 'progress' | 'exercises' | 'history' | 'ai_coach' | 'settings';
