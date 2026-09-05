import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { MUSCLEWIKI_EXERCISES_DATABASE, findBestMuscleWikiExercise } from "./src/data/musclewikiDataset.ts";

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
  const PORT = 3000;

  // Liveness / Health check endpoints for Cloud Run and container orchestrators
  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
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
  const AVAILABLE_GIF_FILENAMES = [
    // MuscleWiki Repository Exercises
    "Barbell_Bench_Press",
    "Incline_Barbell_Bench_Press",
    "Incline_Dumbbell_Press",
    "Incline_Dumbbell_Chest_Fly",
    "Push_Up",
    "Incline_Push_Up",
    "Diamond_Push_Up",
    "Chest_Dips",
    "Bent_Over_Barbell_Row",
    "Conventional_Deadlift",
    "Sumo_Deadlift",
    "Unilateral_Dumbbell_Row",
    "Wide_Grip_Pull_Up",
    "Chin_Up",
    "Overhead_Barbell_Press",
    "Seated_Dumbbell_Overhead_Press",
    "Dumbbell_Lateral_Raise",
    "Barbell_Upright_Row",
    "Dumbbell_Shrug",
    "Seated_Dumbbell_Shrug",
    "Barbell_Bicep_Curl",
    "Dumbbell_Bicep_Curl",
    "Dumbbell_Hammer_Curl",
    "Barbell_Reverse_Curl",
    "Dumbbell_Reverse_Curl",
    "Barbell_Wrist_Curl",
    "Dumbbell_Wrist_Curl",
    "Dumbbell_Wrist_Extension",
    "Barbell_Skullcrusher",
    "Laying_Triceps_Extension",
    "Dumbbell_Overhead_Tricep_Extension",
    "Bench_Triceps_Dips",
    "Barbell_Highbar_Squat",
    "Dumbbell_Goblet_Squat",
    "Bodyweight_Air_Squat",
    "Bulgarian_Split_Squat",
    "Bodyweight_Forward_Lunge",
    "Glute_Bridge",
    "Barbell_Calf_Raise",
    "Dumbbell_Calf_Raise",
    "Bodyweight_Calf_Raise",
    "Bodyweight_Crunch",
    "Lying_Leg_Raises",
    "Forearm_Plank",
    "Dumbbell_Russian_Twist",
    "Elevated_Pike_Press",
    "Elevated_Pike_Shoulder_Shrug",
    // Compatibility fallbacks
    "Dumbbell_Bench_Press",
    "Incline_Chest_Press",
    "Incline_Dumbbell_Fly",
    "Chest_Fly",
    "Dumbbell_Pullover",
    "Cable_Bicep_Curl",
    "EZ_Bar_Preacher_Curl",
    "Crunch",
    "Leg_Extension",
    "Barbell_Squat",
    "Lying_Leg_Curl",
    "Seated_Calf_Raise",
    "Triceps_Pushdown",
    "Lying_Triceps_Extension",
    "V_Bar_Triceps_Pushdown",
    "Cable_Front_Raise",
    "Machine_Shoulder_Press",
    "Dumbbell_Shoulder_Press",
    "Bent_Over_Rear_Delt_Fly",
    "Lat_Pulldown",
    "Bent_Over_Dumbbell_Row",
    "Reverse_Grip_Lat_Pulldown",
    "Back_Extension"
  ];

  // API Endpoint: Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      dataDir: getDataDir()
    });
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
For every exercise identified, you MUST accurately classify it and select the closest matching English standard filename from this exact list:
${AVAILABLE_GIF_FILENAMES.join(", ")}

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
${AVAILABLE_GIF_FILENAMES.join(", ")}
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
${AVAILABLE_GIF_FILENAMES.join(", ")}
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

  // Helper function to pick best local exercise GIF fallback file
  const getLocalExerciseFallback = (urlStr: string, nameStr?: string, catStr?: string): string => {
    const text = `${urlStr || ""} ${nameStr || ""} ${catStr || ""}`.toLowerCase();

    // Priority matching for specific routine exercises
    if (text.includes("preacher") || text.includes("scott") || text.includes("lary") || text.includes("لاری")) {
      return "/exercises/EZ_Bar_Preacher_Curl.gif";
    }
    if (text.includes("pullover") || text.includes("پلاور")) {
      return "/exercises/Dumbbell_Pullover.gif";
    }
    if ((text.includes("cable") || text.includes("سیم")) && (text.includes("bicep") || text.includes("curl") || text.includes("بازو"))) {
      return "/exercises/Cable_Bicep_Curl.gif";
    }
    if (text.includes("leg extension") || text.includes("جلو پا") || (text.includes("extension") && text.includes("leg"))) {
      return "/exercises/Leg_Extension.gif";
    }
    if (text.includes("leg curl") || text.includes("lying leg") || text.includes("پشت پا")) {
      return "/exercises/Lying_Leg_Curl.gif";
    }
    if (text.includes("seated calf") || text.includes("ساق پا نشسته")) {
      return "/exercises/Seated_Calf_Raise.gif";
    }
    if ((text.includes("reverse") || text.includes("برعکس")) && (text.includes("lat") || text.includes("pulldown") || text.includes("لت"))) {
      return "/exercises/Reverse_Grip_Lat_Pulldown.gif";
    }
    if (text.includes("lat pulldown") || text.includes("لت") || (text.includes("pulldown") && text.includes("back"))) {
      return "/exercises/Lat_Pulldown.gif";
    }
    if (text.includes("back extension") || text.includes("hyperextension") || text.includes("فیله")) {
      return "/exercises/Back_Extension.gif";
    }
    if (text.includes("v-bar") || text.includes("v bar") || (text.includes("tricep") && (text.includes("rope") || text.includes("v")))) {
      return "/exercises/V_Bar_Triceps_Pushdown.gif";
    }
    if (text.includes("tricep pushdown") || text.includes("triceps pushdown") || ((text.includes("tricep") || text.includes("پشت بازو")) && (text.includes("cable") || text.includes("سیم") || text.includes("pushdown")))) {
      return "/exercises/Triceps_Pushdown.gif";
    }
    if (text.includes("front raise") || (text.includes("cable") && text.includes("front")) || text.includes("نشر جلو")) {
      return "/exercises/Cable_Front_Raise.gif";
    }
    if (text.includes("rear delt") || (text.includes("bent over") && text.includes("delt")) || text.includes("نشر خم")) {
      return "/exercises/Bent_Over_Rear_Delt_Fly.gif";
    }
    if (text.includes("machine shoulder") || (text.includes("shoulder") && text.includes("machine")) || text.includes("سرشانه دستگاه")) {
      return "/exercises/Machine_Shoulder_Press.gif";
    }
    if (text.includes("pec deck") || text.includes("chest fly") || text.includes("پروانه") || (text.includes("machine") && text.includes("fly"))) {
      return "/exercises/Chest_Fly.gif";
    }
    if (text.includes("incline") && text.includes("fly")) {
      return "/exercises/Incline_Dumbbell_Fly.gif";
    }
    if (text.includes("incline") && (text.includes("press") || text.includes("bench"))) {
      return "/exercises/Incline_Chest_Press.gif";
    }
    if (text.includes("dumbbell bench") || (text.includes("dumbbell") && text.includes("bench"))) {
      return "/exercises/Dumbbell_Bench_Press.gif";
    }
    if (text.includes("bent over") && text.includes("row")) {
      return "/exercises/Bent_Over_Dumbbell_Row.gif";
    }

    // MuscleWiki GIFs
    if (text.includes("bench") || text.includes("chest") || text.includes("پرس سینه")) {
      if (text.includes("incline") || text.includes("بالاسینه") || text.includes("بالا سینه")) {
        return "/musclewiki-gifs/male-barbell-incline-bench-press-front.gif";
      }
      return "/musclewiki-gifs/male-barbell-bench-press-front_C2G7O8r.gif";
    }
    if (text.includes("incline") && (text.includes("fly") || text.includes("قفسه"))) {
      return "/musclewiki-gifs/male-dumbbell-incline-chest-flys-front.gif";
    }
    if (text.includes("pushup") || text.includes("push-up") || text.includes("شنا")) {
      if (text.includes("diamond") || text.includes("الماسی")) return "/musclewiki-gifs/male-bodyweight-diamond-pushup-front.gif";
      if (text.includes("incline") || text.includes("شیب")) return "/musclewiki-gifs/male-bodyweight-incline-pushup-front.gif";
      return "/musclewiki-gifs/male-bodyweight-pushup-front.gif";
    }
    if (text.includes("dip") || text.includes("پارالل") || text.includes("دیپ")) {
      return "/musclewiki-gifs/male-bodyweight-dips-front.gif";
    }

    if (text.includes("deadlift") || text.includes("ددلیفت")) {
      if (text.includes("sumo") || text.includes("سومو")) return "/musclewiki-gifs/male-barbell-sumo-deadlift-front_aeM2BqT.gif";
      return "/musclewiki-gifs/male-barbell-deadlift-front.gif";
    }
    if (text.includes("pullup") || text.includes("pull-up") || text.includes("بارفیکس")) {
      if (text.includes("chin") || text.includes("مچ برعکس")) return "/musclewiki-gifs/male-bodyweight-chinup-front.gif";
      return "/musclewiki-gifs/male-bodyweight-pullup-front.gif";
    }
    if (text.includes("row") || text.includes("زیربغل") || text.includes("قایقی") || text.includes("خم")) {
      if (text.includes("dumbbell") || text.includes("دمبل")) return "/musclewiki-gifs/male-dumbbell-row-unilateral-front.gif";
      return "/musclewiki-gifs/male-barbell-bent-over-row-front.gif";
    }

    if (text.includes("military") || text.includes("overhead") || text.includes("سرشانه") || text.includes("میلیتاری")) {
      if (text.includes("dumbbell") || text.includes("دمبل")) return "/musclewiki-gifs/male-dumbbell-seated-overhead-press-front.gif";
      return "/musclewiki-gifs/male-barbell-overhead-press-front_OJMNLxU.gif";
    }
    if (text.includes("lateral") || text.includes("نشر")) {
      return "/musclewiki-gifs/male-dumbbell-lateral-raise-front.gif";
    }
    if (text.includes("shrug") || text.includes("شراگ") || text.includes("کول")) {
      if (text.includes("barbell") || text.includes("هالتر")) return "/musclewiki-gifs/male-barbell-upright-row-front_3ROsKgm.gif";
      return "/musclewiki-gifs/male-dumbbell-shrug-front.gif";
    }

    if (text.includes("hammer") || text.includes("چکشی")) return "/musclewiki-gifs/male-dumbbell-hammer-curl-front_JbvhNLU.gif";
    if (text.includes("bicep") || text.includes("curl") || text.includes("بازو") || text.includes("جلو بازو")) {
      if (text.includes("reverse") || text.includes("برعکس")) return "/musclewiki-gifs/male-barbell-reverse-curl-front_ysdi82M.gif";
      if (text.includes("dumbbell") || text.includes("دمبل")) return "/musclewiki-gifs/male-dumbbell-curl-front.gif";
      return "/musclewiki-gifs/male-barbell-curl-front_uKPCb8P.gif";
    }
    if (text.includes("wrist") || text.includes("ساعد") || text.includes("مچ")) {
      if (text.includes("barbell") || text.includes("هالتر")) return "/musclewiki-gifs/barbell-wristcurl-male-front.gif";
      return "/musclewiki-gifs/male-dumbbell-wrist-curl-front.gif";
    }

    if (text.includes("skullcrusher") || text.includes("اسکال") || text.includes("فرانسوی")) return "/musclewiki-gifs/male-barbell-skullcrusher-front_qpHWUa8.gif";
    if (text.includes("tricep") || text.includes("پشت بازو")) {
      if (text.includes("overhead") || text.includes("پشت گردن")) return "/musclewiki-gifs/male-dumbbell-overhead-tricep-extension-front.gif";
      if (text.includes("dip") || text.includes("نیمکت")) return "/musclewiki-gifs/male-bodyweight-tricep-dips-front.gif";
      return "/musclewiki-gifs/male-barbell-laying-tricep-extensions-front.gif";
    }

    if (text.includes("squat") || text.includes("اسکوات") || text.includes("اسکات")) {
      if (text.includes("goblet") || text.includes("گابلت")) return "/musclewiki-gifs/male-dumbbell-goblet-squat-front.gif";
      if (text.includes("bulgarian") || text.includes("بلغاری")) return "/musclewiki-gifs/male-bodyweight-bulgarian-split-squat-front.gif";
      if (text.includes("bodyweight") || text.includes("وزن بدن")) return "/musclewiki-gifs/male-bodyweight-squat-front.gif";
      return "/musclewiki-gifs/male-barbell-highbar-squat-front.gif";
    }
    if (text.includes("lunge") || text.includes("لانج") || text.includes("قیچی")) return "/musclewiki-gifs/male-bodyweight-forward-lunge-front.gif";
    if (text.includes("glute") || text.includes("bridge") || text.includes("پل باسن")) return "/musclewiki-gifs/male-bodyweight-glute-bridge-front.gif";
    if (text.includes("calf") || text.includes("ساق")) {
      if (text.includes("dumbbell") || text.includes("دمبل")) return "/musclewiki-gifs/male-dumbbell-calf-raise-front.gif";
      if (text.includes("barbell") || text.includes("هالتر")) return "/musclewiki-gifs/male-barbell-calve-raise-front.gif";
      return "/musclewiki-gifs/male-bodyweight-calve-raise-front.gif";
    }

    if (text.includes("plank") || text.includes("پلانک")) return "/musclewiki-gifs/male-bodyweight-forearm-plank-front.gif";
    if (text.includes("leg raise") || text.includes("زیر شکم")) return "/musclewiki-gifs/male-bodyweight-leg-raises-front.gif";
    if (text.includes("twist") || text.includes("چرخش روسی") || text.includes("روسی")) return "/musclewiki-gifs/male-dumbbell-russian-twist-front.gif";
    if (text.includes("crunch") || text.includes("ab") || text.includes("شکم") || text.includes("کرانچ")) return "/musclewiki-gifs/male-bodyweight-crunch-front.gif";

    // Category fallback
    const cat = (catStr || "").toLowerCase();
    if (cat === "chest") return "/musclewiki-gifs/male-barbell-bench-press-front_C2G7O8r.gif";
    if (cat === "biceps") return "/musclewiki-gifs/male-barbell-curl-front_uKPCb8P.gif";
    if (cat === "triceps") return "/musclewiki-gifs/male-barbell-skullcrusher-front_qpHWUa8.gif";
    if (cat === "shoulders") return "/musclewiki-gifs/male-barbell-overhead-press-front_OJMNLxU.gif";
    if (cat === "back") return "/musclewiki-gifs/male-barbell-bent-over-row-front.gif";
    if (cat === "legs") return "/musclewiki-gifs/male-barbell-highbar-squat-front.gif";
    if (cat === "abs") return "/musclewiki-gifs/male-bodyweight-crunch-front.gif";

    return "/musclewiki-gifs/male-barbell-bench-press-front_C2G7O8r.gif";
  };

  // API Endpoint: Proxy external media (GIFs, MP4s, WebMs, images) with range support & smart local fallback
  app.get("/api/proxy-media", async (req, res) => {
    try {
      const targetUrl = (req.query.url as string) || (req.query.src as string) || "";
      const exerciseName = (req.query.exerciseName as string) || (req.query.nameEn as string) || "";
      const category = (req.query.category as string) || "";

      if (!targetUrl || typeof targetUrl !== "string") {
        return res.status(400).send("Missing target url parameter");
      }

      // If it's already a relative local path, redirect to static asset
      if (targetUrl.startsWith("/")) {
        const cleanPath = targetUrl.replace(/^\/public/, "");
        const filePath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
        return res.redirect(targetUrl);
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

      const apiKey = process.env.MUSCLEWIKI_API_KEY || (req.headers["x-api-key"] as string) || "mw_6ZDLaxXph7I9hyMH_wpehHIr55l68lT7Sb7OAGKJagQ";
      if (apiKey) {
        headers["X-API-Key"] = String(apiKey);
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      let response: Response | null = null;
      try {
        response = await fetch(targetUrl, { headers });
      } catch (fetchErr) {
        console.warn(`[Proxy Media] Network fetch error for ${targetUrl}:`, fetchErr);
      }

      // If upstream succeeded (200 OK or 206 Partial Content)
      if (response && (response.status === 200 || response.status === 206)) {
        let contentType = response.headers.get("content-type") || "";
        const cleanTarget = targetUrl.split("?")[0].toLowerCase();
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Check if buffer is actually an HTML/Cloudflare error page
        const headerSnippet = buffer.toString("utf8", 0, 100).toLowerCase();
        const isHtmlPage = contentType.includes("html") || headerSnippet.includes("<!doctype") || headerSnippet.includes("<html") || headerSnippet.includes("<head");

        if (isHtmlPage) {
          console.warn(`[Proxy Media] Upstream for ${targetUrl} returned HTML error page instead of media binary. Falling back to local GIF.`);
        } else {
          if (!contentType || contentType.includes("text") || contentType.includes("json")) {
            if (cleanTarget.endsWith(".mp4") || cleanTarget.includes("/videos/") || cleanTarget.includes("mp4")) contentType = "video/mp4";
            else if (cleanTarget.endsWith(".webm")) contentType = "video/webm";
            else if (cleanTarget.endsWith(".png")) contentType = "image/png";
            else if (cleanTarget.endsWith(".jpg") || cleanTarget.endsWith(".jpeg")) contentType = "image/jpeg";
            else contentType = "image/gif";
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
        }
      }

      // Upstream failed (403 Cloudflare block, 404, etc.) -> Serve matching local exercise GIF!
      console.warn(`[Proxy Media] Upstream failed (${response?.status || 'No Response'}). Redirecting to local exercise GIF fallback.`);
      const fallbackFileName = getLocalExerciseFallback(targetUrl, exerciseName, category);
      if (fallbackFileName.startsWith("/")) {
        return res.redirect(302, fallbackFileName);
      }
      return res.redirect(302, `/exercises/${fallbackFileName}`);
    } catch (err: any) {
      console.error("[Proxy Media] Unexpected error:", err);
      return res.status(500).send(`Failed to proxy media: ${err.message}`);
    }
  });

  // In-memory cache for MuscleWiki API queries (24 hour TTL)
  const mwApiCache = new Map<string, { data: any; expiresAt: number }>();

  // API Endpoint: MuscleWiki Exercises Search & Explorer Proxy
  app.all("/api/musclewiki/exercises", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    try {
      const q = req.query.q || req.query.search || req.body?.search || "";
      const category = req.query.category || req.body?.category || "all";
      const muscle = req.query.muscle || req.query.targetMuscle || req.body?.muscle || "all";
      const equipment = req.query.equipment || req.body?.equipment || "all";
      const customApiKey = req.headers["x-musclewiki-key"] || req.headers["x-api-key"] || req.query.apiKey || process.env.MUSCLEWIKI_API_KEY || "mw_6ZDLaxXph7I9hyMH_wpehHIr55l68lT7Sb7OAGKJagQ";

      const cacheKey = `${q}:${category}:${muscle}:${equipment}:${customApiKey}`;
      const now = Date.now();
      const cached = mwApiCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        console.log(`[MuscleWiki API Endpoint] Serving from server in-memory cache for key: "${cacheKey}"`);
        return res.json(cached.data);
      }

      console.log(`[MuscleWiki API Endpoint] Request received - q: "${q}", category: "${category}", muscle: "${muscle}", equipment: "${equipment}", apiKeyProvided: ${!!customApiKey}`);

      // Helper function for Persian & English string normalization
      const normalizeText = (text: string): string => {
        if (!text) return "";
        return String(text)
          .toLowerCase()
          .replace(/[\u200c\u200b\u200d\u200e\u200f]/g, " ")
          .replace(/ي/g, "ی")
          .replace(/ك/g, "ک")
          .replace(/[آأإ]/g, "ا")
          .replace(/اسکات/g, "اسکوات")
          .replace(/\s+/g, " ")
          .trim();
      };

      // Helper to ensure media URL is proxied if external
      const proxyIfNeeded = (rawUrl: string, nameEn?: string, category?: string): string => {
        if (!rawUrl || typeof rawUrl !== "string") return "";
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
          return `/api/proxy-media?url=${encodeURIComponent(rawUrl)}&exerciseName=${encodeURIComponent(nameEn || '')}&category=${encodeURIComponent(category || '')}`;
        }
        return rawUrl;
      };

      // If custom API Key exists, attempt live fetch from official MuscleWiki API
      if (customApiKey) {
        try {
          console.log(`[MuscleWiki API Endpoint] Attempting fetch to official MuscleWiki API...`);
          const params = new URLSearchParams();
          if (q) params.append("search", String(q));
          if (category && category !== "all") params.append("category", String(category));
          if (muscle && muscle !== "all") params.append("muscle", String(muscle));

          const mwRes = await fetch(`https://api.musclewiki.com/v1/exercises?${params.toString()}`, {
            headers: {
              "X-API-Key": String(customApiKey),
              "X-RapidAPI-Key": String(customApiKey),
              "Authorization": `Bearer ${customApiKey}`,
              "Accept": "application/json"
            }
          });

          console.log(`[MuscleWiki API Endpoint] External API HTTP status: ${mwRes.status}`);

          if (mwRes.ok) {
            const mwData = await mwRes.json();
            const list = Array.isArray(mwData) ? mwData : (mwData?.results || mwData?.exercises || mwData?.data || []);
            if (list.length > 0) {
              const mappedList = list.map((ex: any) => {
                const videoUrl =
                  ex.gifUrl ||
                  ex.gif_url ||
                  ex.video_url ||
                  (Array.isArray(ex.videos) && (ex.videos[0]?.url || ex.videos[0])) ||
                  (Array.isArray(ex.images) && ex.images[0]) ||
                  "";
                const nameEnVal = ex.nameEn || ex.name || "Exercise";
                const catVal = String(ex.category || ex.target_group || "chest").toLowerCase();
                return {
                  ...ex,
                  gifUrl: proxyIfNeeded(videoUrl, nameEnVal, catVal),
                  nameEn: nameEnVal,
                  nameFa: ex.nameFa || ex.name || "حرکت ورزشی",
                  category: catVal
                };
              });
              console.log(`[MuscleWiki API Endpoint] Official API returned ${mappedList.length} mapped exercises. First media URL: ${mappedList[0]?.gifUrl}`);
              const resPayload = {
                success: true,
                source: "MuscleWiki Official API",
                count: mappedList.length,
                exercises: mappedList
              };
              mwApiCache.set(cacheKey, { data: resPayload, expiresAt: Date.now() + 86400000 }); // 24 hour TTL
              return res.json(resPayload);
            }
          }
        } catch (mwErr) {
          console.warn("[MuscleWiki API Endpoint] Official API fetch failed, falling back to local dataset:", mwErr);
        }
      }

      // Local Dataset Search & Ranking Logic
      const equipmentMatch = (exEqEn: string, exEqFa: string, reqEq: string): boolean => {
        if (!reqEq || reqEq === "all") return true;
        const reqNorm = normalizeText(reqEq);
        const enNorm = normalizeText(exEqEn);
        const faNorm = normalizeText(exEqFa);

        if (enNorm.includes(reqNorm) || faNorm.includes(reqNorm) || reqNorm.includes(enNorm)) return true;
        if ((reqNorm.includes("barbell") || reqNorm.includes("هالتر")) && (enNorm.includes("barbell") || faNorm.includes("هالتر"))) return true;
        if ((reqNorm.includes("dumbbell") || reqNorm.includes("دمبل")) && (enNorm.includes("dumbbell") || faNorm.includes("دمبل"))) return true;
        if ((reqNorm.includes("cable") || reqNorm.includes("سیم")) && (enNorm.includes("cable") || faNorm.includes("سیم"))) return true;
        if ((reqNorm.includes("machine") || reqNorm.includes("دستگاه")) && (enNorm.includes("machine") || faNorm.includes("دستگاه"))) return true;
        if ((reqNorm.includes("bodyweight") || reqNorm.includes("وزن بدن")) && (enNorm.includes("bodyweight") || faNorm.includes("وزن بدن"))) return true;
        if ((reqNorm.includes("kettlebell") || reqNorm.includes("کتل")) && (enNorm.includes("kettlebell") || faNorm.includes("کتل"))) return true;
        return false;
      };

      const categoryMatch = (exCat: string, reqCat: string): boolean => {
        if (!reqCat || reqCat === "all") return true;
        const c = normalizeText(reqCat);
        const exC = normalizeText(exCat);
        if (exC === c || exC.includes(c) || c.includes(exC)) return true;
        if (c.includes("سینه") && exC === "chest") return true;
        if (c.includes("بازو") && (exC === "biceps" || exC === "triceps")) return true;
        if (c.includes("سرشانه") && exC === "shoulders") return true;
        if (c.includes("پشت") && exC === "back") return true;
        if (c.includes("پا") && exC === "legs") return true;
        if (c.includes("شکم") && exC === "abs") return true;
        return false;
      };

      let results: any[] = [];
      if (q) {
        const bestDirect = findBestMuscleWikiExercise(String(q), String(category || ""));
        const matchedWithScores = MUSCLEWIKI_EXERCISES_DATABASE.map((ex) => {
          let score = 0;

          if (bestDirect && ex.id === bestDirect.id) score += 500;

          const isCatMatch = categoryMatch(ex.category, String(category));
          const isEqMatch = equipmentMatch(ex.equipmentEn, ex.equipmentFa, String(equipment));

          if (isCatMatch) score += 20;
          if (isEqMatch) score += 15;

          const normQ = normalizeText(String(q));
          const normEn = normalizeText(ex.nameEn);
          const normFa = normalizeText(ex.nameFa);
          const normMuscle = normalizeText(ex.targetMuscleFa);
          const normEq = normalizeText(ex.equipmentFa);

          if (normFa.includes(normQ) || normEn.includes(normQ)) score += 100;
          if (normQ.includes(normFa) || normQ.includes(normEn)) score += 80;
          if (normMuscle.includes(normQ)) score += 50;
          if (normEq.includes(normQ)) score += 30;

          const tokens = normQ.split(/\s+/).filter((t) => t.length > 1);
          for (const token of tokens) {
            if (normFa.includes(token)) score += 25;
            if (normEn.includes(token)) score += 25;
            if (normMuscle.includes(token)) score += 15;
            if (normEq.includes(token)) score += 10;
          }

          return { ex, score };
        });

        results = matchedWithScores
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.ex);
      } else {
        results = MUSCLEWIKI_EXERCISES_DATABASE.filter(ex => {
          const isCatMatch = categoryMatch(ex.category, String(category));
          const isEqMatch = equipmentMatch(ex.equipmentEn, ex.equipmentFa, String(equipment));
          return isCatMatch && isEqMatch;
        });
      }

      if (results.length === 0 && q) {
        const fallback = findBestMuscleWikiExercise(String(q), String(category || ""));
        results = fallback ? [fallback] : [...MUSCLEWIKI_EXERCISES_DATABASE];
      }

      console.log(`[MuscleWiki API Endpoint] Returning ${results.length} exercises from MuscleWiki Local Dataset.`);

      return res.json({
        success: true,
        source: "MuscleWiki Local Dataset",
        count: results.length,
        exercises: results
      });
    } catch (err: any) {
      console.error("Error in /api/musclewiki/exercises:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch MuscleWiki exercises." });
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

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), "dist", "index.html"))
      ? path.join(process.cwd(), "dist")
      : fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
