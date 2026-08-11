export interface MuscleWikiExercise {
  id: string;
  nameEn: string;
  nameFa: string;
  category: 'chest' | 'biceps' | 'triceps' | 'legs' | 'shoulders' | 'back' | 'abs';
  targetMuscleEn: string;
  targetMuscleFa: string;
  secondaryMusclesFa: string[];
  equipmentEn: string;
  equipmentFa: string;
  difficultyFa: 'مبتدی' | 'متوسط' | 'پیشرفته';
  gifUrl: string;
  femaleGifUrl?: string;
  instructionsFa: string[];
  instructionsEn: string[];
  tipsFa: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  source: 'MuscleWiki API';
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

export const MUSCLEWIKI_EXERCISES_DATABASE: MuscleWikiExercise[] = [
  // CHEST
  {
    id: 'mw-chest-barbell-bench-press',
    nameEn: 'Barbell Bench Press',
    nameFa: 'پرس سینه با هالتر روی میز صاف',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major',
    targetMuscleFa: 'سینه (پکتورالیس بزرگ)',
    secondaryMusclesFa: ['سرشانه جلویی', 'پشت بازو'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Dumbbell_Bench_Press.gif',
    femaleGifUrl: '/exercises/Dumbbell_Bench_Press.gif',
    instructionsFa: [
      'روی میز صاف دراز بکشید و پاها را محکم روی زمین قرار دهید.',
      'هالتر را با عرض کمی بیشتر از عرض شانه‌ها بگیرید.',
      'هالتر را با کنترل تا بالای خط سینه پایین آورید.',
      'با انقباض عضلات سینه، هالتر را به نقطه شروع بازگردانید.'
    ],
    instructionsEn: [
      'Lie flat on a bench with your feet flat on the floor.',
      'Grip the barbell slightly wider than shoulder-width apart.',
      'Lower the bar slowly until it touches your mid-chest.',
      'Press the bar back up explosively to the starting position.'
    ],
    tipsFa: ['کتف‌ها را به سمت عقب و پایین جمع نگه دارید.', 'از برداشته شدن باسن از روی میز خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-chest-incline-dumbbell-press',
    nameEn: 'Incline Dumbbell Press',
    nameFa: 'پرس سینه بالا سینه با دمبل',
    category: 'chest',
    targetMuscleEn: 'Upper Chest',
    targetMuscleFa: 'قسمت بالای سینه (بالاسینه)',
    secondaryMusclesFa: ['دلتوئید جلویی', 'پشت بازو'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Incline_Dumbbell_Press.gif',
    femaleGifUrl: '/exercises/Incline_Dumbbell_Press.gif',
    instructionsFa: [
      'میز را روی زاویه ۳۰ تا ۴۵ درجه قرار دهید.',
      'دمبل‌ها را در سطح بالاسینه نگه دارید و آرنج‌ها زاویه ۴۵ درجه داشته باشند.',
      'دمبل‌ها را مستقیماً به سمت بالا پرس کنید تا بالای بالاسینه متمرکز شوند.',
      'با آرامی و کنترل به حالت اولیه بازگردید.'
    ],
    instructionsEn: [
      'Set bench angle to 30-45 degrees.',
      'Hold dumbbells at upper chest level with elbows at 45 degree angle.',
      'Press the dumbbells straight up contracting your upper chest.',
      'Lower under control.'
    ],
    tipsFa: ['از قوس دادن بیش از حد کمر خودداری کنید.', 'دمبل‌ها را در بالا به هم نکوبید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-chest-cable-crossover',
    nameEn: 'Cable Fly Crossover',
    nameFa: 'قفسه سینه با سیم‌کش',
    category: 'chest',
    targetMuscleEn: 'Inner/Lower Chest',
    targetMuscleFa: 'عضلات داخلی و تحتانی سینه',
    secondaryMusclesFa: ['سرشانه جلویی'],
    equipmentEn: 'Cable',
    equipmentFa: 'سیم‌کش',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Chest_Fly.gif',
    femaleGifUrl: '/exercises/Chest_Fly.gif',
    instructionsFa: [
      'دستگیره‌های سیم‌کش را در بالاترین موقعیت تنظیم کنید.',
      'یک گام به جلو بردارید و تنه را کمی به جلو خم کنید.',
      'دست‌ها را با خمیدگی اندک در آرنج، مثل آغوش گرفتن یک درخت، جلوی بدن به هم نزدیک کنید.',
      'با کشش کنترل‌شده به حالت اول بازگردید.'
    ],
    instructionsEn: [
      'Set pulleys at top position, step forward with one foot.',
      'Slightly bend knees and lean forward from hips.',
      'Bring handles down and together in front of waist.',
      'Return slowly to feel stretching in chest.'
    ],
    tipsFa: ['حرکت را با تمرکز روی انقباض سینه انجام دهید نه با تکان دادن بدن.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-chest-pushup',
    nameEn: 'Bodyweight Push-Up',
    nameFa: 'شنا سوئدی استاندارد (وزن بدن)',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major',
    targetMuscleFa: 'سینه و عضلات ثبات‌دهنده تنه',
    secondaryMusclesFa: ['پشت بازو', 'سرشانه', 'شکم'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Dumbbell_Bench_Press.gif',
    femaleGifUrl: '/exercises/Dumbbell_Bench_Press.gif',
    instructionsFa: [
      'دست‌ها را به اندازه عرض شانه روی زمین بگذارید و بدن را مستقیم نگه دارید.',
      'سینه‌تان را تا نزدیک زمین پایین بیاورید.',
      'با فشار عضلات سینه و دست‌ها، به حالت اول برگردید.'
    ],
    instructionsEn: [
      'Place hands shoulder-width apart, body in straight line.',
      'Lower chest towards ground keeping core tight.',
      'Push back up to starting plank position.'
    ],
    tipsFa: ['از افتادن لگن به پایین یا بالا رفتن بیش از حد باسن جلوگیری کنید.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },

  // BICEPS
  {
    id: 'mw-biceps-barbell-curl',
    nameEn: 'Barbell Bicep Curl',
    nameFa: 'جلو بازو با هالتر ایستاده',
    category: 'biceps',
    targetMuscleEn: 'Biceps Brachii',
    targetMuscleFa: 'جلو بازو (دو سر بازویی)',
    secondaryMusclesFa: ['ساعد (براکیورادیالیس)'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Dumbbell_Bicep_Curl.gif',
    femaleGifUrl: '/exercises/Dumbbell_Bicep_Curl.gif',
    instructionsFa: [
      'صاف بایستید و هالتر را با گرفتن کف دست‌ها به سمت بالا بگیرید.',
      'آرنج‌ها را نزدیک پهلوها نگه دارید.',
      'هالتر را بدون تکان دادن کمر به سمت بالا جمع کنید.',
      'در بالاترین نقطه ۱ ثانیه مکث و سپس با کنترل پایین بیاورید.'
    ],
    instructionsEn: [
      'Stand upright holding bar with underhand grip.',
      'Keep elbows pinned close to torso.',
      'Curl weight up towards shoulders.',
      'Pause at peak contraction and lower slowly.'
    ],
    tipsFa: ['از تاب دادن تنه برای بالا بردن وزنه خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-biceps-hammer-curl',
    nameEn: 'Dumbbell Hammer Curl',
    nameFa: 'جلو بازو دمبل چکشی',
    category: 'biceps',
    targetMuscleEn: 'Brachialis & Brachioradialis',
    targetMuscleFa: 'عضله براکیالیس و ساعد',
    secondaryMusclesFa: ['جلو بازو'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Dumbbell_Hammer_Curl.gif',
    femaleGifUrl: '/exercises/Dumbbell_Hammer_Curl.gif',
    instructionsFa: [
      'دمبل‌ها را به گونه‌ای بگیرید که کف دست‌ها روبروی یکدیگر باشند.',
      'آرنج‌ها ثابت و دمبل‌ها را مستقیماً بالا بکشید.',
      'در بالا کمی مکث کرده و سپس با کنترل پایین برید.'
    ],
    instructionsEn: [
      'Hold dumbbells with neutral grip (palms facing each other).',
      'Keep upper arms stationary, curl weights forward.',
      'Lower back to starting position slowly.'
    ],
    tipsFa: ['این حرکت ضخامت بازو و عضلات ساعد را تقویت می‌کند.'],
    defaultSets: 3,
    defaultReps: '12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-biceps-preacher-curl',
    nameEn: 'Preacher Curl',
    nameFa: 'جلو بازو لاری با هالتر EZ',
    category: 'biceps',
    targetMuscleEn: 'Short Head Biceps',
    targetMuscleFa: 'سر کوتاه جلو بازو (تراکم بازو)',
    secondaryMusclesFa: ['ساعد'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر EZ / دستگاه',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/EZ_Bar_Preacher_Curl.gif',
    femaleGifUrl: '/exercises/EZ_Bar_Preacher_Curl.gif',
    instructionsFa: [
      'بازوها را روی تشک لاری تثبیت کنید.',
      'هالتر EZ را بالا بیاورید بدون اینکه آرنج از تشک جدا شود.',
      'به آرامی تا کشش کامل پایین ببرید.'
    ],
    instructionsEn: [
      'Rest upper arms on preacher bench pad.',
      'Curl EZ bar upwards towards chin.',
      'Extend arms back down carefully.'
    ],
    tipsFa: ['از باز شدن ضربه‌ای آرنج در انتهای حرکت خودداری کنید.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // TRICEPS
  {
    id: 'mw-triceps-pushdown',
    nameEn: 'Cable Triceps Pushdown',
    nameFa: 'پشت بازو سیم‌کش با طناب / میله',
    category: 'triceps',
    targetMuscleEn: 'Triceps Lateral Head',
    targetMuscleFa: 'پشت بازو (سر جانبی و خارجی)',
    secondaryMusclesFa: ['ساعد'],
    equipmentEn: 'Cable',
    equipmentFa: 'سیم‌کش',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Triceps_Pushdown.gif',
    femaleGifUrl: '/exercises/Triceps_Pushdown.gif',
    instructionsFa: [
      'میله یا طناب سیم‌کش را بگیرید و آرنج‌ها را قفل در کنار بدنتان نگه دارید.',
      'دست‌ها را تا صاف شدن کامل آرنج‌ها به سمت پایین فشار دهید.',
      'در پایین ۱ ثانیه انقباض کامل ایجاد کرده و سپس آرنج را زاویه ۹۰ درجه بازگردانید.'
    ],
    instructionsEn: [
      'Attach bar or rope to high pulley.',
      'Keep elbows tight by sides and push handle down.',
      'Contract triceps fully at bottom, return with control.'
    ],
    tipsFa: ['بدن را جلو نیندازید و آرنج‌ها را ثابت نگه دارید.'],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-triceps-skullcrusher',
    nameEn: 'Lying Triceps Extension (Skullcrusher)',
    nameFa: 'پشت بازو خوابیده با هالتر (اسکال کرشر)',
    category: 'triceps',
    targetMuscleEn: 'Triceps Long Head',
    targetMuscleFa: 'پشت بازو (سر بلند پشت بازو)',
    secondaryMusclesFa: ['مچ و ساعد'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر EZ',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Lying_Triceps_Extension.gif',
    femaleGifUrl: '/exercises/Lying_Triceps_Extension.gif',
    instructionsFa: [
      'روی میز صاف بخوابید و هالتر را بالای پیشانی نگه دارید.',
      'تنها با خم کردن آرنج‌ها، هالتر را تا نزدیک پیشانی پایین بیاورید.',
      'با انقباض پشت بازو، دست‌ها را دوباره صاف کنید.'
    ],
    instructionsEn: [
      'Lie on flat bench with EZ bar raised straight above chest.',
      'Flex elbows to lower bar towards forehead keeping upper arms fixed.',
      'Extend elbows back to starting position.'
    ],
    tipsFa: ['بازوها باید ثابت بمانند و حرکت فقط از مفصل آرنج باشد.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },

  // SHOULDERS
  {
    id: 'mw-shoulders-overhead-press',
    nameEn: 'Barbell Overhead Shoulder Press',
    nameFa: 'پرس سرشانه هالتر از جلو ایستاده',
    category: 'shoulders',
    targetMuscleEn: 'Anterior & Medial Deltoid',
    targetMuscleFa: 'سرشانه جلویی و جانبی (دلتوئید)',
    secondaryMusclesFa: ['پشت بازو', 'بالای سینه', 'فیله و شکم'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Dumbbell_Shoulder_Press.gif',
    femaleGifUrl: '/exercises/Dumbbell_Shoulder_Press.gif',
    instructionsFa: [
      'هالتر را روی بالای سینه بگذارید و شکم را سفت کنید.',
      'هالتر را مستقیماً بالای سر پرس کنید تا دست‌ها صاف شوند.',
      'با کنترل به روی بالای سینه برگردانید.'
    ],
    instructionsEn: [
      'Hold bar at upper chest height with shoulder-width grip.',
      'Press bar overhead until arms are extended.',
      'Lower bar with control back to collarbone level.'
    ],
    tipsFa: ['کمر را عقب نیندازید و ماهیچه شکم را منقبض نگه دارید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-shoulders-lateral-raise',
    nameEn: 'Dumbbell Lateral Raise',
    nameFa: 'نشر جانب با دمبل (سرشانه بغل)',
    category: 'shoulders',
    targetMuscleEn: 'Lateral Deltoid',
    targetMuscleFa: 'سرشانه جانبی (پهنای سرشانه)',
    secondaryMusclesFa: ['ذوزنقه‌ای (کول)'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Cable_Front_Raise.gif',
    femaleGifUrl: '/exercises/Cable_Front_Raise.gif',
    instructionsFa: [
      'ایستاده و دمبل‌ها را کنار بدن نگه دارید.',
      'دست‌ها را تا خط شانه به طرفین بالا بیاورید (آرنج‌ها کمی خم).',
      'با کنترل کامل به آرامی پایین بیاورید.'
    ],
    instructionsEn: [
      'Stand holding dumbbells at your sides.',
      'Raise arms out to sides until parallel to floor.',
      'Lower back down under control.'
    ],
    tipsFa: ['وزنه سنگین نزنید که تنه تکان بخورد؛ تمرکز روی سوزش عضله بغل شانه است.'],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // BACK
  {
    id: 'mw-back-lat-pulldown',
    nameEn: 'Lat Pulldown',
    nameFa: 'زیربغل سیم‌کش از جلو (پشت باز)',
    category: 'back',
    targetMuscleEn: 'Latissimus Dorsi',
    targetMuscleFa: 'زیربغل (عضله لاتیسیموس دپکسی)',
    secondaryMusclesFa: ['جلو بازو', 'سرشانه پشتی'],
    equipmentEn: 'Cable',
    equipmentFa: 'دستگاه سیم‌کش',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Lat_Pulldown.gif',
    femaleGifUrl: '/exercises/Lat_Pulldown.gif',
    instructionsFa: [
      'میله را پهن‌تر از عرض شانه بگیرید و روی صندلی بنشینید.',
      'سینه را بالا نگه دارید و میله را تا بالای سینه پایین بکشید.',
      'کتف‌ها را در پایین جمع کرده و سپس به آرامی اجازه دهید دست‌ها کشیده شوند.'
    ],
    instructionsEn: [
      'Sit at pulldown machine gripping bar wide.',
      'Pull bar down towards upper chest keeping chest high.',
      'Squeeze shoulder blades together, return smoothly.'
    ],
    tipsFa: ['از تکیه دادن و تاب دادن بدن به سمت عقب خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-back-bent-over-row',
    nameEn: 'Bent Over Barbell Row',
    nameFa: 'زیربغل هالتر خم',
    category: 'back',
    targetMuscleEn: 'Rhomboids & Mid-Back',
    targetMuscleFa: 'عضلات میان‌پشت، ذوزنقه‌ای و زیربغل',
    secondaryMusclesFa: ['جلو بازو', 'فیله کمر'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'پیشرفته',
    gifUrl: '/exercises/Bent_Over_Dumbbell_Row.gif',
    femaleGifUrl: '/exercises/Bent_Over_Dumbbell_Row.gif',
    instructionsFa: [
      'از ناحیه باسن خم شوید تا تنه با زمین زاویه ۴۵ درجه بسازد، زانوها کمی خم.',
      'هالتر را به سمت زیر شکم و ناف بکشید.',
      'کتف‌ها را در بالا به هم فشار داده و سپس با کنترل پایین ببرید.'
    ],
    instructionsEn: [
      'Hinge at hips to lean torso forward at 45 degrees.',
      'Pull barbell up to lower ribs/navel.',
      'Squeeze shoulder blades and lower with control.'
    ],
    tipsFa: ['کمر را کاملاً صاف نگه دارید و قوس منفی ندهید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },

  // LEGS
  {
    id: 'mw-legs-barbell-squat',
    nameEn: 'Barbell Back Squat',
    nameFa: 'اسکوات پا با هالتر از پشت',
    category: 'legs',
    targetMuscleEn: 'Quadriceps & Glutes',
    targetMuscleFa: 'چهارسر ران و عضلات باسن (سرینی)',
    secondaryMusclesFa: ['همسترینگ (پشت ران)', 'فیله کمر', 'شکم'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'پیشرفته',
    gifUrl: '/exercises/Barbell_Squat.gif',
    femaleGifUrl: '/exercises/Barbell_Squat.gif',
    instructionsFa: [
      'هالتر را روی عضلات ذوزنقه‌ای پشت قرار دهید، پاها به عرض شانه.',
      'با عقب دادن باسن و خم کردن زانوها تا موازی شدن ران با زمین پایین بروید.',
      'با فشار پاشنه پاها به زمین، به حالت ایستاده برگردید.'
    ],
    instructionsEn: [
      'Rest barbell on upper traps with feet shoulder-width apart.',
      'Sit back into hips and bend knees until thighs parallel to floor.',
      'Drive through heels to extend hips and knees to standing.'
    ],
    tipsFa: ['زانوها نباید از پنجه پا خیلی جلوتر بروند یا به سمت داخل بچرخند.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 120,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-legs-leg-extension',
    nameEn: 'Leg Extension Machine',
    nameFa: 'جلو پا دستگاه (چهارسر ران)',
    category: 'legs',
    targetMuscleEn: 'Quadriceps',
    targetMuscleFa: 'عضلات چهارسر ران (جلوی ران)',
    secondaryMusclesFa: [],
    equipmentEn: 'Machine',
    equipmentFa: 'دستگاه',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Leg_Extension.gif',
    femaleGifUrl: '/exercises/Leg_Extension.gif',
    instructionsFa: [
      'روی دستگاه بنشینید و بالشتک را بالای مچ پا تنظیم کنید.',
      'پاها را صاف کنید تا چهارسر ران منقبض شود.',
      'به آرامی به حالت اول برگردانید.'
    ],
    instructionsEn: [
      'Sit on leg extension machine with pad against lower shins.',
      'Extend legs forward until fully straight.',
      'Lower slowly under tension.'
    ],
    tipsFa: ['در بالای حرکت ۱ ثانیه انقباض ایجاد کنید.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // ABS
  {
    id: 'mw-abs-crunch',
    nameEn: 'Abdominal Crunch',
    nameFa: 'کرانچ شکم روی زمین (Ab Crunch)',
    category: 'abs',
    targetMuscleEn: 'Rectus Abdominis',
    targetMuscleFa: 'عضلات راست شکمی (شش تکه / بالای شکم)',
    secondaryMusclesFa: ['مورب شکمی'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Crunch.gif',
    femaleGifUrl: '/exercises/Crunch.gif',
    instructionsFa: [
      'روی زمین دراز بکشید و زانوها را ۹۰ درجه خم کنید.',
      'دست‌ها را پشت سر یا روی سینه بگذارید.',
      'با انقباض شکم، کتف‌ها را از زمین بلند کرده و شکم را فشرده کنید.',
      'به آرامی پایین بروید.'
    ],
    instructionsEn: [
      'Lie on back with knees bent and feet flat on floor.',
      'Place hands behind head or across chest.',
      'Curl shoulders up towards ceiling using core muscles.',
      'Lower slowly back down.'
    ],
    tipsFa: ['گردن را نکشید و جابه‌جایی را فقط با عضلات شکم انجام دهید.'],
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-abs-hanging-leg-raise',
    nameEn: 'Hanging Leg Raise',
    nameFa: 'زیر شکم خلبانی / آویزان از میله بارفیکس',
    category: 'abs',
    targetMuscleEn: 'Lower Rectus Abdominis & Hip Flexors',
    targetMuscleFa: 'عضلات راست شکمی (بخش زیر شکم) و سوئز',
    secondaryMusclesFa: ['مورب شکمی (پهلو)'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'میله بارفیکس / پارالل',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Crunch.gif',
    femaleGifUrl: '/exercises/Crunch.gif',
    instructionsFa: [
      'از میله آویزان شوید.',
      'پاها را صاف یا با زانوی کمی خم تا زاویه ۹۰ درجه بالا بیاورید.',
      'با کنترل کامل لگن را بالا بکشید تا زیر شکم منقبض شود و پایین بیاورید.'
    ],
    instructionsEn: [
      'Hang from chin-up bar with overhand grip.',
      'Raise legs up until parallel to floor by flexing abdomen.',
      'Lower legs back down slowly without swinging.'
    ],
    tipsFa: ['بدن را تاب ندهید و فقط از قدرت شکم استفاده کنید.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  }
];
