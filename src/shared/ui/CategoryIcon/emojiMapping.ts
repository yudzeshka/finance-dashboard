import { categoryIcons } from "./icons";

/** Старые ключи иконок (25) → имена Phosphor. */
export const legacyKeyToName: Record<string, string> = {
  food: "fork-knife",
  salary: "money",
  transport: "car",
  entertainment: "game-controller",
  health: "heartbeat",
  education: "graduation-cap",
  utilities: "lightning",
  rent: "key",
  mortgage: "bank",
  credit_card: "credit-card",
  taxes: "receipt",
  shopping: "shopping-cart",
  gifts: "gift",
  travel: "airplane",
  sports: "basketball",
  pets: "paw-print",
  subscriptions: "arrows-clockwise",
  coffee: "coffee",
  electronics: "device-mobile",
  home: "house",
  kids: "baby",
  business: "briefcase",
  other: "dots-three-circle",
  income: "trend-up",
  expense: "trend-down",
  edit: "pencil-simple",
  delete: "trash",
};

/** Легаси-эмодзи → старый ключ (далее резолвится через legacyKeyToName). */
const emojiToKey: Record<string, string> = {
  "🍔": "food", "🍕": "food", "🍜": "food", "🍰": "food",
  "💰": "salary", "💵": "salary", "🤑": "salary", "💸": "expense",
  "🚗": "transport", "⛽": "transport", "🚌": "transport",
  "✈️": "travel", "✈": "travel",
  "🎉": "entertainment", "🎮": "entertainment", "🎬": "entertainment", "🎵": "entertainment",
  "💪": "health", "❤️": "health", "🩺": "health", "💊": "health",
  "🎓": "education", "📚": "education", "✏️": "education", "📖": "education",
  "🔌": "utilities", "💡": "utilities", "💧": "utilities", "⚡": "utilities",
  "🏠": "home", "🏡": "home",
  "💳": "credit_card", "🧾": "taxes", "📄": "taxes",
  "🛍️": "shopping", "🛒": "shopping", "👕": "shopping",
  "🎁": "gifts",
  "🏋️": "sports", "⚽": "sports", "🏀": "sports", "🏃": "sports",
  "🐾": "pets", "🐶": "pets", "🐱": "pets",
  "🔄": "subscriptions", "🔁": "subscriptions",
  "☕": "coffee",
  "📱": "electronics", "💻": "electronics", "🖥️": "electronics",
  "🧸": "kids", "👶": "kids",
  "💼": "business", "📈": "business",
  "📌": "other", "🔖": "other", "⭐": "other", "🙂": "other",
};

/**
 * Резолвит сырое значение `category.icon` в имя иконки Phosphor.
 * Порядок: имя Phosphor → старый ключ → эмодзи → fallback.
 */
export function resolveIconKey(raw: string | undefined | null): string {
  if (!raw) return "dots-three-circle";
  if (raw in categoryIcons) return raw;
  if (raw in legacyKeyToName) return legacyKeyToName[raw];
  if (raw in emojiToKey) return legacyKeyToName[emojiToKey[raw]] ?? "dots-three-circle";
  return "dots-three-circle";
}
