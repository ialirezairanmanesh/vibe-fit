import { RoutineDay, Exercise } from '../types';

export const INITIAL_ROUTINES: RoutineDay[] = [
  {
    id: 'day-1',
    titleFa: 'روز اول: سینه + جلو بازو + شکم',
    subtitleFa: 'تمرینات حجمی سینه، جلو بازو و عضلات شکم',
    targetMusclesFa: ['سینه', 'جلو بازو', 'شکم'],
    iconName: 'Dumbbell',
    exercises: [
      {
        id: 'ex-1-1',
        nameFa: 'پرس سینه دمبل چرخشی',
        nameEn: 'Dumbbell_Bench_Press',
        category: 'chest',
        targetMuscleFa: 'عضلات سینه (بخش میانی و داخلی)',
        equipmentFa: 'دمبل و نیمکت تخت',
        targetSets: 3,
        targetReps: '10',
        defaultRestSeconds: 90,
        instructionsFa: [
          'روی نیمکت تخت دراز بکشید و دمبل‌ها را کنار سینه بگیرید.',
          'هنگام بالا بردن دمبل‌ها، مچ دست را بچرخانید طوری که در بالای حرکت کف دست‌ها روبروی هم قرار گیرند.',
          'در بالاترین نقطه ۱ ثانیه انقباض ایجاد کرده و سپس به آرامی به حالت اول برگردید.'
        ],
        tipsFa: ['کتف‌ها را عقب نگه دارید', 'تمرکز روی انقباض بخش داخلی سینه'],
        animationType: 'dumbbell_press'
      },
      {
        id: 'ex-1-2',
        nameFa: 'پرس بالا سینه دستگاه / دمبل',
        nameEn: 'Incline_Chest_Press',
        category: 'chest',
        targetMuscleFa: 'بخش بالایی عضلات سینه (پکتورالیس ماژور بالا)',
        equipmentFa: 'دستگاه پرس بالا سینه / دمبل',
        targetSets: 4,
        targetReps: '8',
        defaultRestSeconds: 90,
        instructionsFa: [
          'صندلی دستگاه یا شیب نیمکت را تنظیم کنید تا دسته‌ها هم‌سطح بالای سینه باشند.',
          'با بازدم وزنه را به سمت جلو و بالا پرس کنید.',
          'با کنترل و دم به حالت اولیه بازگردید.'
        ],
        tipsFa: ['کمر را به پشتی دستگاه بچسبانید', 'آرنج‌ها را کاملا قفل نکنید'],
        animationType: 'incline_press'
      },
      {
        id: 'ex-1-3',
        nameFa: 'قفسه بالا سینه دمبل',
        nameEn: 'Incline_Dumbbell_Fly',
        category: 'chest',
        targetMuscleFa: 'بخش بالایی سینه و کشش عضلانی',
        equipmentFa: 'دمبل و نیمکت شیب‌دار (۳۰ درجه)',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 75,
        instructionsFa: [
          'روی نیمکت شیب‌دار دراز بکشید و دمبل‌ها را بالای سینه بگیرید.',
          'با خم کوچک در آرنج‌ها، دست‌ها را به طرفین باز کنید تا کشش سینه را احساس کنید.',
          'با انقباض سینه دمبل‌ها را به نقطه شروع برگردانید.'
        ],
        tipsFa: ['از سنگین کردن بیش از حد وزنه خودداری کنید', 'آرنج را کمی خم نگه دارید'],
        animationType: 'fly'
      },
      {
        id: 'ex-1-4',
        nameFa: 'پلاور سینه',
        nameEn: 'Dumbbell_Pullover',
        category: 'chest',
        targetMuscleFa: 'عضله سینه، زیر بغل و قفسه دنده',
        equipmentFa: 'دمبل / صفحه وزنه و نیمکت',
        targetSets: 3,
        targetReps: '10',
        defaultRestSeconds: 75,
        instructionsFa: [
          'کتف‌ها را روی نیمکت بگذارید و دمبل را بالای سینه نگه دارید.',
          'با آرنج‌های نیمه‌خم وزنه را به آرامی به پشت سر هدایت کنید.',
          'با انقباض سینه وزنه را به بالای سینه برگردانید.'
        ],
        tipsFa: ['کشش عمیق ایجاد کنید', 'کمر را بیش از حد قوس ندهید'],
        animationType: 'pullover'
      },
      {
        id: 'ex-1-5',
        nameFa: 'جلو بازو سیمکش',
        nameEn: 'Cable_Bicep_Curl',
        category: 'biceps',
        targetMuscleFa: 'عضله دو سر بازویی (بایسپس)',
        equipmentFa: 'دستگاه سیمکش و دسته صاف/ایزوله',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 60,
        instructionsFa: [
          'مقابل دستگاه سیمکش بایستید و دسته را با دو دست بگیرید.',
          'آرنج‌ها را کنار بدن ثابت نگه داشته و دسته را به سمت شانه بالا بکشید.',
          'در بالا انقباض ۱ ثانیه‌ای داشته باشید.'
        ],
        tipsFa: ['از تکان دادن بدن خودداری کنید', 'مچ دست‌ها صاف بماند'],
        animationType: 'bicep_curl'
      },
      {
        id: 'ex-1-6',
        nameFa: 'جلو بازو دمبل چکشی',
        nameEn: 'Dumbbell_Hammer_Curl',
        category: 'biceps',
        targetMuscleFa: 'عضله بازویی-زنداعلی (براکیالیس) و ساعد',
        equipmentFa: 'دمبل',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 60,
        instructionsFa: [
          'دمبل‌ها را به صورتی بگیرید که کف دست‌ها روبروی یکدیگر باشد.',
          'بدون حرکت دادن بازو، دمبل‌ها را تا سطح شانه بالا بیاورید.',
          'به آرامی به پایین هدایت کنید.'
        ],
        tipsFa: ['بدن را کاملا ثابت نگه دارید', 'تمرکز روی ضخامت بازو'],
        animationType: 'hammer_curl'
      },
      {
        id: 'ex-1-7',
        nameFa: 'جلو بازو هالتر لاری',
        nameEn: 'EZ_Bar_Preacher_Curl',
        category: 'biceps',
        targetMuscleFa: 'بخش پایینی و پیک جلو بازو',
        equipmentFa: 'هالتر EZ و میز لاری',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 75,
        instructionsFa: [
          'بازوها را روی پد میز لاری تکیه دهید.',
          'هالتر EZ را تا بالا بپیچید و در بالا مکث کنید.',
          'به آرامی و با کنترل کامل وزنه را پایین ببرید.'
        ],
        tipsFa: ['از قفل کردن کامل آرنج در پایین خودداری کنید', 'حرکت را تفکیکی انجام دهید'],
        animationType: 'preacher_curl'
      },
      {
        id: 'ex-1-8',
        nameFa: 'شکم کرانچ / دراز و نشست',
        nameEn: 'Crunch',
        category: 'abs',
        targetMuscleFa: 'عضلات راست شکمی (شش تکه)',
        equipmentFa: 'تشک ورزشی / نیمکت مدرج',
        targetSets: 3,
        targetReps: '15',
        defaultRestSeconds: 45,
        instructionsFa: [
          'روی زمین دراز بکشید، زانوها را خم کرده و پاها را روی زمین بگذارید.',
          'دست‌ها کنار سر یا روی سینه قرار گیرد.',
          'با جمع کردن عضلات شکم، تنه را به سمت زانوها بالا بیاورید و بازدم کنید.'
        ],
        tipsFa: ['گردن را فشار ندهید', 'تمرکز روی انقباض شکم'],
        animationType: 'crunch',
        isBodyweight: true
      }
    ]
  },
  {
    id: 'day-2',
    titleFa: 'روز دوم: پا + پشت بازو + ساق',
    subtitleFa: 'تمرینات قدرتی و حجمی عضلات پا، پشت بازو و ساق',
    targetMusclesFa: ['چهارسر ران', 'همسترینگ', 'پشت بازو', 'ساق پا'],
    iconName: 'Activity',
    exercises: [
      {
        id: 'ex-2-1',
        nameFa: 'جلو پا دستگاه',
        nameEn: 'Leg_Extension',
        category: 'legs',
        targetMuscleFa: 'عضله چهارسر ران (کوادریسپس)',
        equipmentFa: 'دستگاه جلو پا',
        targetSets: 3,
        targetReps: '12-10-8',
        defaultRestSeconds: 75,
        instructionsFa: [
          'روی دستگاه بنشینید و پد را روی مچ پا تنظیم کنید.',
          'ست اول: ۱۲ تکرار، ست دوم: ۱۰ تکرار، ست سوم: ۸ تکرار (با افزایش وزنه).',
          'پاها را تا صاف شدن کامل بالا بیاورید و ۱ ثانیه مکث کنید.'
        ],
        tipsFa: ['پشت کمر را کامل به صندلی بچسبانید', 'در بالا زانوها را تفکیک کنید'],
        animationType: 'leg_extension'
      },
      {
        id: 'ex-2-2',
        nameFa: 'اسکات هالتر',
        nameEn: 'Barbell_Squat',
        category: 'legs',
        targetMuscleFa: 'چهارسر ران، سرینی و کل عضلات پا',
        equipmentFa: 'هالتر و رک اسکات',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 100,
        instructionsFa: [
          'پاها را به اندازه عرض شانه باز کنید و وزنه را روی کول بگذارید.',
          'با عقب بردن باسن مانند نشستن روی صندلی تا زاویه ۹۰ درجه زانو پایین بروید.',
          'با فشار بر پاشنه پاها به حالت ایستاده برگردید.'
        ],
        tipsFa: ['زانوها از پنجه پا جلوتر نرود', 'کمر کاملا صاف نگه داشته شود'],
        animationType: 'squat'
      },
      {
        id: 'ex-2-3',
        nameFa: 'پشت پا خوابیده',
        nameEn: 'Lying_Leg_Curl',
        category: 'legs',
        targetMuscleFa: 'عضلات همسترینگ (پشت ران)',
        equipmentFa: 'دستگاه پشت پا خوابیده',
        targetSets: 3,
        targetReps: '15',
        defaultRestSeconds: 60,
        instructionsFa: [
          'روی دستگاه به شکم بخوابید و اهرم را پشت مچ پا قرار دهید.',
          'پاشنه‌ها را به سمت باسن خم کنید.',
          'با کنترل و به آرامی پاها را باز کنید.'
        ],
        tipsFa: ['باسن را از روی نیمکت بلند نکنید', 'حرکت را روان انجام دهید'],
        animationType: 'leg_curl'
      },
      {
        id: 'ex-2-4',
        nameFa: 'ساق پا نشسته',
        nameEn: 'Seated_Calf_Raise',
        category: 'legs',
        targetMuscleFa: 'عضله سولئوس و ساق پا',
        equipmentFa: 'دستگاه ساق پا نشسته',
        targetSets: 3,
        targetReps: '20',
        defaultRestSeconds: 45,
        instructionsFa: [
          'روی دستگاه بنشینید و پد را روی ران‌ها قرار دهید.',
          'پنجه پاها را روی لبه بگذارید و پاشنه‌ها را تا حد ممکن پایین ببرید.',
          'با پنجه پا پاشنه را بالا بکشید و در اوج انقباض مکث کنید.'
        ],
        tipsFa: ['دامنه حرکتی کامل (کشش کامل پایین و بالا)', 'تکرارهای بالا برای رشد ساق'],
        animationType: 'calf_raise'
      },
      {
        id: 'ex-2-5',
        nameFa: 'پشت بازو سیمکش',
        nameEn: 'Triceps_Pushdown',
        category: 'triceps',
        targetMuscleFa: 'عضله سه سر بازویی (پشت بازو)',
        equipmentFa: 'دستگاه سیمکش و دسته صاف',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 60,
        instructionsFa: [
          'روبروی سیمکش بایستید، دسته را بگیرید و آرنج‌ها را به تنه بچسبانید.',
          'دسته را به سمت پایین فشار دهید تا بازوها کاملا صاف شوند.',
          'با آرامی به زاویه ۹۰ درجه برگردید.'
        ],
        tipsFa: ['آرنج‌ها نباید جلو و عقب شوند', 'انقباض کامل در پایین'],
        animationType: 'triceps_pushdown'
      },
      {
        id: 'ex-2-6',
        nameFa: 'پشت بازو هالتر خوابیده (اسکال کراچر)',
        nameEn: 'Lying_Triceps_Extension',
        category: 'triceps',
        targetMuscleFa: 'سر بلند و میانی پشت بازو',
        equipmentFa: 'هالتر EZ و نیمکت تخت',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 75,
        instructionsFa: [
          'روی نیمکت بخوابید و هالتر را با دست‌های کم‌عرض بالا نگه دارید.',
          'فقط با خم کردن آرنج‌ها، هالتر را به سمت پیشانی پایین بیاورید.',
          'با فشار پشت بازو هالتر را به بالا برگردانید.'
        ],
        tipsFa: ['آرنج‌ها را باز نکنید', 'وزنه را با ایمنی کنترل کنید'],
        animationType: 'skullcrusher'
      },
      {
        id: 'ex-2-7',
        nameFa: 'پشت بازو سیمکش دسته V',
        nameEn: 'V_Bar_Triceps_Pushdown',
        category: 'triceps',
        targetMuscleFa: 'سر خارجی پشت بازو',
        equipmentFa: 'سیمکش با دسته V شکل',
        targetSets: 3,
        targetReps: '10',
        defaultRestSeconds: 60,
        instructionsFa: [
          'دسته V شکل را بگیرید و آرنج‌ها را ثابت نگه دارید.',
          'دسته را به سمت پایین و کمی به طرفین فشار دهید.',
          'در پایین ترین نقطه پشت بازو را تفکیک کنید.'
        ],
        tipsFa: ['تمرکز روی فرم حرکت', 'اجتناب از کمک گرفتن از شانه'],
        animationType: 'triceps_vbar'
      }
    ]
  },
  {
    id: 'day-3',
    titleFa: 'روز سوم: سرشانه + زیر بغل + فیله کمر',
    subtitleFa: 'تمرینات عضلات دلتوئید، زیر بغل (پشت) و فیله فیگورال',
    targetMusclesFa: ['سرشانه', 'زیر بغل (لات)', 'فیله کمر'],
    iconName: 'Zap',
    exercises: [
      {
        id: 'ex-3-1',
        nameFa: 'نشر از جلو سیمکش',
        nameEn: 'Cable_Front_Raise',
        category: 'shoulders',
        targetMuscleFa: 'دلتوئید قدامی (جلوی سرشانه)',
        equipmentFa: 'دستگاه سیمکش پایین',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 60,
        instructionsFa: [
          'پشت به دستگاه سیمکش یا روبروی آن بایستید.',
          'دسته را با یک یا دو دست بگیرید و تا ارتفاع چشم بالا بیاورید.',
          'با کنترل به پایین بازگردانید.'
        ],
        tipsFa: ['از پرتاب کردن وزنه خودداری کنید', 'بدن صاف بماند'],
        animationType: 'front_raise'
      },
      {
        id: 'ex-3-2',
        nameFa: 'سرشانه دستگاه',
        nameEn: 'Machine_Shoulder_Press',
        category: 'shoulders',
        targetMuscleFa: 'کل بخش‌های سرشانه (قدامی و جانبی)',
        equipmentFa: 'دستگاه پرس سرشانه',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 90,
        instructionsFa: [
          'ارتفاع صندلی را طوری تنظیم کنید که دسته‌ها هم‌سطح شانه باشند.',
          'دسته‌ها را تا بالایی‌ترین نقطه پرس کنید.',
          'به آرامی تا هم‌سطح گوش پایین بیاورید.'
        ],
        tipsFa: ['کمر را به پشتی تکیه دهید', 'آرنج‌ها را در بالا کاملا قفل نکنید'],
        animationType: 'shoulder_press'
      },
      {
        id: 'ex-3-3',
        nameFa: 'نشر خم دمبل',
        nameEn: 'Bent_Over_Rear_Delt_Fly',
        category: 'shoulders',
        targetMuscleFa: 'دلتوئید خلفی (پشت سرشانه)',
        equipmentFa: 'دمبل',
        targetSets: 3,
        targetReps: '10',
        defaultRestSeconds: 60,
        instructionsFa: [
          'از کمر به جلو خم شوید تا تنه تقریبا موازی زمین شود.',
          'دمبل‌ها را به طرفین باز کنید تا سرشانه‌های پشتی منقبض شوند.',
          'به آرامی به مرکز برگردانید.'
        ],
        tipsFa: ['کمر را صاف نگه دارید', 'فشار روی پشت سرشانه باشد نه زیر بغل'],
        animationType: 'rear_fly'
      },
      {
        id: 'ex-3-4',
        nameFa: 'سرشانه دمبل',
        nameEn: 'Dumbbell_Shoulder_Press',
        category: 'shoulders',
        targetMuscleFa: 'بخش جلویی و میانی سرشانه',
        equipmentFa: 'دمبل',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 75,
        instructionsFa: [
          'دمبل‌ها را کنار شانه بگیرید.',
          'با بازدم وزنه را مستقیم به بالای سر هدایت کنید.',
          'با تمرکز به سمت شانه پایین بیاورید.'
        ],
        tipsFa: ['شکم را سفت نگه دارید', 'از قوس دادن کمر جلوگیری کنید'],
        animationType: 'shoulder_press'
      },
      {
        id: 'ex-3-5',
        nameFa: 'لت زیر بغل سیمکش',
        nameEn: 'Lat_Pulldown',
        category: 'back',
        targetMuscleFa: 'عضله پشتی بزرگ (لاتیسیموس دورسی)',
        equipmentFa: 'دستگاه لت سیمکش',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 75,
        instructionsFa: [
          'میله را با دست‌های بازتر از عرض شانه بگیرید.',
          'میله را تا بالای سینه پایین بکشید و کتف‌ها را به هم نزدیک کنید.',
          'با کنترل دست‌ها را کشیده و به حالت اول برگردید.'
        ],
        tipsFa: ['سینه را به سمت بالا و جلو بدهید', 'میله را پشت گردن نکشید'],
        animationType: 'lat_pulldown'
      },
      {
        id: 'ex-3-6',
        nameFa: 'زیر بغل دمبل خم',
        nameEn: 'Bent_Over_Dumbbell_Row',
        category: 'back',
        targetMuscleFa: 'بخش میانی پشت و زیر بغل',
        equipmentFa: 'دمبل و نیمکت',
        targetSets: 3,
        targetReps: '8',
        defaultRestSeconds: 75,
        instructionsFa: [
          'یک زانو و دست را روی نیمکت قرار دهید، دمبل را در دست دیگر بگیرید.',
          'دمبل را به سمت پهلو و باسن بالا بکشید.',
          'با کشش عضله زیر بغل دمبل را پایین ببرید.'
        ],
        tipsFa: ['آرنج را نزدیک بدن نگه دارید', 'از چرخش تنه خودداری کنید'],
        animationType: 'dumbbell_row'
      },
      {
        id: 'ex-3-7',
        nameFa: 'لت زیر بغل دست برعکس',
        nameEn: 'Reverse_Grip_Lat_Pulldown',
        category: 'back',
        targetMuscleFa: 'بخش پایینی زیر بغل و جلو بازو',
        equipmentFa: 'دستگاه لت سیمکش',
        targetSets: 3,
        targetReps: '10',
        defaultRestSeconds: 60,
        instructionsFa: [
          'میله را طوری بگیرید که کف دست‌ها رو به صورت شما باشد (قبض معکوس).',
          'میله را به سمت قسمت پایینی سینه بکشید.',
          'در پایین ۱ ثانیه مکث کرده و سپس آزاد کنید.'
        ],
        tipsFa: ['تمرکز روی کشش بخش پایینی زیر بغل', 'دست‌ها به عرض شانه'],
        animationType: 'reverse_pulldown'
      },
      {
        id: 'ex-3-8',
        nameFa: 'فیله کمر (هایپراکستنشن)',
        nameEn: 'Back_Extension',
        category: 'back',
        targetMuscleFa: 'عضلات راست‌کننده ستون فقرات (فیله کمر)',
        equipmentFa: 'میز فیله کمر 45 درجه',
        targetSets: 3,
        targetReps: '12',
        defaultRestSeconds: 60,
        instructionsFa: [
          'مچ پاها را زیر پد محکم کنید و لگن را روی پد قرار دهید.',
          'از کمر به سمت پایین خم شوید.',
          'با فیله کمر تنه را بالا بیاورید تا بدن در یک خط مستقیم قرار گیرد.'
        ],
        tipsFa: ['در بالا کمر را بیش از حد قوس ندهید', 'حرکت را شتاب‌زده انجام ندهید'],
        animationType: 'hyperextension',
        isBodyweight: true
      }
    ]
  }
];
