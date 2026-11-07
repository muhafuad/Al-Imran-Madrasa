import type { Language, LanguageInfo, Translations } from "./types";
import { en } from "./locales/en";
import { am } from "./locales/am";
import { ar } from "./locales/ar";

export type { Language, LanguageInfo, Translations };

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇬🇧",
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    dir: "ltr",
    flag: "🇪🇹",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
  },
];

export const translations: Record<Language, Translations> = {
  en,
  am,
  ar,
};

export const getLanguageDir = (lang: Language): "ltr" | "rtl" => {
  return lang === "ar" ? "rtl" : "ltr";
};

export const formatTranslation = (
  template: string,
  ...args: (string | number)[]
): string => {
  if (!template) return "";
  return template.replace(/{(\d+)}/g, (match, index) => {
    const num = parseInt(index, 10);
    return typeof args[num] !== "undefined" ? String(args[num]) : match;
  });
};
