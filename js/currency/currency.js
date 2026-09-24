/**
 * Конвертер валют + UI (dropdown + сохранение выбора).
 * Базовая валюта — USD. При конвертации: amount * rate.
 *
 * Использование:
 *   import { convert, setCurrency, getCurrency, onCurrencyChange } from "./currency.js";
 *   convert(1000) → сумма в выбранной валюте
 */

import { storage, KEYS } from "../utils/storage.js";
import { loadRates, getRate, getLastUpdate, onRatesUpdate } from "./rates.js";
import { formatPrice, priceOnRequestLabel } from "../utils/format-price.js";
import { getLang } from "../i18n/i18n.js";

/* Список валют с группировкой */
export const CURRENCIES = [
  /* Popular */
  { code: "USD", symbol: "$",   label: "US Dollar",        group: "Popular" },
  { code: "EUR", symbol: "€",   label: "Euro",             group: "Popular" },
  { code: "GBP", symbol: "£",   label: "British Pound",    group: "Popular" },
  /* Europe */
  { code: "CHF", symbol: "CHF", label: "Swiss Franc",      group: "Europe" },
  { code: "SEK", symbol: "kr",  label: "Swedish Krona",    group: "Europe" },
  { code: "NOK", symbol: "kr",  label: "Norwegian Krone",  group: "Europe" },
  { code: "DKK", symbol: "kr",  label: "Danish Krone",     group: "Europe" },
  { code: "PLN", symbol: "zł",  label: "Polish Złoty",     group: "Europe" },
  { code: "CZK", symbol: "Kč",  label: "Czech Koruna",     group: "Europe" },
  { code: "UAH", symbol: "₴",   label: "Ukrainian Hryvnia",group: "Europe" },
  /* Americas */
  { code: "CAD", symbol: "C$",  label: "Canadian Dollar",  group: "Americas" },
  /* Asia / Other */
  { code: "AUD", symbol: "A$",  label: "Australian Dollar",group: "Other" },
  { code: "JPY", symbol: "¥",   label: "Japanese Yen",     group: "Asia" },
  { code: "CNY", symbol: "¥",   label: "Chinese Yuan",     group: "Asia" }
];

/* ===== Текущее состояние ===== */
let currentCurrency = storage.get(KEYS.CURRENCY, "USD");
if (!CURRENCIES.find(c => c.code === currentCurrency)) currentCurrency = "USD";

const listeners = new Set();

/**
 * Получить выбранную валюту.
 */
export function getCurrency() {
  return currentCurrency;
}

/**
 * Получить информацию о валюте (symbol, label).
 */
export function getCurrencyInfo(code = currentCurrency) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

/**
 * Конвертация: 1000 USD → сумма в текущей валюте.
 * Если курс ещё не загружен — вернёт исходное значение (без конверсии),
 * чтобы ничего не сломалось.
 */
export function convert(amountUSD) {
  if (amountUSD === null || amountUSD === undefined) return null;
  const rate = getRate(currentCurrency);
  return amountUSD * rate;
}

/**
 * Форматирование цены с учётом текущей валюты и языка.
 */
export function priceToDisplay(amountUSD) {
  if (amountUSD === null || amountUSD === undefined) {
    return priceOnRequestLabel(getLang());
  }
  const converted = convert(amountUSD);
  return formatPrice(converted, currentCurrency, getLang());
}

/**
 * Установить валюту. Сохраняет в localStorage, уведомляет подписчиков.
 */
export function setCurrency(code) {
  if (!CURRENCIES.find(c => c.code === code)) return;
  currentCurrency = code;
  storage.set(KEYS.CURRENCY, code);
  updateCurrencyBtn();
  listeners.forEach(fn => fn(code));
}

/**
 * Подписка на смену валюты.
 */
export function onCurrencyChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ===== Рендер дропдауна ===== */
export function renderCurrencyMenu(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = "";

  const groups = {};
  CURRENCIES.forEach(c => {
    if (!groups[c.group]) groups[c.group] = [];
    groups[c.group].push(c);
  });

  Object.keys(groups).forEach(groupName => {
    const label = document.createElement("li");
    label.className = "group-label";
    label.textContent = groupName;
    containerEl.appendChild(label);

    groups[groupName].forEach(curr => {
      const li = document.createElement("li");
      li.dataset.currency = curr.code;
      if (curr.code === currentCurrency) li.classList.add("active");
      li.innerHTML = `<span>${curr.code} — ${curr.symbol}</span>`;
      li.addEventListener("click", () => {
        setCurrency(curr.code);
        closeDropdown(containerEl);
      });
      containerEl.appendChild(li);
    });
  });

  /* Подпись с датой обновления курса */
  const lastUpd = getLastUpdate();
  if (lastUpd) {
    const info = document.createElement("li");
    info.className = "group-label";
    info.style.fontSize = "9.5px";
    info.style.opacity = "0.7";
    info.textContent = "Rates: " + lastUpd.toLocaleString();
    containerEl.appendChild(info);
  }
}

function closeDropdown(containerEl) {
  const parent = containerEl.closest(".dropdown");
  if (parent) parent.classList.remove("open");
}

/* ===== Обновление надписи в кнопке ===== */
export function updateCurrencyBtn() {
  const btn = document.getElementById("currencyCurrent");
  if (!btn) return;
  const info = getCurrencyInfo();
  btn.textContent = `${info.code} ${info.symbol}`;
}

/* ===== Инициализация модуля ===== */
export async function initCurrency() {
  await loadRates();
  updateCurrencyBtn();

  const menu = document.getElementById("currencyMenu");
  if (menu) renderCurrencyMenu(menu);

  /* При обновлении курсов — обновляем UI (если нужно) */
  onRatesUpdate(() => {
    updateCurrencyBtn();
    listeners.forEach(fn => fn(currentCurrency));
  });
}
