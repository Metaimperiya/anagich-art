/**
 * Движок мультиязычности.
 * Русский — source language. Все UI-строки в js/i18n/*.js.
 * Контент картин НЕ переводится — он часть произведения.
 */

import { storage, KEYS } from "../utils/storage.js";

import ru from "./ru.js";
import en from "./en.js";

const dictionaries = { ru, en };

/* Языки, которые подгружаются динамически */
const lazyLoaders = {
  de: () => import("./de.js"),
  da: () => import("./da.js"),
  fi: () => import("./fi.js"),
  it: () => import("./it.js"),
  sv: () => import("./sv.js"),
  no: () => import("./no.js"),
  fr: () => import("./fr.js"),
  es: () => import("./es.js")
};

let currentLang = storage.get(KEYS.LANG, "ru");
if (!dictionaries[currentLang]) currentLang = "ru";

const listeners = new Set();

export function getLang() {
  return currentLang;
}

export async function setLang(lang) {
  if (!lang) return;
  if (!dictionaries[lang] && lazyLoaders[lang]) {
    try {
      const mod = await lazyLoaders[lang]();
      dictionaries[lang] = mod.default;
    } catch (e) {
      console.warn(`[i18n] cannot load lang "${lang}"`, e);
      return;
    }
  }
  if (!dictionaries[lang]) {
    console.warn(`[i18n] lang "${lang}" not available`);
    return;
  }
  currentLang = lang;
  storage.set(KEYS.LANG, lang);
  applyTranslations();
  listeners.forEach(fn => fn(lang));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key) {
  const dict = dictionaries[currentLang] || dictionaries.ru;
  const parts = key.split(".");
  let value = dict;
  for (const p of parts) {
    if (value && typeof value === "object" && p in value) value = value[p];
    else return key;
  }
  return typeof value === "string" ? value : key;
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key));
  });

  root.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (!key) return;
    el.setAttribute("aria-label", t(key));
  });

  document.documentElement.setAttribute("lang", currentLang);
}

export const availableLanguages = [
  { code: "ru", label: "Русский",  short: "RU", flag: "🇷🇺" },
  { code: "en", label: "English",  short: "EN", flag: "🇬🇧" },
  { code: "de", label: "Deutsch",  short: "DE", flag: "🇩🇪" },
  { code: "da", label: "Dansk",    short: "DA", flag: "🇩🇰" },
  { code: "fi", label: "Suomi",    short: "FI", flag: "🇫🇮" },
  { code: "it", label: "Italiano", short: "IT", flag: "🇮🇹" },
  { code: "sv", label: "Svenska",  short: "SV", flag: "🇸🇪" },
  { code: "no", label: "Norsk",    short: "NO", flag: "🇳🇴" },
  { code: "fr", label: "Français", short: "FR", flag: "🇫🇷" },
  { code: "es", label: "Español",  short: "ES", flag: "🇪🇸" }
];
