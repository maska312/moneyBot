import { EXPENSE_PARSER_SYSTEM_PROMPT } from "./prompts";
import { DEFAULT_CATEGORIES } from "@/lib/db/seed";

export interface ParsedExpense {
  isExpense: boolean;
  amount: number;
  category: string;
  description: string;
  currency: string;
  confidence?: number;
}

export const FALLBACK_CATEGORIES = DEFAULT_CATEGORIES.map((c) => c.name);

// Newest, lowest-cost high-throughput multimodal Gemini model
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/**
 * Fallback deterministic rule-based parser for fast response or when offline
 */
export function parseExpenseRegexFallback(text: string, categoriesList = FALLBACK_CATEGORIES): ParsedExpense {
  const clean = text.trim();
  
  // Try pattern: "500 такси" or "такси 500" or "кофе за 250"
  const amountMatch = clean.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:сом|kgs|с|c)?/i);
  if (!amountMatch) {
    return {
      isExpense: false,
      amount: 0,
      category: "Прочее",
      description: clean,
      currency: "KGS",
    };
  }

  const amount = parseFloat(amountMatch[1].replace(",", "."));
  const remainingText = clean.replace(amountMatch[0], "").trim();

  // Simple keyword matching for common categories
  const lower = clean.toLowerCase();
  let category = "Прочее";

  if (/продукт|народный|глобус|фрунзе|хлеб|молоко|мясо|базар|супермаркет|азия|7 дней|яйца|сыр/i.test(lower)) {
    category = "Продукты";
  } else if (/кофе|кафе|обед|ужин|завтрак|чайхан|нават|бублик|sierra|пицца|бегемот|бургер|ресторан|dodo|доставка|додо/i.test(lower)) {
    category = "Кафе и рестораны";
  } else if (/такси|яндекс|namba|навруз|бензин|газпром|red petroleum|азс|тулпар|автобус|маршрутка|парковка|мойка/i.test(lower)) {
    category = "Такси и транспорт";
  } else if (/дом|аренда|коммуналк|свет|газ|интернет|мебель|бытов|ремонт/i.test(lower)) {
    category = "Дом и быт";
  } else if (/аптек|неман|лекарь|лекарств|врач|бонецк|анализ|таблетк|витамин|стоматолог/i.test(lower)) {
    category = "Здоровье и аптека";
  } else if (/кино|синематик|театр|игры|отдых|иссык-куль|бильярд|боулинг/i.test(lower)) {
    category = "Развлечения и отдых";
  } else if (/детсад|садик|игрушк|памперс|подгузник|школ|детск/i.test(lower)) {
    category = "Дети и семья";
  } else if (/одежд|обувь|дордой|asia mall|bishkek park|косметик|вещи|куртк/i.test(lower)) {
    category = "Одежда и покупки";
  }

  // Ensure category is in available list
  if (!categoriesList.includes(category)) {
    category = "Прочее";
  }

  const description = remainingText || clean;

  return {
    isExpense: true,
    amount,
    category,
    description: description.replace(/^(за|на|в)\s+/i, ""),
    currency: "KGS",
    confidence: 0.8,
  };
}

/**
 * Call Google Gemini API (gemini-3.5-flash-lite / gemini-3.6-flash)
 */
async function callGemini(contents: any[], modelName = DEFAULT_GEMINI_MODEL): Promise<ParsedExpense> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: EXPENSE_PARSER_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: contents,
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    // If model wasn't found, try fallback model gemini-3.6-flash
    if (response.status === 404 && modelName !== "gemini-3.6-flash") {
      console.warn(`Model ${modelName} returned 404, falling back to gemini-3.6-flash`);
      return callGemini(contents, "gemini-3.6-flash");
    }
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(rawText);
  return {
    isExpense: parsed.isExpense ?? true,
    amount: Number(parsed.amount) || 0,
    category: parsed.category || "Прочее",
    description: parsed.description || "Расход",
    currency: "KGS",
    confidence: 0.95,
  };
}

/**
 * Parse text input with Gemini 3.5 Flash Lite (fallback to regex if key missing or on error)
 */
export async function parseExpenseText(text: string, categories = FALLBACK_CATEGORIES): Promise<ParsedExpense> {
  if (!process.env.GEMINI_API_KEY) {
    return parseExpenseRegexFallback(text, categories);
  }

  try {
    return await callGemini([{ text }]);
  } catch (err) {
    console.warn("Gemini parse failed, falling back to regex parser:", err);
    return parseExpenseRegexFallback(text, categories);
  }
}

/**
 * Parse voice audio (OGG/Opus from Telegram or M4A from iOS)
 */
export async function parseExpenseAudio(
  audioBase64: string,
  mimeType = "audio/ogg",
  categories = FALLBACK_CATEGORIES
): Promise<ParsedExpense> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required to transcribe and parse audio messages");
  }

  // Telegram voice notes use audio/ogg or audio/ogg; codecs=opus
  const cleanMime = mimeType.split(";")[0].trim() || "audio/ogg";

  return await callGemini([
    {
      inlineData: {
        mimeType: cleanMime,
        data: audioBase64,
      },
    },
    {
      text: "Извлеки сумму, категорию и описание расхода из этой голосовой записи.",
    },
  ]);
}

/**
 * Parse receipt image (JPEG/PNG photo of a receipt)
 */
export async function parseExpenseImage(
  imageBase64: string,
  mimeType = "image/jpeg",
  categories = FALLBACK_CATEGORIES
): Promise<ParsedExpense> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required to process receipt photos");
  }

  const cleanMime = mimeType.split(";")[0].trim() || "image/jpeg";

  return await callGemini([
    {
      inlineData: {
        mimeType: cleanMime,
        data: imageBase64,
      },
    },
    {
      text: "Найди итоговую сумму чека (Итого/Total), название заведения/магазина и определи категорию расхода.",
    },
  ]);
}
