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
  sideGifUrl?: string;
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
  // ==================== CHEST ====================
  {
    id: 'mw-barbell-bench-press',
    nameEn: 'Barbell Bench Press',
    nameFa: 'پرس سینه با هالتر روی میز صاف',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major',
    targetMuscleFa: 'سینه (پکتورالیس ماژور - سینه میانی)',
    secondaryMusclesFa: ['سرشانه جلویی (قدامی)', 'پشت بازو (سه سر بازویی)'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-bench-press-front_C2G7O8r.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    instructionsFa: [
      'روی میز پرس صاف دراز بکشید و کف پاها را محکم روی زمین فیکس کنید.',
      'هالتر را با فاصله‌ای کمی بیشتر از عرض شانه‌ها بگیرید و مچ‌ها را صاف نگه دارید.',
      'کتف‌ها را به سمت عقب و پایین قفل کنید (Retraction).',
      'میله را با کنترل تا روی استخوان جناغ سینه پایین بیاورید.',
      'با انقباض عضلات سینه و بدون قفل کردن کامل آرنج‌ها، هالتر را به نقطه شروع بازگردانید.'
    ],
    instructionsEn: [
      'Lie flat on the bench with feet flat on the floor.',
      'Grip the bar slightly wider than shoulder width.',
      'Lower the bar with control to your mid-chest.',
      'Press up powerfully using your chest muscles.'
    ],
    tipsFa: ['کتف‌ها در تمام طول ست باید جمع باشند.', 'از کمانه‌زدن و کوبیدن میله روی قفسه سینه خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-incline-bench-press',
    nameEn: 'Incline Barbell Bench Press',
    nameFa: 'پرس بالاسینه با هالتر',
    category: 'chest',
    targetMuscleEn: 'Upper Chest (Clavicular Head)',
    targetMuscleFa: 'بالاسینه (سر ترقوه‌ای سینه)',
    secondaryMusclesFa: ['دلتوئید جلویی', 'سه سر بازویی'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-incline-bench-press-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-incline-bench-press-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-incline-bench-press-side.gif',
    instructionsFa: [
      'میز شیبدار را روی زاویه ۳۰ الی ۴۵ درجه تنظیم کنید.',
      'هالتر را با عرض مناسب بگیرید و با کنترل تا بالای خط بالاسینه پایین بیاورید.',
      'با تمرکز بر انقباض بخش بالایی سینه، هالتر را به سمت بالا پرس کنید.'
    ],
    instructionsEn: [
      'Set bench to 30-45 degree incline.',
      'Lower the barbell to the upper chest.',
      'Press upward focusing on upper pectoral contraction.'
    ],
    tipsFa: ['شیب بیش از ۴۵ درجه فشار را روی سرشانه منتقل می‌کند.'],
    defaultSets: 4,
    defaultReps: '8-12',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-incline-bench-press',
    nameEn: 'Incline Dumbbell Press',
    nameFa: 'پرس بالاسینه با دمبل',
    category: 'chest',
    targetMuscleEn: 'Upper Chest',
    targetMuscleFa: 'بالاسینه و تفکیک دوطرفه',
    secondaryMusclesFa: ['دلتوئید جلویی', 'پشت بازو'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-incline-bench-press-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-incline-bench-press-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-incline-bench-press-side.gif',
    instructionsFa: [
      'روی میز شیبدار بنشینید و دمبل‌ها را با کمک زانوها بالا بیاورید.',
      'دمبل‌ها را در زاویه ۴۵ درجه نسبت به بالاتنه نگه دارید.',
      'با دامنه حرکتی کامل و بدون کوبیدن دمبل‌ها در بالا، حرکت را تکرار کنید.'
    ],
    instructionsEn: [
      'Sit on an incline bench and bring dumbbells to chest level.',
      'Press the dumbbells up until arms are extended.',
      'Lower under control to feel deep stretch in upper chest.'
    ],
    tipsFa: ['دامنه حرکتی دمبل‌ها بیشتر از هالتر است؛ از کشش عمیق در پایین استفاده کنید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-incline-chest-flys',
    nameEn: 'Incline Dumbbell Chest Fly',
    nameFa: 'قفسه بالاسینه با دمبل (فلای شیبدار)',
    category: 'chest',
    targetMuscleEn: 'Upper Pectorals',
    targetMuscleFa: 'کشش و انقباض بالاسینه',
    secondaryMusclesFa: ['دلتوئید قدامی', 'دنده‌ای قدامی'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    instructionsFa: [
      'روی میز شیبدار دراز بکشید و دمبل‌ها را با آرنج کمی خمیده بالای سینه بگیرید.',
      'دست‌ها را به آرامی به طرفین باز کنید تا کشش مناسبی در سینه حس شود.',
      'مثل بغل کردن یک تنه درخت، دمبل‌ها را به نقطه شروع بازگردانید.'
    ],
    instructionsEn: [
      'Lie on incline bench with arms slightly bent.',
      'Open arms wide to feel a chest stretch.',
      'Bring dumbbells together above upper chest.'
    ],
    tipsFa: ['زاویه آرنج را در کل طول حرکت ثابت نگه دارید.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-pushup',
    nameEn: 'Bodyweight Push-Up',
    nameFa: 'شنا سوئدی استاندارد',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major & Core',
    targetMuscleFa: 'سینه، ثبات‌دهنده‌های تنه و سرشانه',
    secondaryMusclesFa: ['پشت بازو', 'شکم', 'چهارسر'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-pushup-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-pushup-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-pushup-side.gif',
    instructionsFa: [
      'دست‌ها را کمی بازتر از عرض شانه روی زمین بگذارید.',
      'بدن در یک خط مستقیم از سر تا پاشنه پا قرار گیرد.',
      'سینه را تا چند سانتی‌متری زمین پایین آورده و سپس با قدرت به بالا برگردید.'
    ],
    instructionsEn: [
      'Hands shoulder-width apart, body in a straight line.',
      'Lower chest towards the floor.',
      'Push back up keeping your core braced.'
    ],
    tipsFa: ['از افتادگی باسن یا قوس دادن به کمر پرهیز کنید.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-incline-pushup',
    nameEn: 'Incline Push-Up',
    nameFa: 'شنا سوئدی دست روی بلندی (شیبدار)',
    category: 'chest',
    targetMuscleEn: 'Lower Chest & Core',
    targetMuscleFa: 'زیر سینه و سینه میانی',
    secondaryMusclesFa: ['پشت بازو', 'سرشانه'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-incline-pushup-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-incline-pushup-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-incline-pushup-side.gif',
    instructionsFa: [
      'دست‌ها را روی یک نیمکت یا سطح مرتفع قرار دهید.',
      'با حفظ خط مستقیم بدن، سینه را به لبه نیمکت نزدیک کنید و سپس به بالا فشار دهید.'
    ],
    instructionsEn: [
      'Place hands on an elevated bench.',
      'Lower chest to edge of bench and press back up.'
    ],
    tipsFa: ['مناسب برای گرم کردن یا افراد مبتدی و تمرکز بر زیر سینه.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-diamond-pushup',
    nameEn: 'Diamond Push-Up',
    nameFa: 'شنا الماسی (دست جمع)',
    category: 'chest',
    targetMuscleEn: 'Inner Chest & Triceps',
    targetMuscleFa: 'عضلات داخلی سینه و پشت بازو',
    secondaryMusclesFa: ['سرشانه جلویی', 'شکم'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-bodyweight-diamond-pushup-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-diamond-pushup-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-diamond-pushup-side.gif',
    instructionsFa: [
      'شست و اشاره هر دو دست را به هم نزدیک کنید تا شکل الماس تشکیل شود.',
      'بدن را صاف نگه داشته و سینه را تا نزدیک دست‌ها پایین بیاورید.'
    ],
    instructionsEn: [
      'Form a diamond shape with index fingers and thumbs.',
      'Lower chest towards diamond and press upward.'
    ],
    tipsFa: ['فشار شدید بر پشت بازو و خط وسط سینه.'],
    defaultSets: 3,
    defaultReps: '10-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-dips',
    nameEn: 'Chest Dips',
    nameFa: 'پارالل سینه (دیپ وزن بدن)',
    category: 'chest',
    targetMuscleEn: 'Lower Pectorals & Triceps',
    targetMuscleFa: 'زیر سینه، خط زیرین سینه و پشت بازو',
    secondaryMusclesFa: ['سرشانه جلویی'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-bodyweight-dips-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-dips-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-dips-side.gif',
    instructionsFa: [
      'روی میله‌های پارالل قرار بگیرید و بدن را حدود ۳۰ درجه به جلو متمایل کنید.',
      'آرنج‌ها را خم کنید تا بازوها موازی زمین شوند.',
      'با فشار عضلات سینه به حالت شروع برگردید.'
    ],
    instructionsEn: [
      'Suspend body on parallel bars with forward lean.',
      'Lower until upper arms are parallel to floor.',
      'Push back up using chest power.'
    ],
    tipsFa: ['متمایل شدن به جلو فشار را به سینه منتقل می‌کند.'],
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },

  // ==================== BACK ====================
  {
    id: 'mw-barbell-bent-over-row',
    nameEn: 'Bent Over Barbell Row',
    nameFa: 'زیربغل هالتر خم',
    category: 'back',
    targetMuscleEn: 'Latissimus Dorsi & Rhomboids',
    targetMuscleFa: 'زیربغل (لت)، لوزی‌شکل و متوازی‌الاضلاع',
    secondaryMusclesFa: ['جلو بازو', 'فیله کمر', 'پشت سرشانه'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    instructionsFa: [
      'کمر را با زاویه ۴۵ درجه صاف نگه دارید و زانوها را اندکی خم کنید.',
      'هالتر را به سمت زیر ناف بکشید و کتف‌ها را در انتهای دامنه به هم فشار دهید.',
      'با کنترل میله را پایین بیاورید بدون اینکه کمر خمیده شود.'
    ],
    instructionsEn: [
      'Hinge at hips to 45 degrees with flat back.',
      'Pull barbell towards your lower ribs/navel.',
      'Squeeze shoulder blades together at top.'
    ],
    tipsFa: ['ستون فقرات در تمام طول ست باید کاملاً خنثی و بدون قوز باشد.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-deadlift',
    nameEn: 'Barbell Deadlift',
    nameFa: 'ددلیفت استاندارد با هالتر',
    category: 'back',
    targetMuscleEn: 'Erector Spinae & Glutes',
    targetMuscleFa: 'زنجیره خلفی، فیله کمر، باسن و همسترینگ',
    secondaryMusclesFa: ['چهارسر', 'کول (تراپزیوس)', 'ساعد'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-barbell-deadlift-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-deadlift-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-deadlift-side.gif',
    instructionsFa: [
      'پاها به عرض لگن، میله نزدیک به ساق پا.',
      'قفسه سینه بالا، کمر صاف، با درگیر کردن عضلات باسن و پشت میله را بلند کنید.',
      'در بالای حرکت کاملاً صاف بایستید بدون خم شدن بیش از حد به عقب.'
    ],
    instructionsEn: [
      'Stand with feet hip-width apart, bar over midfoot.',
      'Hinge hips, grasp bar, keep chest proud and back flat.',
      'Drive through floor with legs and hips to stand tall.'
    ],
    tipsFa: ['میله باید در نزدیک‌ترین فاصله ممکن به بدن حرکت کند.'],
    defaultSets: 4,
    defaultReps: '5-8',
    defaultRestSeconds: 120,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-sumo-deadlift',
    nameEn: 'Sumo Deadlift',
    nameFa: 'ددلیفت سومو با هالتر',
    category: 'back',
    targetMuscleEn: 'Glutes, Adductors & Lower Back',
    targetMuscleFa: 'عضلات سرینی (باسن)، داخل ران و ستون فقرات',
    secondaryMusclesFa: ['چهارسر ران', 'زیربغل', 'کول'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-barbell-sumo-deadlift-front_aeM2BqT.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-sumo-deadlift-side_av3A2PM.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-sumo-deadlift-side_av3A2PM.gif',
    instructionsFa: [
      'پاها بازتر از عرض شانه و پنجه‌ها با زاویه ۴۵ درجه به بیرون.',
      'دست‌ها داخل زانوها هالتر را گرفته و با فشار پاشنه‌ها به زمین وزنه را بالا بیاورید.'
    ],
    instructionsEn: [
      'Wide stance with toes pointed outward.',
      'Grip bar inside knees and drive through floor with hips.'
    ],
    tipsFa: ['زاویه عمودی‌تر بالاتنه نسبت به ددلیفت معمولی.'],
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSeconds: 120,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-unilateral-row',
    nameEn: 'Unilateral Dumbbell Row',
    nameFa: 'زیربغل تک دمبل خم (اره‌ای)',
    category: 'back',
    targetMuscleEn: 'Latissimus Dorsi',
    targetMuscleFa: 'زیربغل تک‌دست و عضلات میانی پشت',
    secondaryMusclesFa: ['جلو بازو', 'پشت سرشانه'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-row-unilateral-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-unilateral-row-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-unilateral-row-side.gif',
    instructionsFa: [
      'یک دست و یک زانو را روی نیمکت صاف قرار دهید.',
      'دمبل را در امتداد یک مسیر قوسی به سمت لگن بکشید.',
      'در نقطه اوج عضلات زیربغل را منقبض کرده و به آرامی پایین بیاورید.'
    ],
    instructionsEn: [
      'Place one knee and hand on flat bench.',
      'Pull dumbbell towards your hip in a slight arc.',
      'Lower under control to full stretch.'
    ],
    tipsFa: ['چرخش بیش از حد در تنه ایجاد نکنید تا تمرکز روی لت حفظ شود.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-pullup',
    nameEn: 'Wide Grip Pull-Up',
    nameFa: 'بارفیکس دست باز',
    category: 'back',
    targetMuscleEn: 'Latissimus Dorsi (Outer Lats)',
    targetMuscleFa: 'عریض کردن زیربغل (V-Taper)',
    secondaryMusclesFa: ['جلو بازو', 'گرد بزرگ', 'ساعد'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-bodyweight-pullup-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-pullup-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-pullup-side.gif',
    instructionsFa: [
      'میله بارفیکس را با فاصله‌ای بازتر از عرض شانه بگیرید (کف دست رو به جلو).',
      'سینه را به سمت بالا هدایت کنید تا چانه از میله عبور کند.',
      'با کنترل کامل تا کشش کامل زیربغل پایین بیایید.'
    ],
    instructionsEn: [
      'Grip bar with hands wider than shoulder width.',
      'Pull yourself up leading with your chest until chin clears bar.',
      'Lower slowly to complete hang.'
    ],
    tipsFa: ['از ضربه زدن با پاها (کیپینگ) خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '6-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-chinup',
    nameEn: 'Chin-Up',
    nameFa: 'بارفیکس مچ برعکس (دست جمع)',
    category: 'back',
    targetMuscleEn: 'Lats & Biceps',
    targetMuscleFa: 'بخش پایینی زیربغل و جلو بازو',
    secondaryMusclesFa: ['ساعد', 'سینه'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-bodyweight-chinup-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-chinup-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-chinup-side.gif',
    instructionsFa: [
      'میله را با کف دست‌های رو به صورت و به عرض شانه بگیرید.',
      'بدن را بالا بکشید تا چانه بالای میله قرار گیرد.'
    ],
    instructionsEn: [
      'Grip bar with underhand grip shoulder-width apart.',
      'Pull up until chin clears bar, engaging biceps and lats.'
    ],
    tipsFa: ['بهترین حرکت ترکیبی برای زیربغل و حجم جلو بازو.'],
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },

  // ==================== SHOULDERS ====================
  {
    id: 'mw-barbell-overhead-press',
    nameEn: 'Overhead Barbell Press',
    nameFa: 'پرس سرشانه با هالتر (میلیتاری پرس)',
    category: 'shoulders',
    targetMuscleEn: 'Anterior & Lateral Deltoid',
    targetMuscleFa: 'دلتوئید قدامی (جلویی) و میانی',
    secondaryMusclesFa: ['پشت بازو', 'کول', 'شکم و هسته بدن'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-overhead-press-front_OJMNLxU.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-overhead-press-side_rFqqcjI.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-overhead-press-side_rFqqcjI.gif',
    instructionsFa: [
      'ایستاده یا نشسته، میله را در سطح بالای سینه نگه دارید.',
      'شکم و باسن را سفت کنید و هالتر را مستقیم بالای سر پرس کنید.',
      'سر را در بالاترین نقطه کمی به جلو هدایت کنید تا میله در راستای ستون فقرات قفل شود.'
    ],
    instructionsEn: [
      'Hold bar at clavicle level with tight core.',
      'Press straight overhead until arms are fully extended.',
      'Control the descent back to upper chest.'
    ],
    tipsFa: ['از قوس دادن افراطی به کمر خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-seated-overhead-press',
    nameEn: 'Seated Dumbbell Overhead Press',
    nameFa: 'پرس سرشانه نشسته با دمبل',
    category: 'shoulders',
    targetMuscleEn: 'Front & Side Deltoids',
    targetMuscleFa: 'بخش جلویی و میانی سرشانه',
    secondaryMusclesFa: ['پشت بازو', 'کول بالایی'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-seated-overhead-press-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-seated-overhead-press-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-seated-overhead-press-side.gif',
    instructionsFa: [
      'روی صندلی با تکیه‌گاه عمودی بنشینید.',
      'دمبل‌ها را در ارتفاع گوش‌ها نگه داشته و با زاویه ملایم به سمت بالا پرس کنید.'
    ],
    instructionsEn: [
      'Sit upright with dumbbells at ear height.',
      'Press upward in a smooth arc until extended overhead.'
    ],
    tipsFa: ['در بالای حرکت دمبل‌ها را به یکدیگر نکوبید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-lateral-raise',
    nameEn: 'Dumbbell Lateral Raise',
    nameFa: 'نشر از جانب با دمبل (سرشانه نشر بغل)',
    category: 'shoulders',
    targetMuscleEn: 'Lateral Deltoid',
    targetMuscleFa: 'دلتوئید جانبی (گردی و پهنای شانه)',
    secondaryMusclesFa: ['کول', 'پشت سرشانه'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    instructionsFa: [
      'صاف بایستید، دمبل‌ها کنار ران‌ها، آرنج‌ها دارای خمیدگی جزئی.',
      'دست‌ها را تا ارتفاع شانه به طرفین بالا بیاورید (هدایت حرکت با آرنج).',
      'در نقطه اوج مکث کوتاهی کرده و آرام پایین بیاورید.'
    ],
    instructionsEn: [
      'Stand tall, raise dumbbells out to sides leading with elbows.',
      'Raise to shoulder height, pause, and lower slowly.'
    ],
    tipsFa: ['از پرتاب کردن وزنه‌ها با تکان دادن بالاتنه خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-upright-row',
    nameEn: 'Barbell Upright Row',
    nameFa: 'کول با هالتر ایستاده (آپ رایت رو)',
    category: 'shoulders',
    targetMuscleEn: 'Trapezius & Side Delts',
    targetMuscleFa: 'عضلات کول (تراپزیوس) و سرشانه کناری',
    secondaryMusclesFa: ['ساعد', 'جلو بازو'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-upright-row-front_3ROsKgm.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-upright-row-side_NBzD3il.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-upright-row-side_NBzD3il.gif',
    instructionsFa: [
      'هالتر را با فاصله‌ای به عرض شانه بگیرید.',
      'میله را در امتداد بدن تا نزدیک سینه بالا بکشید (آرنج‌ها بالاتر از میله قرار گیرند).'
    ],
    instructionsEn: [
      'Hold bar shoulder-width apart.',
      'Pull bar up close to body leading with elbows.'
    ],
    tipsFa: ['فاصله دست‌ها خیلی بسته نباشد تا به مچ و مفصل شانه آسیب نرسد.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-shrug',
    nameEn: 'Dumbbell Shrug',
    nameFa: 'شراگ با دمبل ایستاده (کول دمبل)',
    category: 'shoulders',
    targetMuscleEn: 'Upper Trapezius',
    targetMuscleFa: 'بخش بالایی عضلات کول',
    secondaryMusclesFa: ['ساعد', 'عضلات گردن'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-shrug-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-shrug-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-shrug-side.gif',
    instructionsFa: [
      'دمبل‌ها را در کنار بدن بگیرید.',
      'بدون چرخاندن شانه، شانه‌ها را مستقیم به سمت گوش‌ها بالا بکشید و ۲ ثانیه منقبض کنید.'
    ],
    instructionsEn: [
      'Hold dumbbells at sides.',
      'Elevate shoulders straight up towards ears, squeeze and lower.'
    ],
    tipsFa: ['از چرخاندن مفصل شانه خودداری کنید؛ حرکت صرفاً بالا و پایین است.'],
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-seated-shrug',
    nameEn: 'Seated Dumbbell Shrug',
    nameFa: 'شراگ با دمبل نشسته',
    category: 'shoulders',
    targetMuscleEn: 'Upper Trapezius',
    targetMuscleFa: 'انقباض ایزوله عضلات کول',
    secondaryMusclesFa: ['عضلات گردن'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-seated-shrug-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-seated-shrug-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-seated-shrug-side.gif',
    instructionsFa: [
      'روی لبه نیمکت بنشینید و دمبل‌ها را در طرفین ران آویزان کنید.',
      'شانه‌ها را به سمت بالا منقبض کنید.'
    ],
    instructionsEn: [
      'Sit on bench and shrug shoulders upward.'
    ],
    tipsFa: ['حالت نشسته جلوی تقلب و تکان دادن زانوها را می‌گیرد.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // ==================== BICEPS & FOREARMS ====================
  {
    id: 'mw-barbell-curl',
    nameEn: 'Barbell Bicep Curl',
    nameFa: 'جلو بازو با هالتر ایستاده',
    category: 'biceps',
    targetMuscleEn: 'Biceps Brachii',
    targetMuscleFa: 'دو سر بازویی (پیک و حجم بازو)',
    secondaryMusclesFa: ['براکیالیس', 'ساعد'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-curl-front_uKPCb8P.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    instructionsFa: [
      'هالتر را با عرض شانه بگیرید و آرنج‌ها را کنار پهلوها ثابت نگه دارید.',
      'بدون تکان دادن کمر، هالتر را تا نزدیکی سینه بالا بیاورید.',
      'در بالا اوج انقباض را حس کرده و به آرامی پایین بیاورید.'
    ],
    instructionsEn: [
      'Stand with feet shoulder-width, elbows pinned to sides.',
      'Curl barbell upward contracting biceps.',
      'Lower with controlled tempo.'
    ],
    tipsFa: ['از پرتاب کردن وزنه با قوس دادن به کمر اجتناب کنید.'],
    defaultSets: 4,
    defaultReps: '8-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-curl',
    nameEn: 'Dumbbell Bicep Curl',
    nameFa: 'جلو بازو با دمبل',
    category: 'biceps',
    targetMuscleEn: 'Biceps Brachii',
    targetMuscleFa: 'جلو بازو با چرخش مچ (سوپینیشن)',
    secondaryMusclesFa: ['براکیالیس', 'ساعد'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-curl-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-curl-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-curl-side.gif',
    instructionsFa: [
      'دمبل‌ها را در کنار بدن بگیرید.',
      'همگام با بالا آوردن، مچ دست را به سمت بیرون بچرخانید تا عضله بازو منقبض شود.'
    ],
    instructionsEn: [
      'Curl dumbbells upward while supinating wrists.',
      'Squeeze at the top and lower slowly.'
    ],
    tipsFa: ['تمرکز روی چرخش مچ در بالا برای حداکثر پیک بازو.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-hammer-curl',
    nameEn: 'Dumbbell Hammer Curl',
    nameFa: 'جلو بازو چکشی با دمبل',
    category: 'biceps',
    targetMuscleEn: 'Brachialis & Brachioradialis',
    targetMuscleFa: 'براکیالیس (ضخامت بازو) و ساعد',
    secondaryMusclesFa: ['دو سر بازویی'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-hammer-curl-front_JbvhNLU.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-hammer-curl-side_io6oHN7.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-hammer-curl-side_io6oHN7.gif',
    instructionsFa: [
      'دمبل‌ها را طوری بگیرید که کف دست‌ها رو به یکدیگر باشند (حالت چکش).',
      'وزنه‌ها را بدون چرخش مچ به بالا بیاورید.'
    ],
    instructionsEn: [
      'Hold dumbbells with neutral palms-facing-in grip.',
      'Curl upward keeping wrists straight.'
    ],
    tipsFa: ['عالی برای پهنای بازو از زاویه روبه‌رو.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-reverse-curl',
    nameEn: 'Barbell Reverse Curl',
    nameFa: 'جلو بازو مچ برعکس با هالتر',
    category: 'biceps',
    targetMuscleEn: 'Brachioradialis & Forearms',
    targetMuscleFa: 'عضله براکیورادیالیس ساعد و بالای ساعد',
    secondaryMusclesFa: ['جلو بازو'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-reverse-curl-front_ysdi82M.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-reverse-curl-side_EGHsY3f.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-reverse-curl-side_EGHsY3f.gif',
    instructionsFa: [
      'هالتر را با کف دست رو به پایین (اور هند) بگیرید و بالا بیاورید.'
    ],
    instructionsEn: [
      'Grip bar overhand (pronated) and curl upward.'
    ],
    tipsFa: ['تقویت شدید مچ و عضلات بیرونی ساعد.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-reverse-curl',
    nameEn: 'Dumbbell Reverse Curl',
    nameFa: 'جلو بازو مچ برعکس با دمبل',
    category: 'biceps',
    targetMuscleEn: 'Brachioradialis',
    targetMuscleFa: 'ساعد و براکیورادیالیس با دمبل',
    secondaryMusclesFa: ['جلو بازو'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-reverse-curl-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-reverse-curl-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-reverse-curl-side.gif',
    instructionsFa: [
      'دمبل‌ها را با دست‌های رو به زمین بالا بیاورید.'
    ],
    instructionsEn: [
      'Curl dumbbells with overhand pronated grip.'
    ],
    tipsFa: ['انجام با کنترل کامل و وزنه‌های متعادل.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-wrist-curl',
    nameEn: 'Barbell Wrist Curl',
    nameFa: 'ساعد با هالتر (مچ نشسته)',
    category: 'biceps',
    targetMuscleEn: 'Wrist Flexors',
    targetMuscleFa: 'خم‌کننده‌های مچ (عضلات داخلی ساعد)',
    secondaryMusclesFa: ['قدرت پنجه'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/barbell-wristcurl-male-front.gif',
    sideGifUrl: '/musclewiki-gifs/barbell-wristcurl-male-side.gif',
    femaleGifUrl: '/musclewiki-gifs/barbell-wristcurl-male-side.gif',
    instructionsFa: [
      'ساعدها را روی ران یا لبه نیمکت بگذارید و مچ‌ها را به سمت بالا خم کنید.'
    ],
    instructionsEn: [
      'Rest forearms on bench and curl wrists upward.'
    ],
    tipsFa: ['دامنه حرکتی کامل مچ دست را رعایت کنید.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-wrist-curl',
    nameEn: 'Dumbbell Wrist Curl',
    nameFa: 'ساعد با دمبل (خم کردن مچ)',
    category: 'biceps',
    targetMuscleEn: 'Forearm Flexors',
    targetMuscleFa: 'عضلات داخلی ساعد تک‌دست',
    secondaryMusclesFa: ['مچ دست'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-wrist-curl-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-wrist-curl-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-wrist-curl-side.gif',
    instructionsFa: [
      'دمبل را در دست گرفته و مچ را بالا و پایین کنید.'
    ],
    instructionsEn: [
      'Curl wrist upward with forearm supported.'
    ],
    tipsFa: ['حرکت با تکرارهای بالا موثرتر است.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-wrist-extension',
    nameEn: 'Dumbbell Wrist Extension',
    nameFa: 'ساعد روی دست با دمبل (اکستنشن مچ)',
    category: 'biceps',
    targetMuscleEn: 'Wrist Extensors',
    targetMuscleFa: 'عضلات اکستنسور (روی ساعد)',
    secondaryMusclesFa: ['مفصل مچ'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-wrist-extension-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-wrist-extension-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-wrist-extension-side.gif',
    instructionsFa: [
      'کف دست رو به پایین و مچ را به سمت بالا اکستند کنید.'
    ],
    instructionsEn: [
      'Extend wrist upwards with palm facing downward.'
    ],
    tipsFa: ['پیشگیری از آسیب تنیس البو.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },

  // ==================== TRICEPS ====================
  {
    id: 'mw-barbell-skullcrusher',
    nameEn: 'Barbell Skullcrusher',
    nameFa: 'پشت بازو هالتر خوابیده (فرانسوی / اسکال کراشر)',
    category: 'triceps',
    targetMuscleEn: 'Triceps Brachii (Long & Medial Heads)',
    targetMuscleFa: 'سه سر بازویی (سر طویل و میانی پشت بازو)',
    secondaryMusclesFa: ['ساعد'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-front_qpHWUa8.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    instructionsFa: [
      'روی میز صاف بخوابید و هالتر را بالای سینه نگه دارید.',
      'آرنج‌ها را ثابت نگه دارید و میله را تا بالای پیشانی پایین بیاورید.',
      'با انقباض پشت بازو میله را به حالت اول بازگردانید.'
    ],
    instructionsEn: [
      'Lie flat holding bar directly above chest.',
      'Keep upper arms stationary and lower bar towards forehead.',
      'Extend arms back to starting position.'
    ],
    tipsFa: ['از باز شدن آرنج‌ها به طرفین جلوگیری کنید.'],
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-laying-tricep-extension',
    nameEn: 'Laying Triceps Extension',
    nameFa: 'پشت بازو هالتر خوابیده پشت سر',
    category: 'triceps',
    targetMuscleEn: 'Triceps Long Head',
    targetMuscleFa: 'سر بلند پشت بازو با کشش عمیق',
    secondaryMusclesFa: ['پشت بازو'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-laying-tricep-extensions-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-laying-tricep-extensions-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-laying-tricep-extensions-side.gif',
    instructionsFa: [
      'میله را به پشت سر هدایت کرده و با انقباض بازوها بالا ببرید.'
    ],
    instructionsEn: [
      'Lower barbell behind head for maximal stretch and extend.'
    ],
    tipsFa: ['کشش عمیق‌تر در سر بلند عضله پشت بازو.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-overhead-tricep-extension',
    nameEn: 'Dumbbell Overhead Tricep Extension',
    nameFa: 'پشت بازو دمبل تک پشت گردن (اورهد)',
    category: 'triceps',
    targetMuscleEn: 'Triceps Long Head',
    targetMuscleFa: 'سر طویل پشت بازو',
    secondaryMusclesFa: ['سرشانه'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-overhead-tricep-extension-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-overhead-tricep-extension-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-overhead-tricep-extension-side.gif',
    instructionsFa: [
      'دمبل را با هر دو دست بالای سر بگیرید و پشت سر پایین ببرید.'
    ],
    instructionsEn: [
      'Hold dumbbell overhead with both hands and lower behind head.'
    ],
    tipsFa: ['آرنج‌ها را نزدیک سر نگه دارید.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-tricep-dips',
    nameEn: 'Bench Triceps Dips',
    nameFa: 'دیپ پشت بازو روی نیمکت',
    category: 'triceps',
    targetMuscleEn: 'Triceps Lateral & Medial Heads',
    targetMuscleFa: 'پشت بازو و سینه',
    secondaryMusclesFa: ['سرشانه جلویی'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-tricep-dips-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-tricep-dips-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-tricep-dips-side.gif',
    instructionsFa: [
      'دست‌ها را روی لبه نیمکت پشت بدن قرار دهید و لگن را پایین ببرید.'
    ],
    instructionsEn: [
      'Place hands on bench behind you and lower hips bending elbows.'
    ],
    tipsFa: ['کمر را نزدیک نیمکت نگه دارید.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // ==================== LEGS ====================
  {
    id: 'mw-barbell-highbar-squat',
    nameEn: 'Barbell Highbar Squat',
    nameFa: 'اسکوات با هالتر (های‌بار)',
    category: 'legs',
    targetMuscleEn: 'Quadriceps & Glutes',
    targetMuscleFa: 'چهارسر ران، باسن (سرینی) و همسترینگ',
    secondaryMusclesFa: ['فیله کمر', 'شکم', 'ساق پا'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    instructionsFa: [
      'هالتر را روی عضلات کول قرار دهید و پاها را به اندازه عرض شانه باز کنید.',
      'باسن را به سمت عقب و پایین ببرید تا ران‌ها حداقل موازی با زمین شوند.',
      'با فشار از پاشنه پاها به حالت ایستاده برگردید.'
    ],
    instructionsEn: [
      'Rest barbell on upper traps, feet shoulder-width apart.',
      'Squat down until thighs are at least parallel to floor.',
      'Drive through midfoot and heels to stand back up.'
    ],
    tipsFa: ['سینه بالا، زانوها در امتداد پنجه پا حرکت کنند.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 120,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-goblet-squat',
    nameEn: 'Dumbbell Goblet Squat',
    nameFa: 'گابلت اسکوات با دمبل',
    category: 'legs',
    targetMuscleEn: 'Quadriceps & Core',
    targetMuscleFa: 'چهارسر ران و ثبات تنه',
    secondaryMusclesFa: ['باسن', 'ساق'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-goblet-squat-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-goblet-squat-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-goblet-squat-side.gif',
    instructionsFa: [
      'دمبل را به صورت عمودی جلوی سینه نگه دارید و اسکوات بزنید.'
    ],
    instructionsEn: [
      'Hold dumbbell vertically at chest level and squat deeply.'
    ],
    tipsFa: ['عالی برای حفظ بالاتنه کاملاً عمودی.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-squat',
    nameEn: 'Bodyweight Air Squat',
    nameFa: 'اسکوات با وزن بدن (ایر اسکوات)',
    category: 'legs',
    targetMuscleEn: 'Quadriceps & Glutes',
    targetMuscleFa: 'چهارسر ران و باسن',
    secondaryMusclesFa: ['همسترینگ'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-squat-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-squat-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-squat-side.gif',
    instructionsFa: [
      'پاها به عرض شانه و اسکوات با وزن بدن تا زاویه ۹۰ درجه.'
    ],
    instructionsEn: [
      'Perform standard squats with bodyweight.'
    ],
    tipsFa: ['مناسب برای گرم کردن و اصلاح فرم حرکتی.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-bulgarian-split-squat',
    nameEn: 'Bulgarian Split Squat',
    nameFa: 'اسکوات بلغاری تک‌پا',
    category: 'legs',
    targetMuscleEn: 'Glutes & Quadriceps',
    targetMuscleFa: 'فرم‌دهی باسن (سرینی) و چهارسر تک‌پا',
    secondaryMusclesFa: ['همسترینگ', 'تعادل'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/male-bodyweight-bulgarian-split-squat-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-bulgarian-split-squat-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-bulgarian-split-squat-side.gif',
    instructionsFa: [
      'یک پا را روی نیمکت پشت سر بگذارید و با پای جلو به سمت پایین بنشینید.'
    ],
    instructionsEn: [
      'Place rear foot on bench and lower until front thigh is parallel.'
    ],
    tipsFa: ['فوق‌العاده برای رفع عدم تقارن عضلانی پاها.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-forward-lunge',
    nameEn: 'Bodyweight Forward Lunge',
    nameFa: 'لانج به جلو (قیچی با وزن بدن)',
    category: 'legs',
    targetMuscleEn: 'Quadriceps, Glutes & Hamstrings',
    targetMuscleFa: 'چهارسر، باسن و همسترینگ',
    secondaryMusclesFa: ['ساق پا'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-bodyweight-forward-lunge-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-forward-lunge-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-forward-lunge-side.gif',
    instructionsFa: [
      'یک گام بلند به جلو بردارید و هر دو زانو را ۹۰ درجه خم کنید.'
    ],
    instructionsEn: [
      'Step forward into a deep lunge and push back to start.'
    ],
    tipsFa: ['زانوی جلو از نوک پنجه پا جلوتر نرود.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-glute-bridge',
    nameEn: 'Glute Bridge',
    nameFa: 'پل باسن روی زمین',
    category: 'legs',
    targetMuscleEn: 'Gluteus Maximus',
    targetMuscleFa: 'عضلات سرینی بزرگ و همسترینگ',
    secondaryMusclesFa: ['فیله کمر'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-glute-bridge-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-glute-bridge-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-glute-bridge-side.gif',
    instructionsFa: [
      'به پشت بخوابید، زانوها خم و باسن را با فشار به سقف بالا بیاورید.'
    ],
    instructionsEn: [
      'Lie on back with knees bent and drive hips upward.'
    ],
    tipsFa: ['در بالاترین نقطه ۲ ثانیه انقباض باسن را حفظ کنید.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-barbell-calve-raise',
    nameEn: 'Barbell Calf Raise',
    nameFa: 'ساق پا ایستاده با هالتر',
    category: 'legs',
    targetMuscleEn: 'Gastrocnemius & Soleus',
    targetMuscleFa: 'دوقلوی ساق پا',
    secondaryMusclesFa: ['مچ پا'],
    equipmentEn: 'Barbell',
    equipmentFa: 'هالتر',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-barbell-calve-raise-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-calve-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-calve-raise-side.gif',
    instructionsFa: [
      'هالتر را روی دوش گذاشته و روی پنجه پاها بالا بیایید.'
    ],
    instructionsEn: [
      'Elevate on toes holding barbell.'
    ],
    tipsFa: ['کشش کامل در پایین و انقباض در بالا.'],
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-calf-raise',
    nameEn: 'Dumbbell Calf Raise',
    nameFa: 'ساق پا ایستاده با دمبل',
    category: 'legs',
    targetMuscleEn: 'Gastrocnemius',
    targetMuscleFa: 'ساق پا با دمبل',
    secondaryMusclesFa: ['مچ پا'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-dumbbell-calf-raise-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-calf-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-calf-raise-side.gif',
    instructionsFa: [
      'دمبل‌ها را در دست گرفته و روی پنجه بالا بیایید.'
    ],
    instructionsEn: [
      'Stand on balls of feet holding dumbbells.'
    ],
    tipsFa: ['تکرارهای آهسته و بدون جهش.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-calve-raise',
    nameEn: 'Bodyweight Calf Raise',
    nameFa: 'ساق پا با وزن بدن',
    category: 'legs',
    targetMuscleEn: 'Calves',
    targetMuscleFa: 'عضلات ساق پا',
    secondaryMusclesFa: ['مچ'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-calve-raise-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-calve-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-calve-raise-side.gif',
    instructionsFa: [
      'روی پله یا زمین با وزن بدن روی پنجه بلند شوید.'
    ],
    instructionsEn: [
      'Perform calf raises with bodyweight.'
    ],
    tipsFa: ['مناسب برای تکرارهای بالا (۲۵ الی ۳۰ تکرار).'],
    defaultSets: 3,
    defaultReps: '20-25',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },

  // ==================== ABS & CORE ====================
  {
    id: 'mw-bodyweight-crunch',
    nameEn: 'Bodyweight Crunch',
    nameFa: 'کرانچ شکم روی زمین',
    category: 'abs',
    targetMuscleEn: 'Rectus Abdominis (Upper Abs)',
    targetMuscleFa: 'راست شکمی (بخش بالایی شکم)',
    secondaryMusclesFa: ['مورب شکمی'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'مبتدی',
    gifUrl: '/musclewiki-gifs/male-bodyweight-crunch-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-crunch-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-crunch-side.gif',
    instructionsFa: [
      'روی زمین بخوابید، زانوها خم و دست‌ها پشت سر یا روی سینه.',
      'با انقباض شکم کتف‌ها را از زمین بلند کنید و در بالا بازدم کنید.'
    ],
    instructionsEn: [
      'Lie flat with knees bent, curl shoulders towards hips contracting abs.'
    ],
    tipsFa: ['به گردن فشار نیاورید و سر را نکشید.'],
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-leg-raises',
    nameEn: 'Lying Leg Raises',
    nameFa: 'زیر شکم خوابیده (بالا آوردن پاها)',
    category: 'abs',
    targetMuscleEn: 'Lower Abs & Hip Flexors',
    targetMuscleFa: 'بخش پایینی راست شکمی (زیر شکم)',
    secondaryMusclesFa: ['خم‌کننده‌های ران'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-bodyweight-leg-raises-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-leg-raises-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-leg-raises-side.gif',
    instructionsFa: [
      'روی زمین دراز بکشید، پاها صاف و آرام تا زاویه ۹۰ درجه بالا بیاورید.'
    ],
    instructionsEn: [
      'Lie flat and raise legs upward keeping lower back pressed to floor.'
    ],
    tipsFa: ['گودی کمر در تمام طول حرکت باید به زمین چسبیده باشد.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bodyweight-forearm-plank',
    nameEn: 'Forearm Plank',
    nameFa: 'پلانک ساعد روی زمین',
    category: 'abs',
    targetMuscleEn: 'Transverse Abdominis & Core',
    targetMuscleFa: 'عضله عرضی شکم و کل کمربند تنه',
    secondaryMusclesFa: ['سرشانه', 'فیله کمر', 'باسن'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-bodyweight-forearm-plank-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-bodyweight-forarm-plank-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-bodyweight-forarm-plank-side.gif',
    instructionsFa: [
      'روی ساعدها و پنجه پاها قرار بگیرید و بدن را مانند یک تخته چوب صاف نگه دارید.'
    ],
    instructionsEn: [
      'Hold body straight in plank position on forearms.'
    ],
    tipsFa: ['تنفس منظم را فراموش نکنید و باسن را بیش از حد بالا یا پایین نبرید.'],
    defaultSets: 3,
    defaultReps: '45-60 ثانیه',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-russian-twist',
    nameEn: 'Dumbbell Russian Twist',
    nameFa: 'چرخش روسی با دمبل (مورب شکمی)',
    category: 'abs',
    targetMuscleEn: 'Obliques & Core Rotation',
    targetMuscleFa: 'عضلات مورب شکمی (پهلوها) و چرخش تنه',
    secondaryMusclesFa: ['راست شکمی'],
    equipmentEn: 'Dumbbell',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/musclewiki-gifs/male-dumbbell-russian-twist-front.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-russian-twist-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-russian-twist-side.gif',
    instructionsFa: [
      'روی زمین بنشینید، تنه را ۴۵ درجه عقب ببرید و دمبل را به چپ و راست بچرخانید.'
    ],
    instructionsEn: [
      'Lean torso back and twist dumbbell from side to side.'
    ],
    tipsFa: ['چرخش باید از عضلات شکم و پهلو باشد نه صرفاً دست‌ها.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-elevated-pike-press',
    nameEn: 'Elevated Pike Press',
    nameFa: 'پرس پایک پا روی بلندی',
    category: 'shoulders',
    targetMuscleEn: 'Anterior Deltoids & Upper Chest',
    targetMuscleFa: 'سرشانه جلویی و عضلات بالایی سینه',
    secondaryMusclesFa: ['پشت بازو', 'شکم'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/Elevated Pike Press.gif',
    sideGifUrl: '/musclewiki-gifs/Elevated Pike Press Side.gif',
    femaleGifUrl: '/musclewiki-gifs/Elevated Pike Press Side.gif',
    instructionsFa: [
      'پاها را روی نیمکت یا بلندی بگذارید و تنه را به شکل V وارونه خم کنید و پرس بزنید.'
    ],
    instructionsEn: [
      'Feet elevated on bench, torso inverted in V shape, press head towards floor.'
    ],
    tipsFa: ['عالی برای تقویت پرس بالاتنه با وزن بدن.'],
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-elevated-pike-shrug',
    nameEn: 'Elevated Pike Shoulder Shrug',
    nameFa: 'شراگ پایک پا روی بلندی',
    category: 'shoulders',
    targetMuscleEn: 'Serratus Anterior & Trapezius',
    targetMuscleFa: 'عضله دندانه‌ای قدامی و کول',
    secondaryMusclesFa: ['سرشانه'],
    equipmentEn: 'Bodyweight',
    equipmentFa: 'وزن بدن',
    difficultyFa: 'پیشرفته',
    gifUrl: '/musclewiki-gifs/Elevated Pike Shoulder Shrug.gif',
    sideGifUrl: '/musclewiki-gifs/Elevated Pike Shoulder Shrug Side.gif',
    femaleGifUrl: '/musclewiki-gifs/Elevated Pike Shoulder Shrug Side.gif',
    instructionsFa: [
      'در حالت پایک شانه را بالا و پایین کنید بدون خم کردن آرنج‌ها.'
    ],
    instructionsEn: [
      'In elevated pike position, shrug shoulder blades without bending elbows.'
    ],
    tipsFa: ['تقویت ثبات کتف و سلامت مفصل شانه.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },

  // ==================== ROUTINE SPECIFIC & COMPREHENSIVE MOVEMENTS ====================
  {
    id: 'mw-ez-bar-preacher-curl',
    nameEn: 'EZ Bar Preacher Curl',
    nameFa: 'جلو بازو هالتر لاری',
    category: 'biceps',
    targetMuscleEn: 'Biceps Brachii (Short Head & Brachialis)',
    targetMuscleFa: 'جلو بازو لاری (پیک دو سر بازویی و براکیالیس)',
    secondaryMusclesFa: ['ساعد', 'براکیورادیالیس'],
    equipmentEn: 'EZ Bar & Preacher Bench',
    equipmentFa: 'هالتر EZ و میز لاری',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/EZ_Bar_Preacher_Curl.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    instructionsFa: [
      'روی صندلی میز لاری بنشینید و زیربغل و پشت بازوها را کاملاً روی پد شیب‌دار فیکس کنید.',
      'هالتر EZ را با دستانی با عرض شانه بگیرید.',
      'با انقباض شدید عضلات دو سر بازویی، میله را تا نزدیک چانه بالا بکشید.',
      'در بالاترین نقطه ۱ ثانیه اوج انقباض را حفظ کرده و سپس با کنترل ۳ ثانیه‌ای میله را پایین بیاورید.',
      'در پایین‌ترین نقطه آرنج‌ها را به طور کامل قفل نکنید تا فشار از روی عضله برداشته نشود.'
    ],
    instructionsEn: [
      'Sit at preacher bench with upper arms flat against pad.',
      'Grip the EZ-bar with shoulder-width underhand grip.',
      'Curl the bar upwards contracting biceps firmly.',
      'Lower under strict control without locking elbows completely at the bottom.'
    ],
    tipsFa: [
      'میز لاری تقلب و تکان دادن تنه را به صفر می‌رساند، بنابراین از وزنه‌های معقول استفاده کنید.',
      'هرگز در انتهای دامنه دست را رها نکنید تا به تاندون آرنج آسیب نرسد.'
    ],
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-cable-bicep-curl',
    nameEn: 'Cable Bicep Curl',
    nameFa: 'جلو بازو سیم‌کش ایستاده',
    category: 'biceps',
    targetMuscleEn: 'Biceps Brachii (Constant Tension)',
    targetMuscleFa: 'جلو بازو با تنش مداوم سیم‌کش',
    secondaryMusclesFa: ['براکیالیس', 'ساعد'],
    equipmentEn: 'Cable Machine',
    equipmentFa: 'دستگاه سیم‌کش',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Cable_Bicep_Curl.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-curl-side_NN1ZFmi.gif',
    instructionsFa: [
      'قرقره سیم‌کش را در پایین‌ترین نقطه قرار داده و میله صاف یا EZ را متصل کنید.',
      'صاف بایستید، آرنج‌ها را به پهلو بچسبانید و میله را بالا بکشید.',
      'در بالای حرکت انقباض کامل را حس کرده و با کنترل سیم را به حالت اول بازگردانید.'
    ],
    instructionsEn: [
      'Stand facing low cable pulley with straight bar attachment.',
      'Curl the handle upwards keeping elbows stationary.',
      'Squeeze biceps at the top and lower slowly against cable tension.'
    ],
    tipsFa: ['تنش پیوسته کابل در تمام طول دامنه حرکت وجود دارد.'],
    defaultSets: 3,
    defaultReps: '12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-bench-press',
    nameEn: 'Dumbbell Bench Press',
    nameFa: 'پرس سینه دمبل چرخشی / تخت',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major',
    targetMuscleFa: 'عضلات سینه (بخش میانی و داخلی)',
    secondaryMusclesFa: ['سرشانه جلویی', 'پشت بازو'],
    equipmentEn: 'Dumbbell & Flat Bench',
    equipmentFa: 'دمبل و نیمکت تخت',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Dumbbell_Bench_Press.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    instructionsFa: [
      'روی نیمکت تخت دراز بکشید و دمبل‌ها را کنار سینه بگیرید.',
      'هنگام بالا بردن دمبل‌ها، مچ دست را بچرخانید طوری که در بالای حرکت کف دست‌ها روبروی هم قرار گیرند.',
      'در بالاترین نقطه ۱ ثانیه انقباض ایجاد کرده و سپس به آرامی به حالت اول برگردید.'
    ],
    instructionsEn: [
      'Lie flat on bench holding dumbbells at chest level.',
      'Press dumbbells upwards rotating wrists so palms face each other at top.',
      'Squeeze chest and lower slowly with control.'
    ],
    tipsFa: ['کتف‌ها را عقب نگه دارید', 'تمرکز روی انقباض بخش داخلی سینه'],
    defaultSets: 3,
    defaultReps: '10',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-incline-chest-press',
    nameEn: 'Incline Chest Press',
    nameFa: 'پرس بالا سینه دستگاه / دمبل',
    category: 'chest',
    targetMuscleEn: 'Upper Pectorals (Clavicular Head)',
    targetMuscleFa: 'بخش بالایی عضلات سینه (بالاسینه)',
    secondaryMusclesFa: ['دلتوئید قدامی', 'سه سر بازویی'],
    equipmentEn: 'Incline Machine / Dumbbell',
    equipmentFa: 'دستگاه پرس بالا سینه / دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Incline_Chest_Press.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-incline-bench-press-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-incline-bench-press-side.gif',
    instructionsFa: [
      'صندلی دستگاه یا شیب نیمکت را تنظیم کنید تا دسته‌ها هم‌سطح بالای سینه باشند.',
      'با بازدم وزنه را به سمت جلو و بالا پرس کنید.',
      'با کنترل و دم به حالت اولیه بازگردید.'
    ],
    instructionsEn: [
      'Set seat so handles align with upper chest.',
      'Press forward and upward contracting upper pectorals.',
      'Return with controlled tempo.'
    ],
    tipsFa: ['کمر را به پشتی دستگاه بچسبانید', 'آرنج‌ها را کاملا قفل نکنید'],
    defaultSets: 4,
    defaultReps: '8',
    defaultRestSeconds: 90,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-incline-dumbbell-fly',
    nameEn: 'Incline Dumbbell Fly',
    nameFa: 'قفسه بالا سینه دمبل',
    category: 'chest',
    targetMuscleEn: 'Upper Pectoral Stretch & Squeeze',
    targetMuscleFa: 'بخش بالایی سینه و کشش عضلانی قفسه',
    secondaryMusclesFa: ['دلتوئید قدامی'],
    equipmentEn: 'Dumbbells & Incline Bench',
    equipmentFa: 'دمبل و نیمکت شیب‌دار (۳۰ درجه)',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Incline_Dumbbell_Fly.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    instructionsFa: [
      'روی نیمکت شیب‌دار دراز بکشید و دمبل‌ها را بالای سینه بگیرید.',
      'با خم کوچک در آرنج‌ها، دست‌ها را به طرفین باز کنید تا کشش سینه را احساس کنید.',
      'با انقباض سینه دمبل‌ها را به نقطه شروع برگردانید.'
    ],
    instructionsEn: [
      'Lie on incline bench holding dumbbells overhead.',
      'With slight bend in elbows, lower weights out to sides feeling deep chest stretch.',
      'Bring dumbbells back together at top.'
    ],
    tipsFa: ['از سنگین کردن بیش از حد وزنه خودداری کنید', 'آرنج را کمی خم نگه دارید'],
    defaultSets: 3,
    defaultReps: '12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-dumbbell-pullover',
    nameEn: 'Dumbbell Pullover',
    nameFa: 'پلاور سینه دمبل',
    category: 'chest',
    targetMuscleEn: 'Serratus, Chest & Lat Expansion',
    targetMuscleFa: 'عضله سینه، زیر بغل و قفسه دنده (دندانه‌ای)',
    secondaryMusclesFa: ['زیربغل', 'سه سر بازویی'],
    equipmentEn: 'Dumbbell & Flat Bench',
    equipmentFa: 'دمبل و نیمکت',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Dumbbell_Pullover.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bench-press-side_giVNk12.gif',
    instructionsFa: [
      'کتف‌ها را روی نیمکت بگذارید و دمبل را با هر دو دست بالای سینه نگه دارید.',
      'با آرنج‌های نیمه‌خم وزنه را به آرامی به پشت سر هدایت کنید تا قفسه سینه منبسط شود.',
      'با انقباض سینه و زیربغل، وزنه را به بالای سینه برگردانید.'
    ],
    instructionsEn: [
      'Rest shoulders perpendicular on bench, holding dumbbell with both hands.',
      'Lower weight behind head in smooth arc feeling chest stretch.',
      'Pull dumbbell back over chest.'
    ],
    tipsFa: ['کشش عمیق ایجاد کنید', 'کمر را بیش از حد قوس ندهید'],
    defaultSets: 3,
    defaultReps: '10',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-chest-fly-machine',
    nameEn: 'Pec Deck Chest Fly',
    nameFa: 'قفسه سینه دستگاه پروانه / فلای',
    category: 'chest',
    targetMuscleEn: 'Pectoralis Major Isolation',
    targetMuscleFa: 'ایزوله عضلات سینه و خط وسط سینه',
    secondaryMusclesFa: ['سرشانه جلویی'],
    equipmentEn: 'Pec Deck Machine',
    equipmentFa: 'دستگاه پروانه / فلای سینه',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Chest_Fly.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-incline-chest-flys-side.gif',
    instructionsFa: [
      'روی صندلی دستگاه بنشینید و دسته‌ها را هم‌ارتفاع وسط سینه تنظیم کنید.',
      'با انقباض سینه، دسته‌ها را به سمت مرکز به هم نزدیک کنید.',
      'در اوج انقباض ۱ ثانیه مکث کرده و به آرامی باز شوید.'
    ],
    instructionsEn: [
      'Sit against backrest and grasp machine handles at chest level.',
      'Bring arms together in front of chest squeezing pecs.',
      'Open arms slowly to full stretch.'
    ],
    tipsFa: ['تمرکز روی نزدیک کردن بازوها به هم در جلو.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-leg-extension',
    nameEn: 'Leg Extension',
    nameFa: 'جلو پا دستگاه',
    category: 'legs',
    targetMuscleEn: 'Quadriceps Femoris',
    targetMuscleFa: 'عضله چهارسر ران (کوادریسپس)',
    secondaryMusclesFa: ['تاندون کشکک'],
    equipmentEn: 'Leg Extension Machine',
    equipmentFa: 'دستگاه جلو پا',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Leg_Extension.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    instructionsFa: [
      'روی دستگاه بنشینید و پد را روی مچ پاها تنظیم کنید.',
      'پاها را تا صاف شدن کامل زانوها بالا بیاورید و ۱ ثانیه مکث کنید.',
      'با کنترل کامل و بدون رها کردن وزنه، پاها را به نقطه شروع بازگردانید.'
    ],
    instructionsEn: [
      'Sit firmly on machine with pad positioned against lower shins.',
      'Extend legs upwards until knees are straight, squeeze quads at top.',
      'Lower weights with smooth control.'
    ],
    tipsFa: ['پشت کمر را کامل به صندلی بچسبانید', 'در بالا زانوها را تفکیک کنید'],
    defaultSets: 3,
    defaultReps: '12-10-8',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-lying-leg-curl',
    nameEn: 'Lying Leg Curl',
    nameFa: 'پشت پا خوابیده دستگاه',
    category: 'legs',
    targetMuscleEn: 'Hamstrings (Biceps Femoris)',
    targetMuscleFa: 'عضلات پشت پا (همسترینگ)',
    secondaryMusclesFa: ['ساق پا', 'سرینی'],
    equipmentEn: 'Lying Leg Curl Machine',
    equipmentFa: 'دستگاه پشت پا خوابیده',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Lying_Leg_Curl.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-highbar-squat-side_bU7Qudy.gif',
    instructionsFa: [
      'روی دستگاه به شکم دراز بکشید و پد را پشت مچ پاها قرار دهید.',
      'با انقباض همسترینگ، پد را به سمت باسن بالا بکشید.',
      'در نقطه اوج انقباض مکث کرده و به آرامی به حالت اولیه بازگردید.'
    ],
    instructionsEn: [
      'Lie face down on machine with roller pad against backs of ankles.',
      'Curl legs upwards towards glutes contracting hamstrings.',
      'Lower with controlled tempo.'
    ],
    tipsFa: ['لگن را در تمام طول حرکت به تخت دستگاه چسبیده نگه دارید.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-seated-calf-raise',
    nameEn: 'Seated Calf Raise',
    nameFa: 'ساق پا نشسته با دستگاه',
    category: 'legs',
    targetMuscleEn: 'Soleus Muscle',
    targetMuscleFa: 'عضله نعلی ساق پا (سولئوس)',
    secondaryMusclesFa: ['دوقلوی ساق'],
    equipmentEn: 'Seated Calf Machine',
    equipmentFa: 'دستگاه ساق پا نشسته',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Seated_Calf_Raise.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-calve-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-calve-raise-side.gif',
    instructionsFa: [
      'روی دستگاه بنشینید و پد را روی بالای زانوها فیکس کنید.',
      'پنجه پاها را روی لبه قرار داده و پاشنه‌ها را تا حداکثر ممکن بالا ببرید.',
      'در بالا ۲ ثانیه مکث کنید و سپس به آرامی پاشنه‌ها را پایین بیاورید تا کشش کامل حس شود.'
    ],
    instructionsEn: [
      'Sit on machine with pad over lower thighs and balls of feet on platform.',
      'Raise heels as high as possible contracting soleus muscles.',
      'Lower heels below platform for full stretch.'
    ],
    tipsFa: ['انجام با تکرارهای کنترل شده و مکث در بالا و پایین.'],
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-triceps-pushdown',
    nameEn: 'Triceps Pushdown',
    nameFa: 'پشت بازو سیم‌کش با میله صاف',
    category: 'triceps',
    targetMuscleEn: 'Lateral & Medial Triceps Heads',
    targetMuscleFa: 'سر جانبی و میانی پشت بازو',
    secondaryMusclesFa: ['ساعد'],
    equipmentEn: 'Cable Machine (Straight Bar)',
    equipmentFa: 'دستگاه سیم‌کش و دسته صاف',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Triceps_Pushdown.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    instructionsFa: [
      'مقابل دستگاه سیم‌کش بایستید و میله را با فاصله‌ای به عرض شانه بگیرید.',
      'آرنج‌ها را کنار پهلوها قفل کنید و میله را به سمت پایین فشار دهید.',
      'در پایین دست‌ها را صاف کرده و پشت بازو را کاملاً منقبض کنید.'
    ],
    instructionsEn: [
      'Stand facing cable station holding straight bar at chest height.',
      'Keep elbows tight to ribs and push bar down until arms are fully extended.',
      'Squeeze triceps and return slowly.'
    ],
    tipsFa: ['از جلو و عقب بردن آرنج‌ها خودداری کنید.'],
    defaultSets: 3,
    defaultReps: '12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-v-bar-triceps-pushdown',
    nameEn: 'V-Bar Triceps Pushdown',
    nameFa: 'پشت بازو سیم‌کش دسته V (طناب)',
    category: 'triceps',
    targetMuscleEn: 'Lateral Triceps Head',
    targetMuscleFa: 'سر خارجی پشت بازو (تفکیک و نعل پشت بازو)',
    secondaryMusclesFa: ['سر طویل پشت بازو'],
    equipmentEn: 'Cable Machine (V-Bar / Rope)',
    equipmentFa: 'دستگاه سیم‌کش و دسته V یا طناب',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/V_Bar_Triceps_Pushdown.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-skullcrusher-side_B7Z6225.gif',
    instructionsFa: [
      'دسته V یا طناب را بگیرید و آرنج‌ها را کنار بدن ثابت کنید.',
      'دسته را به سمت پایین و اندکی به طرفین باز کنید تا پشت بازو به اوج انقباض برسد.',
      'به آرامی به ارتفاع سینه بازگردید.'
    ],
    instructionsEn: [
      'Attach V-bar or rope, grip handles and pin elbows to sides.',
      'Push downwards spreading handles slightly at the bottom for maximum contraction.',
      'Control return to starting height.'
    ],
    tipsFa: ['در انتهای دامنه انقباض ایزومتریک ۲ ثانیه‌ای ایجاد کنید.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-cable-front-raise',
    nameEn: 'Cable Front Raise',
    nameFa: 'نشر از جلو سیم‌کش',
    category: 'shoulders',
    targetMuscleEn: 'Anterior Deltoid',
    targetMuscleFa: 'سرشانه جلویی (دلتوئید قدامی)',
    secondaryMusclesFa: ['کول بالایی', 'بالاسینه'],
    equipmentEn: 'Cable Machine',
    equipmentFa: 'دستگاه سیم‌کش',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Cable_Front_Raise.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    instructionsFa: [
      'پشت به دستگاه سیم‌کش بایستید و کابل را از بین پاها یا کنار ران به دست بگیرید.',
      'دست‌ها را تا ارتفاع شانه و چانه به سمت جلو بالا بیاورید.',
      'در نقطه اوج ۱ ثانیه مکث کرده و به آرامی پایین بیاورید.'
    ],
    instructionsEn: [
      'Stand facing away from low pulley holding attachment at thighs.',
      'Raise straight arms forward up to eye level.',
      'Pause and lower smoothly under cable tension.'
    ],
    tipsFa: ['از تاب دادن کمر خودداری کنید.'],
    defaultSets: 3,
    defaultReps: '12',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-machine-shoulder-press',
    nameEn: 'Machine Shoulder Press',
    nameFa: 'سرشانه دستگاه (پرس سرشانه نشسته)',
    category: 'shoulders',
    targetMuscleEn: 'Deltoid Muscle Complex',
    targetMuscleFa: 'عضلات سرشانه جلویی و میانی',
    secondaryMusclesFa: ['سه سر بازویی', 'کول'],
    equipmentEn: 'Shoulder Press Machine',
    equipmentFa: 'دستگاه پرس سرشانه',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Machine_Shoulder_Press.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-seated-overhead-press-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-seated-overhead-press-side.gif',
    instructionsFa: [
      'صندلی دستگاه را طوری تنظیم کنید که دسته‌ها در ارتفاع شانه قرار گیرند.',
      'دسته‌ها را با تنفس بازدم به سمت بالا پرس کنید.',
      'بدون قفل کردن کامل آرنج‌ها در بالا، با کنترل به حالت اول بازگردید.'
    ],
    instructionsEn: [
      'Adjust seat height so handles sit level with shoulders.',
      'Press handles overhead smoothly extending arms.',
      'Lower handles under control to ear level.'
    ],
    tipsFa: ['پشت و سر را به پشتی صندلی بچسبانید.'],
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-bent-over-rear-delt-fly',
    nameEn: 'Bent Over Rear Delt Fly',
    nameFa: 'نشر خم دمبل (پشت سرشانه)',
    category: 'shoulders',
    targetMuscleEn: 'Posterior Deltoid',
    targetMuscleFa: 'دلتوئید خلفی (پشت سرشانه)',
    secondaryMusclesFa: ['لوزی‌شکل', 'کول میانی'],
    equipmentEn: 'Dumbbells',
    equipmentFa: 'دمبل',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Bent_Over_Rear_Delt_Fly.gif',
    sideGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-dumbbell-lateral-raise-side.gif',
    instructionsFa: [
      'از مفصل ران به جلو خم شوید تا بالاتنه موازی زمین شود.',
      'دمبل‌ها را با آرنج‌های کمی خمیده به طرفین بالا بکشید.',
      'در اوج انقباض پشت سرشانه را فشرده کرده و پایین بیاورید.'
    ],
    instructionsEn: [
      'Hinge forward from hips with flat back until torso is near parallel.',
      'Raise dumbbells out to sides squeezing rear delts.',
      'Lower weights smoothly.'
    ],
    tipsFa: ['از حرکات پرتابی پرهیز کنید و تمرکز را روی پشت شانه بگذارید.'],
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-lat-pulldown',
    nameEn: 'Lat Pulldown',
    nameFa: 'لت زیر بغل سیم‌کش (کشش عمودی)',
    category: 'back',
    targetMuscleEn: 'Latissimus Dorsi (Lats)',
    targetMuscleFa: 'عضلات زیربغل (لت - پهنای پشت)',
    secondaryMusclesFa: ['جلو بازو', 'گرد بزرگ', 'لوزی‌شکل'],
    equipmentEn: 'Lat Pulldown Machine',
    equipmentFa: 'دستگاه زیربغل سیم‌کش (لت)',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Lat_Pulldown.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    instructionsFa: [
      'میله لت را با فاصله‌ای بیشتر از عرض شانه بگیرید و زیر پد زانو بنشینید.',
      'سینه را بالا داده و میله را تا بالای استخوان جناغ سینه به پایین بکشید.',
      'در پایین کتف‌ها را جمع کرده و با کنترل به بالا برگردید تا کشش لت ایجاد شود.'
    ],
    instructionsEn: [
      'Grip wide bar with overhand grip and sit with thighs secured under pads.',
      'Pull bar down towards upper chest arching chest slightly.',
      'Squeeze shoulder blades and control the upward release.'
    ],
    tipsFa: ['از متمایل شدن بیش از حد به عقب خودداری کنید.'],
    defaultSets: 4,
    defaultReps: '8-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-reverse-grip-lat-pulldown',
    nameEn: 'Reverse Grip Lat Pulldown',
    nameFa: 'لت زیر بغل دست برعکس (مچ برعکس)',
    category: 'back',
    targetMuscleEn: 'Lower Lats & Biceps',
    targetMuscleFa: 'بخش پایینی زیربغل و تقویت جلو بازو',
    secondaryMusclesFa: ['جلو بازو', 'لوزی‌شکل'],
    equipmentEn: 'Lat Pulldown Machine',
    equipmentFa: 'دستگاه زیربغل سیم‌کش',
    difficultyFa: 'متوسط',
    gifUrl: '/exercises/Reverse_Grip_Lat_Pulldown.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-bent-over-row-side.gif',
    instructionsFa: [
      'میله را به اندازه عرض شانه با کف دست‌های رو به صورت (آندرهند) بگیرید.',
      'میله را به سمت سینه بکشید و انقباض عمیق لت را در پایین حس کنید.',
      'به آرامی به بالا بازگردید.'
    ],
    instructionsEn: [
      'Grip bar shoulder-width with underhand (supinated) grip.',
      'Pull down to mid-chest focusing on lower lat contraction.',
      'Extend arms fully on the way up.'
    ],
    tipsFa: ['کشش فوق‌العاده در بخش پایینی لت و درگیری بیشتر بازو.'],
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    source: 'MuscleWiki API'
  },
  {
    id: 'mw-back-extension',
    nameEn: 'Back Hyperextension',
    nameFa: 'فیله کمر (هایپراکستنشن)',
    category: 'back',
    targetMuscleEn: 'Erector Spinae & Lower Back',
    targetMuscleFa: 'راست‌کننده ستون فقرات (فیله کمر)',
    secondaryMusclesFa: ['همسترینگ', 'عضلات باسن'],
    equipmentEn: 'Hyperextension Bench',
    equipmentFa: 'میز فیله کمر (مدرج / ۴۵ درجه)',
    difficultyFa: 'مبتدی',
    gifUrl: '/exercises/Back_Extension.gif',
    sideGifUrl: '/musclewiki-gifs/male-barbell-deadlift-side.gif',
    femaleGifUrl: '/musclewiki-gifs/male-barbell-deadlift-side.gif',
    instructionsFa: [
      'روی نیمکت هایپراکستنشن قرار بگیرید و پاشنه‌ها را پشت پد قفل کنید.',
      'از کمر به سمت پایین خم شوید و سپس با انقباض فیله کمر بدن را تا امتداد مستقیم بالا بیاورید.',
      'در بالا بیش از حد قوس به کمر ندهید.'
    ],
    instructionsEn: [
      'Position yourself on Roman chair with hips supported and ankles locked.',
      'Hinge at hips to lower upper body, then raise torso until inline with legs.',
      'Pause briefly and avoid hyperextending beyond neutral spine.'
    ],
    tipsFa: ['حرکت را آرام و بدون ضربه زدن انجام دهید.'],
    defaultSets: 3,
    defaultReps: '15',
    defaultRestSeconds: 60,
    source: 'MuscleWiki API'
  }
];

/**
 * High-accuracy synchronous matcher that instantly resolves the best MuscleWikiExercise
 * for any Exercise item or query string, avoiding flashes of unrelated exercises.
 */
export function findBestMuscleWikiExercise(
  exerciseOrQuery: any,
  preferredCategory?: string
): MuscleWikiExercise {
  if (!exerciseOrQuery) {
    return MUSCLEWIKI_EXERCISES_DATABASE[0];
  }

  // Already a MuscleWikiExercise
  if (typeof exerciseOrQuery === 'object' && exerciseOrQuery.source === 'MuscleWiki API' && exerciseOrQuery.id) {
    const existing = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === exerciseOrQuery.id);
    if (existing) return existing;
    return exerciseOrQuery as MuscleWikiExercise;
  }

  const nameEn = typeof exerciseOrQuery === 'object' ? (exerciseOrQuery.nameEn || '') : String(exerciseOrQuery);
  const nameFa = typeof exerciseOrQuery === 'object' ? (exerciseOrQuery.nameFa || '') : String(exerciseOrQuery);
  const exId = typeof exerciseOrQuery === 'object' ? (exerciseOrQuery.id || '') : '';
  const animType = typeof exerciseOrQuery === 'object' ? (exerciseOrQuery.animationType || '') : '';
  const category = (typeof exerciseOrQuery === 'object' ? exerciseOrQuery.category : preferredCategory) || '';

  const normalize = (str: string): string => {
    return String(str || '')
      .toLowerCase()
      .replace(/[\u200c\u200b\u200d\u200e\u200f]/g, ' ')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[آأإ]/g, 'ا')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normEn = normalize(nameEn);
  const normFa = normalize(nameFa);
  const normAnim = normalize(animType);
  const fullText = `${normEn} ${normFa} ${normAnim} ${normalize(exId)}`.trim();

  // 1. Direct ID / Exact Name Match
  const directMatch = MUSCLEWIKI_EXERCISES_DATABASE.find(e => {
    if (exId && (e.id === exId || e.id === `mw-${exId}`)) return true;
    const eNormEn = normalize(e.nameEn);
    const eNormFa = normalize(e.nameFa);
    if (normEn && (eNormEn === normEn || e.nameEn.replace(/_/g, ' ') === nameEn.replace(/_/g, ' '))) return true;
    if (normFa && eNormFa === normFa) return true;
    return false;
  });
  if (directMatch) return directMatch;

  // 2. High-Priority Keyword Rules (Precision Matching)
  // Preacher / Scott curl / لاری
  if (fullText.includes('لاری') || fullText.includes('preacher') || fullText.includes('scott') || fullText.includes('lary')) {
    const preacher不易 = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-ez-bar-preacher-curl');
    if (preacher不易) return preacher不易;
  }

  // Pullover / پلاور
  if (fullText.includes('پلاور') || fullText.includes('pullover')) {
    const pullover = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-pullover');
    if (pullover) return pullover;
  }

  // Cable Bicep Curl / جلو بازو سیمکش
  if ((fullText.includes('سیم') || fullText.includes('cable')) && (fullText.includes('جلو بازو') || fullText.includes('bicep') || fullText.includes('curl') || fullText.includes('بازو'))) {
    const cableCurlpytest = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-cable-bicep-curl');
    if (cableCurlpytest) return cableCurlpytest;
  }

  // Hammer curl / چکشی
  if (fullText.includes('چکشی') || fullText.includes('hammer')) {
    const hammer = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-hammer-curl');
    if (hammer) return hammer;
  }

  // Barbell Bicep Curl / جلو بازو هالتر
  if ((fullText.includes('هالتر') || fullText.includes('barbell')) && (fullText.includes('جلو بازو') || fullText.includes('bicep curl'))) {
    if (fullText.includes('reverse') || fullText.includes('برعکس')) {
      const rev = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-reverse-curl');
      if (rev) return rev;
    }
    const bbCurl = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-curl');
    if (bbCurl) return bbCurl;
  }

  // Dumbbell Bicep Curl / جلو بازو دمبل
  if ((fullText.includes('دمبل') || fullText.includes('dumbbell')) && (fullText.includes('جلو بازو') || fullText.includes('bicep curl'))) {
    const dbCurl = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-curl');
    if (dbCurl) return dbCurl;
  }

  // Leg Extension / جلو پا دستگاه
  if (fullText.includes('جلو پا') || fullText.includes('leg extension') || (fullText.includes('extension') && (category === 'legs' || fullText.includes('پا') || fullText.includes('leg')))) {
    const legExt = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-leg-extension');
    if (legExt) return legExt;
  }

  // Lying Leg Curl / پشت پا
  if (fullText.includes('پشت پا') || fullText.includes('leg curl') || fullText.includes('lying leg')) {
    const legCurl = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-lying-leg-curl');
    if (legCurl) return legCurl;
  }

  // Squats / اسکوات / اسکات
  if (fullText.includes('اسکوات') || fullText.includes('اسکات') || fullText.includes('squat')) {
    if (fullText.includes('goblet') || fullText.includes('گابلت')) {
      const goblet = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-goblet-squat');
      if (goblet) return goblet;
    }
    if (fullText.includes('bulgarian') || fullText.includes('بلغاری')) {
      const bulg = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-bodyweight-bulgarian-split-squat');
      if (bulg) return bulg;
    }
    if (fullText.includes('bodyweight') || fullText.includes('وزن بدن')) {
      const bwSquat有一种 = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-bodyweight-squat');
      if (bwSquat有一种) return bwSquat有一种;
    }
    const bbSquat = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-highbar-squat');
    if (bbSquat) return bbSquat;
  }

  // Seated Calf / ساق پا نشسته
  if (fullText.includes('ساق') || fullText.includes('calf') || fullText.includes('calve')) {
    if (fullText.includes('نشسته') || fullText.includes('seated')) {
      const seatedCalf = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-seated-calf-raise');
      if (seatedCalf) return seatedCalf;
    }
    if (fullText.includes('دمبل') || fullText.includes('dumbbell')) {
      const dbCalf = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-calf-raise');
      if (dbCalf) return dbCalf;
    }
    const stdCalf = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-standing-calve-raise');
    if (stdCalf) return stdCalf;
  }

  // Reverse Grip Lat Pulldown / لت دست برعکس
  if ((fullText.includes('برعکس') || fullText.includes('reverse')) && (fullText.split(/\s+/).includes('لت') || fullText.includes('lat') || fullText.includes('pulldown'))) {
    const revLat = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-reverse-grip-lat-pulldown');
    if (revLat) return revLat;
  }

  // Lat Pulldown / لت زیربغل
  if (fullText.includes('lat pulldown') || (fullText.includes('pulldown') && (category === 'back' || fullText.includes('زیربغل') || fullText.includes('پشت'))) || (fullText.split(/\s+/).includes('لت') && !fullText.includes('هالتر'))) {
    const lat = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-lat-pulldown');
    if (lat) return lat;
  }

  // Back Extension / فیله کمر
  if (fullText.includes('فیله') || fullText.includes('hyperextension') || fullText.includes('back extension')) {
    const backExt = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-back-extension');
    if (backExt) return backExt;
  }

  // Skullcrusher / Lying Triceps Extension / پشت بازو هالتر خوابیده / فرانسوی
  if (fullText.includes('skullcrusher') || fullText.includes('اسکال') || fullText.includes('فرانسوی') || (fullText.includes('پشت بازو') && (fullText.includes('خوابیده') || fullText.includes('lying') || fullText.includes('هالتر')))) {
    const skull = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-skullcrusher');
    if (skull) return skull;
  }

  // Overhead Triceps Extension / پشت بازو پشت گردن
  if (fullText.includes('overhead') && (fullText.includes('tricep') || fullText.includes('پشت بازو'))) {
    const ovhTricep = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-overhead-tricep-extension');
    if (ovhTricep) return ovhTricep;
  }

  // V-Bar / Triceps Pushdown / پشت بازو سیمکش
  if (fullText.includes('پشت بازو') || fullText.includes('tricep') || fullText.includes('triceps')) {
    if (fullText.includes('v') || fullText.includes('طناب') || fullText.includes('v bar')) {
      const vbar = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-v-bar-triceps-pushdown');
      if (vbar) return vbar;
    }
    if (fullText.includes('سیم') || fullText.includes('cable') || fullText.includes('pushdown')) {
      const pushdown = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-triceps-pushdown');
      if (pushdown) return pushdown;
    }
  }

  // Incline Chest Press / بالاسینه دستگاه
  if (fullText.includes('بالاسینه') || fullText.includes('بالا سینه') || fullText.includes('incline')) {
    if (fullText.includes('fly') || fullText.includes('قفسه')) {
      const incFly = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-incline-dumbbell-fly');
      if (incFly) return incFly;
    }
    if (fullText.includes('دستگاه') || fullText.includes('machine') || fullText.includes('دمبل') || fullText.includes('press')) {
      const incPress = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-incline-chest-press');
      if (incPress) return incPress;
    }
  }

  // Pec Deck / Chest Fly / قفسه سینه دستگاه
  if (fullText.includes('قفسه') || fullText.includes('پروانه') || fullText.includes('fly') || fullText.includes('pec deck')) {
    if (fullText.includes('بالا') || fullText.includes('incline')) {
      const incFly = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-incline-dumbbell-fly');
      if (incFly) return incFly;
    }
    const chestFly = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-chest-fly-machine');
    if (chestFly) return chestFly;
  }

  // Dumbbell Bench Press / پرس سینه دمبل
  if ((fullText.includes('سینه') || fullText.includes('bench')) && (fullText.includes('دمبل') || fullText.includes('چرخشی') || fullText.includes('dumbbell'))) {
    const dbBench = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-bench-press');
    if (dbBench) return dbBench;
  }

  // Barbell Bench Press / پرس سینه هالتر
  if ((fullText.includes('سینه') || fullText.includes('bench') || fullText.includes('chest')) && (fullText.includes('هالتر') || fullText.includes('barbell') || fullText.includes('press'))) {
    const bbBench = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-bench-press');
    if (bbBench) return bbBench;
  }

  // Bent Over Dumbbell Row / زیربغل تک دمبل خم
  if (fullText.includes('دمبل') && (fullText.includes('خم') || fullText.includes('اره') || fullText.includes('row') || fullText.includes('زیربغل'))) {
    const dbRow = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-row-unilateral');
    if (dbRow) return dbRow;
  }

  // Bent Over Barbell Row / زیربغل هالتر خم
  if ((fullText.includes('هالتر') || fullText.includes('barbell')) && (fullText.includes('خم') || fullText.includes('row') || fullText.includes('زیربغل'))) {
    const bbRow = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-barbell-bent-over-row');
    if (bbRow) return bbRow;
  }

  // Rear Delt / نشر خم
  if ((fullText.includes('نشر') && fullText.includes('خم')) || fullText.includes('rear delt')) {
    const rearDelt = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-bent-over-rear-delt-fly');
    if (rearDelt) return rearDelt;
  }

  // Front Raise / نشر جلو
  if (fullText.includes('front raise') || (fullText.includes('نشر') && (fullText.includes('جلو') || fullText.includes('سیم')))) {
    const frontRaise = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-cable-front-raise');
    if (frontRaise) return frontRaise;
  }

  // Lateral Raise / نشر جانب
  if (fullText.includes('lateral raise') || (fullText.includes('نشر') && (fullText.includes('جانب') || fullText.includes('بغل') || fullText.includes('طرفین')))) {
    const latRaise = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-lateral-raise');
    if (latRaise) return latRaise;
  }

  // Machine Shoulder Press / سرشانه دستگاه
  if ((fullText.includes('سرشانه') || fullText.includes('shoulder')) && (fullText.includes('دستگاه') || fullText.includes('machine'))) {
    const machShoulder = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-machine-shoulder-press');
    if (machShoulder) return machShoulder;
  }

  // Dumbbell Shoulder Press / سرشانه دمبل
  if ((fullText.includes('سرشانه') || fullText.includes('shoulder')) && (fullText.includes('دمبل') || fullText.includes('dumbbell'))) {
    const dbShoulder = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-dumbbell-seated-overhead-press');
    if (dbShoulder) return dbShoulder;
  }

  // Crunch / کرانچ شکم
  if (fullText.includes('کرانچ') || fullText.includes('crunch') || fullText.includes('دراز و نشست') || fullText.includes('situp')) {
    const crunch = MUSCLEWIKI_EXERCISES_DATABASE.find(e => e.id === 'mw-bodyweight-crunch');
    if (crunch) return crunch;
  }

  // 3. Multi-token weighted scoring
  let bestItem = MUSCLEWIKI_EXERCISES_DATABASE[0];
  let highestScore = -1;

  for (const item of MUSCLEWIKI_EXERCISES_DATABASE) {
    let score = 0;
    const itemNormEn = normalize(item.nameEn);
    const itemNormFa = normalize(item.nameFa);
    const itemNormMuscle = normalize(item.targetMuscleFa);
    const itemNormEq = normalize(item.equipmentFa);

    if (category && item.category === category) score += 30;

    if (normEn && (itemNormEn.includes(normEn) || normEn.includes(itemNormEn))) score += 70;
    if (normFa && (itemNormFa.includes(normFa) || normFa.includes(itemNormFa))) score += 70;

    const tokens = fullText.split(/\s+/).filter(t => t.length > 1);
    for (const t of tokens) {
      if (itemNormEn.includes(t)) score += 15;
      if (itemNormFa.includes(t)) score += 15;
      if (itemNormMuscle.includes(t)) score += 10;
      if (itemNormEq.includes(t)) score += 8;
    }

    if (score > highestScore) {
      highestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

