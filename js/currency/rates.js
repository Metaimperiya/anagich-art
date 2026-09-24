/**
 * Загрузка и кэширование курсов валют.
 * Базовая валюта — USD. Все курсы хранятся как "1 USD = X <валюта>".
 *
 * Источники (по приоритету):
 *   1. localStorage (последние успешно загруженные)
 *   2. API open.er-api.com (бесплатный, без ключа)
 *   3. Fallback-курсы (жёстко вшиты, чтобы сайт работал всегда)
 */

import { storage, KEYS } from "../utils/storage.js";

/* ===== Fallback-курсы (примерные, обновлять периодически) ===== */
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SEK: 10.5,
  DKK: 6.85,
  NOK: 10.7,
  CHF: 0.88,
  PLN: 4.02,
  CZK: 22.8,
  UAH: 41.5,
  CAD: 1.37,
  AUD: 1.52,
  JPY: 152,
  CNY: 7.25
};

/* Максимальный возраст кэша — 12 часов */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/* URL API — бесплатный, без ключа */
const API_URL = "https://open.er-api.com/v6/latest/USD";

let currentRates = null;
let lastUpdate = null;
const listeners = new Set();

/**
 * Загрузить курсы: сначала из localStorage, если свежие — использовать,
 * иначе — фетчить API, при ошибке — fallback.
 * Возвращает объект курсов.
 */
export async function loadRates() {
  const cached = storage.get(KEYS.RATES, null);
  const cachedDate = storage.get(KEYS.RATES_DATE, null);
  const now = Date.now();

  if (cached && cachedDate && now - cachedDate < CACHE_TTL_MS) {
    currentRates = cached;
    lastUpdate = new Date(cachedDate);
    notify();
    return currentRates;
  }

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = await res.json();
    if (!data || !data.rates) throw new Error("Invalid API response");

    /* Оставляем только нужные валюты, чтобы не тащить весь объект */
    const wanted = Object.keys(FALLBACK_RATES);
    const filtered = {};
    wanted.forEach(code => {
      filtered[code] = data.rates[code] || FALLBACK_RATES[code];
    });

    currentRates = filtered;
    lastUpdate = new Date();
    storage.set(KEYS.RATES, filtered);
    storage.set(KEYS.RATES_DATE, now);
    notify();
    return currentRates;
  } catch (e) {
    console.warn("[currency] API unavailable, using cached/fallback", e);
    currentRates = cached || FALLBACK_RATES;
    lastUpdate = cachedDate ? new Date(cachedDate) : new Date();
    notify();
    return currentRates;
  }
}

/**
 * Получить текущий курс: 1 USD = <rate> <currency>.
 */
export function getRate(currencyCode) {
  const rates = currentRates || storage.get(KEYS.RATES, null) || FALLBACK_RATES;
  return rates[currencyCode] || 1;
}

/**
 * Дата/время последнего обновления курсов.
 */
export function getLastUpdate() {
  if (lastUpdate) return lastUpdate;
  const cachedDate = storage.get(KEYS.RATES_DATE, null);
  return cachedDate ? new Date(cachedDate) : null;
}

/**
 * Подписка на обновление курсов.
 */
export function onRatesUpdate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => fn(currentRates, lastUpdate));
}
