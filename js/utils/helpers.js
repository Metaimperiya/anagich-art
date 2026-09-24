/**
 * Общие утилиты: debounce, throttle, querySelector-хелперы, экранирование.
 */

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function debounce(fn, wait = 250) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function throttle(fn, wait = 150) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Экранирование HTML — используется при выводе текстов
 * из внешних источников (поиск, названия картин).
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Slug из строки (для id и т.п.).
 */
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Плавная прокрутка к элементу с учётом высоты навбара.
 */
export function scrollToId(id, offset = 80) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Проверка, что элемент в зоне видимости.
 */
export function isInViewport(el, threshold = 0.15) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= h * (1 - threshold) && rect.bottom >= h * threshold;
}

/**
 * Простое экранирование для data-атрибутов.
 */
export function setDataAttr(el, name, value) {
  if (!el) return;
  if (value === null || value === undefined) el.removeAttribute(`data-${name}`);
  else el.setAttribute(`data-${name}`, value);
}
