import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
const STORAGE_KEYS = new Set([
  "fa_workout_routines_v1",
  "fa_workout_sessions_v1",
  "fa_active_workout_session_v1",
  "fa_workout_chat_history_v1",
  "fa_workout_chat_sessions_v2"
]);

function getDataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

function ensureDataDir(): string {
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function storageFilePath(key: string): string {
  return path.join(ensureDataDir(), `${key}.json`);
}

function readStorageValue(key: string): unknown | null {
  const filePath = storageFilePath(key);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed?.data ?? parsed;
  } catch (err) {
    console.error(`Failed to read storage file for ${key}:`, err);
    return null;
  }
}

function writeStorageValue(key: string, data: unknown): void {
  const filePath = storageFilePath(key);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify({ data, updatedAt: new Date().toISOString() }, null, 2), "utf8");
  fs.renameSync(tempPath, filePath);
}

async function startServer() {
  const app = express();

  // Liveness / Health check endpoints for Cloud Run and container orchestrators
  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      dataDir: getDataDir()
    });
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini AI SDK (Server-Side)
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Helper for universal AI completions (supporting both Google Gemini & OpenAI-compatible providers like DeepSeek, OpenRouter, Groq, Cursor, Ollama)
  interface CustomAiConfig {
    provider?: "gemini" | "openai_compatible";
    apiKey?: string;
    baseUrl?: string;
    modelName?: string;
  }

  async function callAiCompletion(params: {
    systemInstruction: string;
    userPrompt: string;
    chatHistory?: { role: string; content: string }[];
    jsonOutputSchema?: any;
    customAiConfig?: CustomAiConfig;
    temperature?: number;
  }): Promise<string> {
    const {
      systemInstruction,
      userPrompt,
      chatHistory = [],
      customAiConfig,
      jsonOutputSchema,
      temperature = 0.7
    } = params;

    const provider = customAiConfig?.provider || "gemini";
    const apiKey = customAiConfig?.apiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const modelName = customAiConfig?.modelName?.trim() || (provider === "openai_compatible" ? "gpt-4o-mini" : "gemini-3.6-flash");

    if (!apiKey) {
      throw new Error("هیچ کلید API تنظیم نشده است. لطفاً در تب تنظیمات، کلید API خود را وارد کنید.");
    }

    if (provider === "openai_compatible") {
      let baseUrl = customAiConfig?.baseUrl?.trim() || "https://api.openai.com/v1";
      baseUrl = baseUrl.replace(/\/+$/, "");
      if (!baseUrl.toLowerCase().endsWith("/chat/completions")) {
        baseUrl = `${baseUrl}/chat/completions`;
      }

      let systemMsgContent = systemInstruction;
      if (jsonOutputSchema) {
        systemMsgContent += "\nIMPORTANT: You MUST return strictly valid JSON matching the requested structure. Do NOT wrap the JSON inside markdown code blocks (e.g. ```json).";
      }

      const messages: any[] = [
        { role: "system", content: systemMsgContent }
      ];

      chatHistory.forEach((h) => {
        messages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content
        });
      });

      messages.push({
        role: "user",
        content: userPrompt
      });

      const reqBody: any = {
        model: modelName,
        messages,
        temperature
      };

      if (jsonOutputSchema) {
        reqBody.response_format = { type: "json_object" };
      }

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(reqBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `خطای سرور هوش مصنوعی (${response.status})`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const json = await response.json();
      let replyText = json.choices?.[0]?.message?.content || "";
      
      // Strip markdown codeblock backticks if present
      replyText = replyText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      return replyText;
    } else {
      // Gemini Provider
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const contentsList: any[] = [];
      chatHistory.forEach((h) => {
        contentsList.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });

      contentsList.push({
        role: "user",
        parts: [{ text: userPrompt }]
      });

      const config: any = {
        systemInstruction,
        temperature
      };

      if (jsonOutputSchema) {
        config.responseMimeType = "application/json";
        config.responseSchema = jsonOutputSchema;
      }

      const res = await ai.models.generateContent({
        model: modelName || "gemini-3.6-flash",
        contents: contentsList,
        config
      });

      return res.text || "";
    }
  }

  // API Endpoint: Test AI Connection
  app.post("/api/ai/test-connection", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { customAiConfig } = req.body;
      const reply = await callAiCompletion({
        systemInstruction: "You are an AI assistant test. Reply with a short enthusiastic Persian confirmation.",
        userPrompt: "سلام! آیا ارتباط با مدل هوش مصنوعی با موفقیت برقرار شد؟",
        customAiConfig,
        temperature: 0.5
      });
      return res.json({ success: true, reply });
    } catch (err: any) {
      console.error("AI connection test failed:", err);
      return res.status(400).json({
        success: false,
        error: err.message || "برقراری ارتباط با مدل هوش مصنوعی ناموفق بود."
      });
    }
  });
  // API Endpoint: Persistent user data storage (survives container restarts via DATA_DIR volume)
  app.get("/api/storage/:key", (req, res) => {
    const key = String(req.params.key || "");
    if (!STORAGE_KEYS.has(key)) {
      return res.status(400).json({ error: "Invalid storage key." });
    }

    const data = readStorageValue(key);
    if (data === null) {
      return res.status(404).json({ error: "No data found for this key." });
    }

    return res.json({ data });
  });

  app.put("/api/storage/:key", (req, res) => {
    const key = String(req.params.key || "");
    if (!STORAGE_KEYS.has(key)) {
      return res.status(400).json({ error: "Invalid storage key." });
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, "data")) {
      return res.status(400).json({ error: "Request body must include data." });
    }

    try {
      writeStorageValue(key, req.body.data);
      return res.json({ success: true });
    } catch (err: any) {
      console.error(`Failed to write storage file for ${key}:`, err);
      return res.status(500).json({ error: err.message || "Failed to save data." });
    }
  });

  // API Endpoint: Gemini AI Smart Workout Parser
  app.post("/api/gemini/parse-workout", async (req, res) => {
    try {
      const { rawText, customAiConfig } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "rawText parameter is required." });
      }

      const systemInstruction = `
You are an expert fitness coach and exercise scientist specializing in bodybuilding, weightlifting, and Persian workout program analysis.
Your job is to parse raw workout program text in Persian or English, identify all training days, and break down every exercise accurately.

CRITICAL INSTRUCTION FOR EXERCISE ANIMATION MATCHING:
For every exercise identified, set nameEn to the closest standard English MuscleWiki exercise name (e.g. "Barbell Bench Press"). Media is resolved later via the MuscleWiki API — do not invent local GIF filenames.

Categories must be one of: "chest", "back", "shoulders", "biceps", "triceps", "legs", "abs".
Animation Types must be one of: "dumbbell_press", "incline_press", "fly", "pullover", "bicep_curl", "hammer_curl", "preacher_curl", "crunch", "leg_extension", "squat", "leg_curl", "calf_raise", "triceps_pushdown", "skullcrusher", "triceps_vbar", "front_raise", "shoulder_press", "rear_fly", "lat_pulldown", "dumbbell_row", "reverse_pulldown", "hyperextension".

Example mappings:
- "پرس سینه" -> nameEn: "Dumbbell_Bench_Press", category: "chest", animationType: "dumbbell_press"
- "پرس بالا سینه / پرس بالا سینه دمبل" -> nameEn: "Incline_Dumbbell_Press", category: "chest", animationType: "incline_press"
- "پرس بالا سینه دستگاه / دستگاه بالاسینه / پرس بالاسینه دستگاه" -> nameEn: "Incline_Chest_Press", category: "chest", animationType: "incline_press"
- "قفسه سینه / فلای" -> nameEn: "Chest_Fly", category: "chest", animationType: "fly"
- "قفسه بالا سینه" -> nameEn: "Incline_Dumbbell_Fly", category: "chest", animationType: "fly"
- "پلاور" -> nameEn: "Dumbbell_Pullover", category: "chest", animationType: "pullover"
- "جلو بازو لاری" -> nameEn: "EZ_Bar_Preacher_Curl", category: "biceps", animationType: "preacher_curl"
- "جلو بازو چکشی" -> nameEn: "Dumbbell_Hammer_Curl", category: "biceps", animationType: "hammer_curl"
- "پشت بازو هالتر خوابیده / اسکال کراچر / فرانسوی" -> nameEn: "Lying_Triceps_Extension", category: "triceps", animationType: "skullcrusher"
- "پشت بازو طناب یا V" -> nameEn: "V_Bar_Triceps_Pushdown", category: "triceps", animationType: "triceps_vbar"
- "پشت بازو سیمکش" -> nameEn: "Triceps_Pushdown", category: "triceps", animationType: "triceps_pushdown"
- "نشر خم / پشت سرشانه" -> nameEn: "Bent_Over_Rear_Delt_Fly", category: "shoulders", animationType: "rear_fly"
- "نشر جلو" -> nameEn: "Cable_Front_Raise", category: "shoulders", animationType: "front_raise"
- "پرس سرشانه" -> nameEn: "Dumbbell_Shoulder_Press", category: "shoulders", animationType: "shoulder_press"
- "سرشانه دستگاه / پرس سرشانه دستگاه" -> nameEn: "Machine_Shoulder_Press", category: "shoulders", animationType: "shoulder_press"
- "زیر بغل سیمکش / لتبک" -> nameEn: "Lat_Pulldown", category: "back", animationType: "lat_pulldown"
- "زیر بغل مچ معکوس" -> nameEn: "Reverse_Grip_Lat_Pulldown", category: "back", animationType: "reverse_pulldown"
- "زیر بغل دمبل خم / قایقی" -> nameEn: "Bent_Over_Dumbbell_Row", category: "back", animationType: "dumbbell_row"
- "فیله کمر" -> nameEn: "Back_Extension", category: "back", animationType: "hyperextension"
- "اسکات" -> nameEn: "Barbell_Squat", category: "legs", animationType: "squat"
- "جلو پا" -> nameEn: "Leg_Extension", category: "legs", animationType: "leg_extension"
- "پشت پا" -> nameEn: "Lying_Leg_Curl", category: "legs", animationType: "leg_curl"
- "ساق پا" -> nameEn: "Seated_Calf_Raise", category: "legs", animationType: "calf_raise"
- "کرانچ / شکم" -> nameEn: "Crunch", category: "abs", animationType: "crunch"

Provide step-by-step instructions (instructionsFa) and tips (tipsFa) in Persian for each exercise.
`;

      const jsonOutputSchema = {
        type: Type.ARRAY,
        description: "List of routine days parsed from text",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            titleFa: { type: Type.STRING, description: "Title in Persian, e.g., روز اول: سینه و جلو بازو" },
            subtitleFa: { type: Type.STRING, description: "Subtitle describing target muscles in Persian" },
            targetMusclesFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            iconName: { type: Type.STRING, description: "Dumbbell, Activity, or Zap" },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  nameFa: { type: Type.STRING, description: "Persian name of exercise" },
                  nameEn: { type: Type.STRING, description: "Exact matching English dataset GIF filename, e.g. Incline_Dumbbell_Press" },
                  category: { type: Type.STRING, description: "chest, back, shoulders, biceps, triceps, legs, abs" },
                  targetMuscleFa: { type: Type.STRING, description: "Persian target muscle details" },
                  equipmentFa: { type: Type.STRING, description: "Persian equipment details" },
                  targetSets: { type: Type.INTEGER, description: "Target sets integer" },
                  targetReps: { type: Type.STRING, description: "Target reps string e.g. 10 or 10-12" },
                  defaultRestSeconds: { type: Type.INTEGER, description: "Rest seconds, default 60-90" },
                  instructionsFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  tipsFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  animationType: { type: Type.STRING }
                },
                required: ["nameFa", "nameEn", "category", "targetMuscleFa", "equipmentFa", "targetSets", "targetReps", "instructionsFa", "animationType"]
              }
            }
          },
          required: ["titleFa", "targetMusclesFa", "exercises"]
        }
      };

      const rawResultText = await callAiCompletion({
        systemInstruction,
        userPrompt: `Parse and extract workout routines from this text:\n\n${rawText}`,
        jsonOutputSchema,
        customAiConfig,
        temperature: 0.2
      });

      const parsedJson = JSON.parse(rawResultText || "[]");
      return res.json({ routines: parsedJson });
    } catch (error: any) {
      console.error("Error in /api/gemini/parse-workout:", error);
      return res.status(500).json({ error: error.message || "Failed to parse workout with AI." });
    }
  });

  // API Endpoint: Gemini AI Routine GIF Validator & Fixer
  app.post("/api/gemini/fix-routines", async (req, res) => {
    try {
      const { routines, customAiConfig } = req.body;
      if (!routines || !Array.isArray(routines)) {
        return res.status(400).json({ error: "routines array is required." });
      }

      const systemInstruction = `
You are an expert fitness AI. Your primary objective is to FIX and VERIFY all exercise video/animation mappings in existing workout routines.
Examine each exercise in the provided routines array.

For every exercise:
1. Identify the true exercise being described by nameFa and instructionsFa.
2. Correct its nameEn to match one of these EXACT dataset GIF filenames:
"[use standard English MuscleWiki exercise names; media comes from MuscleWiki API]"
3. Correct category to one of: "chest", "back", "shoulders", "biceps", "triceps", "legs", "abs".
4. Correct animationType to match the movement (e.g. "incline_press", "rear_fly", "triceps_vbar", "skullcrusher", "lat_pulldown", "bicep_curl", "hammer_curl", "squat", "leg_extension", etc.).
5. Ensure Persian target muscle (targetMuscleFa), equipment (equipmentFa), instructions (instructionsFa), and tips (tipsFa) are accurate and professional.

Return the fully corrected routines array preserving the existing IDs where appropriate.
`;

      const jsonOutputSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            titleFa: { type: Type.STRING },
            subtitleFa: { type: Type.STRING },
            targetMusclesFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            iconName: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  nameFa: { type: Type.STRING },
                  nameEn: { type: Type.STRING },
                  category: { type: Type.STRING },
                  targetMuscleFa: { type: Type.STRING },
                  equipmentFa: { type: Type.STRING },
                  targetSets: { type: Type.INTEGER },
                  targetReps: { type: Type.STRING },
                  defaultRestSeconds: { type: Type.INTEGER },
                  instructionsFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  tipsFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  animationType: { type: Type.STRING }
                },
                required: ["id", "nameFa", "nameEn", "category", "targetMuscleFa", "equipmentFa", "targetSets", "targetReps", "instructionsFa", "animationType"]
              }
            }
          },
          required: ["id", "titleFa", "exercises"]
        }
      };

      const rawResultText = await callAiCompletion({
        systemInstruction,
        userPrompt: `Analyze and fix animation/GIF video mappings for these routines:\n\n${JSON.stringify(routines, null, 2)}`,
        jsonOutputSchema,
        customAiConfig,
        temperature: 0.2
      });

      const fixedRoutines = JSON.parse(rawResultText || "[]");
      return res.json({ routines: fixedRoutines });
    } catch (error: any) {
      console.error("Error in /api/gemini/fix-routines:", error);
      return res.status(500).json({ error: error.message || "Failed to fix routines with AI." });
    }
  });

  // API Endpoint: AI Workout Science Program Audit & Analysis
  app.post("/api/gemini/analyze-program", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { routines, userGoal, userExperience, customAiConfig } = req.body;
      if (!routines || !Array.isArray(routines)) {
        return res.status(400).json({ error: "لیست برنامه‌ها یافت نشد یا معتبر نیست." });
      }

      // Helper for intelligent fallback analysis if API Key is missing or Gemini fails
      const generateFallbackAnalysis = () => {
        const muscleCounts: Record<string, number> = {};
        let totalExercises = 0;
        let totalSets = 0;

        routines.forEach((day: any) => {
          if (Array.isArray(day.exercises)) {
            day.exercises.forEach((ex: any) => {
              totalExercises++;
              const sets = Number(ex.targetSets) || 3;
              totalSets += sets;
              const muscle = ex.targetMuscleFa || ex.category || "سایر";
              muscleCounts[muscle] = (muscleCounts[muscle] || 0) + sets;
            });
          }
        });

        const muscleVolumeBreakdown = Object.entries(muscleCounts).map(([muscle, sets]) => {
          let statusFa = "ایده‌آل (۱۰ الی ۲۰ ست)";
          let recommendationFa = "حجم تمرینی این عضله در محدوده بهینه هایپرتروفی قرار دارد.";
          if (sets < 8) {
            statusFa = "کمی پایین (زیر ۸ ست)";
            recommendationFa = "پیشنهاد می‌شود ۲ الی ۴ ست به حجم هفتگی این عضله اضافه کنید.";
          } else if (sets > 22) {
            statusFa = "بالا (بیش از ۲۲ ست)";
            recommendationFa = "احتمال اورتمرین؛ حجم را کمی کاهش دهید تا بازسازی عضلانی بهتر شود.";
          }
          return {
            muscleNameFa: muscle,
            weeklySets: sets,
            statusFa,
            recommendationFa
          };
        });

        let score = 85;
        if (totalExercises < 5) score = 70;
        if (totalSets > 70) score = 78;

        return {
          score,
          headline: `برنامه شما دارای ${totalExercises} حرکت و مجموع ${totalSets} ست هفتگی است.`,
          overallAssessmentFa: `با بررسی بیومکانیکی برنامه شما برای هدف "${userGoal || 'هایپرتروفی'}" و سطح "${userExperience || 'متوسط'}"، تفکیک ست‌های هر عضله محاسبه شد. برنامه شما تنوع حرکتی خوبی دارد و با رعایت اصل بار اضافه تدریجی (Progressive Overload) بازدهی بالایی خواهد داشت.`,
          muscleVolumeBreakdown: muscleVolumeBreakdown.length > 0 ? muscleVolumeBreakdown : [
            {
              muscleNameFa: "سینه و سرشانه",
              weeklySets: 12,
              statusFa: "ایده‌آل",
              recommendationFa: "حجم مناسب برای رشد عضلانی"
            }
          ],
          strengthsFa: [
            "تنوع مناسب در انتخاب زاویه اعمال نیرو بر فیبرهای عضلانی",
            "وجود حرکات چندمفصلی مادر (Compound) در کنار حرکات تک‌مفصلی",
            "تقسیم‌بندی روزهای تمرینی جهت بازسازی مفصلی و عضلانی"
          ],
          warningsFa: [
            "حتما ریکاوری و حداقل ۴۸ ساعت استراحت بین روزهای سنگین را رعایت کنید.",
            "از گرم کردن کافی مفصل سرشانه و مچ دست قبل از ست‌های سنگین غافل نشوید."
          ],
          actionableTipsFa: [
            "هر ۲ الی ۳ هفته، وزنه یا تعداد تکرارها را به میزان ۵ درصد افزایش دهید (Progressive Overload).",
            "زمان استراحت بین ست‌های سنگین را بین ۹۰ الی ۱۲۰ ثانیه تنظیم کنید.",
            "تغذیه پرپروتئین (۱.۶ الی ۲ گرم به ازای هر کیلوگرم وزن بدن) را فراموش نکنید."
          ]
        };
      };

      try {
        const systemInstruction = `
You are an elite master exercise scientist, biomechanist, and sports nutritionist trained in bodybuilding and strength programming.
Your task is to perform an in-depth, rigorous scientific audit of the user's workout program.

Analyze:
1. Muscle group volume balance (working sets per muscle group per week vs scientific optimal 10-20 sets/week).
2. Exercise selection, mechanical tension, stability, and overlap/fatigue management.
3. Push/Pull/Legs/Abs balance and joint health (e.g. shoulder impingement risk, posterior chain balance, lower back fatigue).
4. Progression mechanics, set/rep ranges, and rest intervals.
5. Provide a numerical score from 0 to 100 representing scientific effectiveness and balance.
6. Provide clear Persian recommendations, strengths, warnings, and muscle breakdown.
7. Provide an OPTIMIZED version of the program (suggestedOptimizedRoutines) if fixes are needed, mapping nameEn accurately to:
"[use standard English MuscleWiki exercise names; media comes from MuscleWiki API]"
`;

        const promptText = `
Audit this workout program in Persian:
Target Goal: ${userGoal || "عضله‌سازی و افزایش قدرت (Hypertrophy & Strength)"}
Experience Level: ${userExperience || "متوسط (Intermediate)"}

Program Structure:
${JSON.stringify(routines, null, 2)}
`;

        const jsonOutputSchema = {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Program score out of 100" },
            headline: { type: Type.STRING, description: "Main concise summary line in Persian" },
            overallAssessmentFa: { type: Type.STRING, description: "Detailed paragraph analysis in Persian" },
            muscleVolumeBreakdown: {
              type: Type.ARRAY,
              description: "Analysis per muscle group",
              items: {
                type: Type.OBJECT,
                properties: {
                  muscleNameFa: { type: Type.STRING },
                  weeklySets: { type: Type.INTEGER },
                  statusFa: { type: Type.STRING, description: "عالی، کم، زیاد یا ایده‌آل" },
                  recommendationFa: { type: Type.STRING }
                },
                required: ["muscleNameFa", "weeklySets", "statusFa", "recommendationFa"]
              }
            },
            strengthsFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            warningsFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionableTipsFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "headline", "overallAssessmentFa", "muscleVolumeBreakdown", "strengthsFa", "warningsFa", "actionableTipsFa"]
        };

        const rawText = await callAiCompletion({
          systemInstruction,
          userPrompt: promptText,
          jsonOutputSchema,
          customAiConfig,
          temperature: 0.3
        });

        const analysisResult = JSON.parse(rawText || "{}");
        return res.json({ analysis: analysisResult });
      } catch (geminiError: any) {
        console.error("AI API Error in analyze-program, returning fallback analysis:", geminiError);
        return res.json({ analysis: generateFallbackAnalysis() });
      }
    } catch (error: any) {
      console.error("Error in /api/gemini/analyze-program:", error);
      return res.status(500).json({ error: error.message || "Failed to analyze program." });
    }
  });

  // API Endpoint: AI Fitness & Nutrition Coach Chat
  app.post("/api/gemini/coach-chat", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { message, chatHistory, currentRoutines, customAiConfig } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "متن پیام الزامی است." });
      }

      try {
        const systemInstruction = `
شما مربی ارشد و متخصص بین‌المللی علوم ورزشی، بیومکانیک، هایپرتروفی و تغذیه ورزشی هستید.
نام شما "مربی هوشمند AI" است.
لحن شما بسیار انگیزشی، محترمانه، علمی، کاربردی و روان به زبان فارسی است.

وظایف شما:
۱. پاسخ به تمام سوالات ورزشی، بدنسازی، فیتنس، برنامه‌ریزی تمرین، هایپرتروفی، چربی‌سوزی، سیستم‌های تمرینی (Super-set, Drop-set, Rest-Pause, RPE/RIR) و فرم صحیح حرکات.
۲. ارائه راهنمایی‌های دقیق تغذیه‌ای، محاسبه درشت‌مغذی‌ها (پروتئین، کربوهیدرات، چربی)، کالری، و زمان‌بندی مکمل‌ها (کراتین، وی، گلوتامین، BCAAs، مولتی ویتامین).
۳. اگر کاربر درباره برنامه فعلی‌اش سوالی پرسید، با توجه به برنامه تمرینی او که در اختیار شماست، پاسخ کاملاً اختصاصی و متناسب با برنامه‌اش بدهید.
۴. استفاده از ساختار تمیز، ایموجی‌های مناسب ورزشی، بولت‌پوینت‌های خوانا و توصیه‌های گام‌به‌گام.

برنامه ورزشی فعلی کاربر در اپلیکیشن:
${currentRoutines ? JSON.stringify(currentRoutines, null, 2) : "هنوز برنامه‌ای وارد نشده است."}
`;

        const reply = await callAiCompletion({
          systemInstruction,
          userPrompt: message,
          chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
          customAiConfig,
          temperature: 0.7
        });

        return res.json({ reply: reply || "پاسخی از مربی دریافت نشد." });
      } catch (geminiError: any) {
        console.error("AI API Error in coach-chat:", geminiError);
        return res.json({
          reply: `خطا در ارتباط با هوش مصنوعی: ${geminiError.message || 'لطفا کلید API تنظیمات را بررسی کنید.'}`
        });
      }
    } catch (error: any) {
      console.error("Error in /api/gemini/coach-chat:", error);
      return res.status(500).json({ error: error.message || "Failed to communicate with AI Coach." });
    }
  });

  // API Endpoint: Proxy external media (GIFs, MP4s, WebMs, images) with range support
  app.get("/api/proxy-media", async (req, res) => {
    try {
      const targetUrl = (req.query.url as string) || (req.query.src as string) || "";

      if (!targetUrl || typeof targetUrl !== "string") {
        return res.status(400).send("Missing target url parameter");
      }

      if (targetUrl.startsWith("/")) {
        return res.status(400).send("Local media paths are no longer served; use MuscleWiki API URLs");
      }

      console.log(`[Proxy Media] Requesting external media: ${targetUrl}`);

      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Referer": "https://musclewiki.com/",
        "Origin": "https://musclewiki.com"
      };

      if (req.headers.range) {
        headers["Range"] = String(req.headers.range);
      }

      const apiKey = process.env.MUSCLEWIKI_API_KEY || (req.headers["x-api-key"] as string) || "";
      if (apiKey) {
        headers["X-API-Key"] = String(apiKey);
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      let response: Response | null = null;
      try {
        response = await fetch(targetUrl, { headers });
      } catch (fetchErr) {
        console.warn(`[Proxy Media] Network fetch error for ${targetUrl}:`, fetchErr);
        return res.status(502).send("Failed to fetch upstream media");
      }

      if (!response || (response.status !== 200 && response.status !== 206)) {
        console.warn(`[Proxy Media] Upstream failed (${response?.status || "No Response"}) for ${targetUrl}`);
        return res.status(response?.status || 502).send("Upstream media unavailable");
      }

      let contentType = response.headers.get("content-type") || "";
      const cleanTarget = targetUrl.split("?")[0].toLowerCase();
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const headerSnippet = buffer.toString("utf8", 0, 100).toLowerCase();
      const isHtmlPage = contentType.includes("html") || headerSnippet.includes("<!doctype") || headerSnippet.includes("<html") || headerSnippet.includes("<head");
      if (isHtmlPage) {
        console.warn(`[Proxy Media] Upstream for ${targetUrl} returned HTML instead of media`);
        return res.status(502).send("Upstream returned HTML instead of media");
      }

      if (!contentType || contentType.includes("text") || contentType.includes("json")) {
        if (cleanTarget.endsWith(".mp4") || cleanTarget.includes("/videos/") || cleanTarget.includes("mp4")) contentType = "video/mp4";
        else if (cleanTarget.endsWith(".webm")) contentType = "video/webm";
        else if (cleanTarget.endsWith(".png")) contentType = "image/png";
        else if (cleanTarget.endsWith(".jpg") || cleanTarget.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (cleanTarget.endsWith(".gif")) contentType = "image/gif";
        else contentType = "application/octet-stream";
      }

      const contentLength = response.headers.get("content-length");
      const contentRange = response.headers.get("content-range");

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.setHeader("Accept-Ranges", "bytes");

      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);

      return res.status(response.status).send(buffer);
    } catch (err: any) {
      console.error("[Proxy Media] Unexpected error:", err);
      return res.status(500).send(`Failed to proxy media: ${err.message}`);
    }
  });

  // In-memory cache for MuscleWiki API queries (24 hour TTL)
  const mwApiCache = new Map<string, { data: any; expiresAt: number }>();

  const pickMediaUrl = (ex: any): { primary: string; side: string; female: string } => {
    const videos = Array.isArray(ex.videos) ? ex.videos : [];
    const images = Array.isArray(ex.images) ? ex.images : [];
    const videoUrl = (v: any) => (typeof v === "string" ? v : v?.url || v?.video || v?.src) || "";
    const byAngle = (angle: string) =>
      videos.find((v: any) => String(v?.angle || v?.view || v?.name || v?.url || "").toLowerCase().includes(angle));
    const byGender = (gender: string) =>
      videos.find((v: any) => String(v?.gender || v?.sex || "").toLowerCase().includes(gender));
    const front = byAngle("front") || videos[0];
    const side = byAngle("side") || videos[1];
    const female = byGender("female");
    const imageUrl = (img: any) => (typeof img === "string" ? img : img?.url) || "";
    const primary = videoUrl(front) || ex.video_url || ex.videoUrl || ex.gif_url || ex.gifUrl || imageUrl(images[0]) || "";
    const sideUrl = videoUrl(side) || ex.side_video_url || ex.sideGifUrl || imageUrl(images[1]) || "";
    const femaleUrl = videoUrl(female) || ex.female_video_url || ex.femaleGifUrl || "";
    return { primary: String(primary || ""), side: String(sideUrl || ""), female: String(femaleUrl || "") };
  };

  const mapBodyPartToMuscle = (cat: string): string => {
    const c = String(cat || "").toLowerCase();
    if (c === "chest") return "Chest";
    if (c === "biceps") return "Biceps";
    if (c === "triceps") return "Triceps";
    if (c === "shoulders") return "Shoulders";
    if (c === "back") return "Lats";
    if (c === "legs") return "Quadriceps";
    if (c === "abs") return "Abdominals";
    return cat;
  };

  const mapMwCategoryFromMuscles = (ex: any): string => {
    const muscles = [
      ...(Array.isArray(ex.primary_muscles) ? ex.primary_muscles : []),
      ...(Array.isArray(ex.muscles) ? ex.muscles : []),
      ex.target_group,
      ex.category
    ]
      .filter(Boolean)
      .map((m) => String(m).toLowerCase());
    if (muscles.some((m) => m.includes("chest") || m.includes("pectoral"))) return "chest";
    if (muscles.some((m) => m.includes("bicep"))) return "biceps";
    if (muscles.some((m) => m.includes("tricep"))) return "triceps";
    if (muscles.some((m) => m.includes("shoulder") || m.includes("delt"))) return "shoulders";
    if (muscles.some((m) => m.includes("lat") || m.includes("back") || m.includes("trap") || m.includes("rhomb"))) return "back";
    if (muscles.some((m) => m.includes("quad") || m.includes("hamstring") || m.includes("glute") || m.includes("calf") || m.includes("leg"))) return "legs";
    if (muscles.some((m) => m.includes("ab") || m.includes("core") || m.includes("oblique"))) return "abs";
    return "chest";
  };

  // API Endpoint: MuscleWiki Exercises Search & Explorer Proxy (official API only)
  app.all("/api/musclewiki/exercises", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    try {
      const q = req.query.q || req.query.search || req.body?.search || "";
      const category = req.query.category || req.body?.category || "all"; // app body-part filter
      const muscle = req.query.muscle || req.query.targetMuscle || req.body?.muscle || "all";
      const equipment = req.query.equipment || req.body?.equipment || "all";
      const customApiKey =
        req.headers["x-musclewiki-key"] ||
        req.headers["x-api-key"] ||
        req.query.apiKey ||
        process.env.MUSCLEWIKI_API_KEY ||
        "";

      if (!customApiKey) {
        return res.status(503).json({
          success: false,
          error: "MUSCLEWIKI_API_KEY is not configured"
        });
      }

      const cacheKey = `${q}:${category}:${muscle}:${equipment}`;
      const now = Date.now();
      const cached = mwApiCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        console.log(`[MuscleWiki API Endpoint] Serving from server in-memory cache for key: "${cacheKey}"`);
        return res.json(cached.data);
      }

      console.log(`[MuscleWiki API Endpoint] Request received - q: "${q}", category: "${category}", muscle: "${muscle}", equipment: "${equipment}"`);

      const proxyIfNeeded = (rawUrl: string, nameEn?: string, cat?: string): string => {
        if (!rawUrl || typeof rawUrl !== "string") return "";
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
          return `/api/proxy-media?url=${encodeURIComponent(rawUrl)}&exerciseName=${encodeURIComponent(nameEn || "")}&category=${encodeURIComponent(cat || "")}`;
        }
        // Relative branded stream paths from MuscleWiki
        if (rawUrl.includes("videos/") || rawUrl.endsWith(".mp4") || rawUrl.endsWith(".webm")) {
          const absolute = rawUrl.startsWith("/")
            ? `https://media.musclewiki.com${rawUrl}`
            : `https://media.musclewiki.com/media/uploads/${rawUrl.replace(/^\/+/, "")}`;
          return `/api/proxy-media?url=${encodeURIComponent(absolute)}&exerciseName=${encodeURIComponent(nameEn || "")}&category=${encodeURIComponent(cat || "")}`;
        }
        return rawUrl;
      };

      const params = new URLSearchParams();
      params.append("limit", "50");
      // Official API: category = equipment; muscles = body part
      if (equipment && equipment !== "all") params.append("category", String(equipment));
      const muscleFilter =
        muscle && muscle !== "all"
          ? String(muscle)
          : category && category !== "all"
          ? mapBodyPartToMuscle(String(category))
          : "";
      if (muscleFilter) params.append("muscles", muscleFilter);

      const mwUrl =
        q && String(q).trim().length >= 2
          ? (() => {
              const sp = new URLSearchParams();
              sp.append("q", String(q).trim());
              sp.append("limit", "50");
              if (equipment && equipment !== "all") sp.append("category", String(equipment));
              if (muscleFilter) sp.append("muscles", muscleFilter);
              return `https://api.musclewiki.com/search?${sp.toString()}`;
            })()
          : `https://api.musclewiki.com/exercises?${params.toString()}`;

      const mwRes = await fetch(mwUrl, {
        headers: {
          "X-API-Key": String(customApiKey),
          "Accept": "application/json"
        }
      });

      console.log(`[MuscleWiki API Endpoint] External API HTTP status: ${mwRes.status} url=${mwUrl}`);

      if (!mwRes.ok) {
        const errBody = await mwRes.text().catch(() => "");
        return res.status(502).json({
          success: false,
          error: `MuscleWiki API returned HTTP ${mwRes.status}`,
          details: errBody.slice(0, 300)
        });
      }

      const mwData = await mwRes.json();
      const list = Array.isArray(mwData) ? mwData : (mwData?.results || mwData?.exercises || mwData?.data || []);
      if (!Array.isArray(list) || list.length === 0) {
        const resPayload = {
          success: true,
          source: "MuscleWiki Official API",
          count: 0,
          exercises: []
        };
        mwApiCache.set(cacheKey, { data: resPayload, expiresAt: Date.now() + 86400000 });
        return res.json(resPayload);
      }

      const mappedList = list.map((ex: any) => {
        const nameEnVal = ex.nameEn || ex.name || "Exercise";
        const catVal = mapMwCategoryFromMuscles(ex);
        const media = pickMediaUrl(ex);
        const primaryMuscles = Array.isArray(ex.primary_muscles) ? ex.primary_muscles : [];
        const steps = Array.isArray(ex.steps)
          ? ex.steps
          : typeof ex.steps === "string"
          ? ex.steps.split(/\n+/).map((s: string) => s.trim()).filter(Boolean)
          : [];
        return {
          ...ex,
          id: String(ex.id || ex.slug || `mw-${nameEnVal}`.toLowerCase().replace(/\s+/g, "-")),
          nameEn: nameEnVal,
          nameFa: ex.nameFa || ex.name || "حرکت ورزشی",
          category: catVal,
          targetMuscleEn: primaryMuscles[0] || ex.targetMuscleEn || "",
          targetMuscleFa: primaryMuscles[0] || ex.targetMuscleFa || "",
          secondaryMusclesFa: primaryMuscles.slice(1),
          equipmentEn: ex.category || ex.equipmentEn || "",
          equipmentFa: ex.category || ex.equipmentFa || "",
          difficultyFa: ex.difficulty || ex.difficultyFa || "",
          instructionsFa: Array.isArray(ex.instructionsFa) ? ex.instructionsFa : steps,
          instructionsEn: Array.isArray(ex.instructionsEn) ? ex.instructionsEn : steps,
          tipsFa: Array.isArray(ex.tipsFa) ? ex.tipsFa : [],
          gifUrl: proxyIfNeeded(media.primary, nameEnVal, catVal),
          sideGifUrl: media.side ? proxyIfNeeded(media.side, nameEnVal, catVal) : undefined,
          femaleGifUrl: media.female ? proxyIfNeeded(media.female, nameEnVal, catVal) : undefined,
          source: "MuscleWiki API"
        };
      });

      console.log(`[MuscleWiki API Endpoint] Official API returned ${mappedList.length} mapped exercises. First media URL: ${mappedList[0]?.gifUrl}`);
      const resPayload = {
        success: true,
        source: "MuscleWiki Official API",
        count: mappedList.length,
        exercises: mappedList
      };
      mwApiCache.set(cacheKey, { data: resPayload, expiresAt: Date.now() + 86400000 });
      return res.json(resPayload);
    } catch (err: any) {
      console.error("Error in /api/musclewiki/exercises:", err);
      return res.status(502).json({ success: false, error: err.message || "Failed to fetch MuscleWiki exercises." });
    }
  });

  // API Endpoint: MuscleWiki MCP Info Endpoint
  app.get("/api/musclewiki/mcp", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.json({
      name: "MuscleWiki MCP Integration Server",
      version: "1.0.0",
      description: "Model Context Protocol (MCP) tool server for MuscleWiki exercise database and fitness mechanics",
      tools: [
        {
          name: "get_musclewiki_exercises",
          description: "Search and filter over 1,900 MuscleWiki exercises with HD video demonstrations and step-by-step instructions",
          parameters: {
            category: "string (chest, biceps, triceps, legs, shoulders, back, abs)",
            muscle: "string (target muscle group)",
            equipment: "string (barbell, dumbbell, cable, machine, bodyweight, kettlebell)",
            search: "string (keyword query)"
          }
        },
        {
          name: "get_exercise_details",
          description: "Retrieve comprehensive instructions, execution tips, and GIF links for a specific MuscleWiki exercise"
        }
      ],
      mcpEndpoint: "/api/musclewiki/exercises"
    });
  });

  // Catch-all 404 handler for API routes to prevent Vite SPA fallback HTML response
  app.all("/api/*", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(404).json({ error: `مسیر API یافت نشد: ${req.method} ${req.path}` });
  });

  // Global API Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/")) {
      console.error("Global API Error Handler:", err);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: err.message || "خطای غیرمنتظره در سرور رخ داده است."
      });
    }
    next(err);
  });

  // Determine if running in production mode (compiled CJS in dist or explicit NODE_ENV=production)
  const isCjsBundle = typeof __dirname !== "undefined";
  const appDir = isCjsBundle ? __dirname : process.cwd();
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (isCjsBundle && fs.existsSync(path.join(appDir, "index.html")));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(appDir, "index.html"))
      ? appDir
      : fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : path.join(process.cwd(), "dist");

    console.log(`[Production Server] Serving static build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running and listening on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error(`[Server] Port ${PORT} error:`, err.message);
  });

  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      console.log("Server stopped.");
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 4000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
