export type AiProvider = 'gemini' | 'openai_compatible';

export interface CustomAiConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}

export const PRESETS: {
  id: string;
  nameFa: string;
  provider: AiProvider;
  baseUrl: string;
  defaultModel: string;
}[] = [
  {
    id: 'gemini',
    nameFa: 'Google Gemini (کلید رسمی گوگل)',
    provider: 'gemini',
    baseUrl: '',
    defaultModel: 'gemini-3.6-flash'
  },
  {
    id: 'openai',
    nameFa: 'OpenAI (GPT-4o / GPT-4o-mini)',
    provider: 'openai_compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: 'deepseek',
    nameFa: 'DeepSeek API (دیپ‌سیک V3 / R1)',
    provider: 'openai_compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat'
  },
  {
    id: 'openrouter',
    nameFa: 'OpenRouter (دسترسی یکجا به همه مدل‌ها)',
    provider: 'openai_compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash'
  },
  {
    id: 'groq',
    nameFa: 'Groq (سرعت فوق‌العاده Llama / Qwen)',
    provider: 'openai_compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile'
  },
  {
    id: 'ollama',
    nameFa: 'Ollama (مدل محلی روی کامپیوتر/سرور)',
    provider: 'openai_compatible',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2'
  },
  {
    id: 'custom',
    nameFa: 'سفارشی / Cursor Proxy / vLLM / LMStudio',
    provider: 'openai_compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini'
  }
];

export const DEFAULT_AI_CONFIG: CustomAiConfig = {
  provider: 'gemini',
  apiKey: '',
  baseUrl: '',
  modelName: 'gemini-3.6-flash'
};

export function getCustomAiConfig(): CustomAiConfig {
  try {
    const saved = localStorage.getItem('custom_ai_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || 'gemini',
        apiKey: parsed.apiKey || '',
        baseUrl: parsed.baseUrl || '',
        modelName: parsed.modelName || 'gemini-3.6-flash'
      };
    }
  } catch (err) {
    console.error('Error reading custom_ai_config:', err);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveCustomAiConfig(config: CustomAiConfig): void {
  try {
    localStorage.setItem('custom_ai_config', JSON.stringify(config));
  } catch (err) {
    console.error('Error saving custom_ai_config:', err);
  }
}
