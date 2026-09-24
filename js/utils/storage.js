/**
 * Обёртка над localStorage с безопасным fallback.
 * Если localStorage недоступен (приватный режим, старый браузер) —
 * используется in-memory хранилище, сайт не ломается.
 */

const memoryStore = new Map();

function isLocalStorageAvailable() {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

const hasLS = isLocalStorageAvailable();

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = hasLS ? localStorage.getItem(key) : memoryStore.get(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[storage] get failed for key "${key}"`, e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (hasLS) localStorage.setItem(key, raw);
      else memoryStore.set(key, raw);
    } catch (e) {
      console.warn(`[storage] set failed for key "${key}"`, e);
    }
  },

  remove(key) {
    try {
      if (hasLS) localStorage.removeItem(key);
      else memoryStore.delete(key);
    } catch (e) {
      console.warn(`[storage] remove failed for key "${key}"`, e);
    }
  },

  clear() {
    try {
      if (hasLS) localStorage.clear();
      else memoryStore.clear();
    } catch (e) {
      console.warn(`[storage] clear failed`, e);
    }
  }
};

/* ===== Ключи localStorage ===== */
export const KEYS = {
  LANG: "ag_lang",
  CURRENCY: "ag_currency",
  RATES: "ag_rates",
  RATES_DATE: "ag_rates_date",
  WISHLIST: "ag_wishlist",
  CART: "ag_cart",
  POPUP_SEEN: "ag_popup_seen"
};
