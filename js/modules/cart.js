/**
 * Корзина: массив {id, qty} в localStorage.
 * Показывает боковую панель со списком, подытогом и итогом.
 * Оформление заказа — через Telegram/WhatsApp (реальная оплата позже).
 */

import { storage, KEYS } from "../utils/storage.js";
import { getArtworkById } from "../data/artworks.js";
import { priceToDisplay, getCurrency } from "../currency/currency.js";
import { t, getLang, onLangChange } from "../i18n/i18n.js";
import { escapeHtml } from "../utils/helpers.js";
import { onCurrencyChange } from "../currency/currency.js";

let cart = storage.get(KEYS.CART, []);
if (!Array.isArray(cart)) cart = [];

const listeners = new Set();

/* ===== Публичный API ===== */
export function getCart() { return cart.map(i => ({ ...i })); }

export function addToCart(id) {
  if (!id) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  persist();
  notify();
  openCartPanel();
}

export function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  persist();
  notify();
}

export function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  persist();
  notify();
}

export function clearCart() {
  cart = [];
  persist();
  notify();
}

export function onCartChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ===== Хранение ===== */
function persist() { storage.set(KEYS.CART, cart); }

function notify() {
  updateBadge();
  if (panelEl?.classList.contains("open")) renderPanel();
  listeners.forEach(fn => fn(cart));
}

function updateBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const total = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.classList.toggle("active", total > 0);
}

/* ===== Суммы ===== */
function getSubtotalUSD() {
  return cart.reduce((sum, item) => {
    const a = getArtworkById(item.id);
    if (!a || !a.basePriceUSD) return sum;
    return sum + a.basePriceUSD * item.qty;
  }, 0);
}

/* ===== Панель ===== */
let panelEl = null;

function ensurePanel() {
  if (panelEl) return panelEl;

  panelEl = document.createElement("div");
  panelEl.className = "drawer-overlay drawer-right";
  panelEl.id = "cartDrawer";
  panelEl.innerHTML = `
    <aside class="drawer">
      <div class="drawer-head">
        <h3 id="cartDrawerTitle">${t("cart.title")}</h3>
        <button class="drawer-close" id="cartClose" aria-label="${t("common.close")}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
      <div class="drawer-body" id="cartDrawerBody"></div>
      <div class="drawer-foot" id="cartDrawerFoot"></div>
    </aside>
  `;
  document.body.appendChild(panelEl);

  panelEl.addEventListener("click", (e) => {
    if (e.target === panelEl) closeCartPanel();
  });
  panelEl.querySelector("#cartClose")?.addEventListener("click", closeCartPanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panelEl.classList.contains("open")) closeCartPanel();
  });

  return panelEl;
}

export function openCartPanel() {
  ensurePanel();
  renderPanel();
  panelEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closeCartPanel() {
  if (!panelEl) return;
  panelEl.classList.remove("open");
  document.body.style.overflow = "";
}

function renderPanel() {
  const body = panelEl.querySelector("#cartDrawerBody");
  const foot = panelEl.querySelector("#cartDrawerFoot");
  const title = panelEl.querySelector("#cartDrawerTitle");
  if (!body || !foot) return;

  if (title) title.textContent = t("cart.title");

  if (!cart.length) {
    body.innerHTML = `<div class="drawer-empty">${t("cart.empty")}</div>`;
    foot.innerHTML = "";
    return;
  }

  body.innerHTML = cart.map(item => {
    const a = getArtworkById(item.id);
    if (!a) return "";
    const priceStr = a.basePriceUSD ? priceToDisplay(a.basePriceUSD * item.qty) : t("gallery.priceOnRequest");
    return `
      <div class="drawer-item" data-id="${a.id}">
        <img src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy">
        <div class="drawer-item-info">
          <div class="drawer-item-title">${escapeHtml(a.title)}</div>
          <div class="drawer-item-meta">${escapeHtml(a.technique)}</div>
          <div class="drawer-item-price">${priceStr}</div>
          <div class="drawer-item-qty">
            <button data-qty="-1" data-id="${a.id}">−</button>
            <span>${item.qty}</span>
            <button data-qty="1" data-id="${a.id}">+</button>
          </div>
        </div>
        <button class="drawer-item-remove" data-remove="${a.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
    `;
  }).join("");

  const subtotalUSD = getSubtotalUSD();
  const subtotal = subtotalUSD ? priceToDisplay(subtotalUSD) : "—";
  const total = subtotal;

  foot.innerHTML = `
    <div class="cart-row"><span>${t("cart.subtotal")}</span><span>${subtotal}</span></div>
    <div class="cart-row cart-total"><span>${t("cart.total")}</span><span>${total}</span></div>
    <button class="btn btn-primary cart-checkout" id="cartCheckout">${t("cart.checkout")} →</button>
    <p class="cart-note">${t("cart.checkoutNote")}</p>
  `;

  /* Обработчики */
  body.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
  body.querySelectorAll("[data-qty]").forEach(btn => {
    btn.addEventListener("click", () => changeQty(btn.dataset.id, parseInt(btn.dataset.qty, 10)));
  });

  /* Оформление — ведём в Telegram (пока нет реальной оплаты) */
  foot.querySelector("#cartCheckout")?.addEventListener("click", () => {
    const lines = cart.map(item => {
      const a = getArtworkById(item.id);
      if (!a) return "";
      return `• ${a.title} — ${item.qty} шт. (${a.basePriceUSD ? priceToDisplay(a.basePriceUSD * item.qty) : t("gallery.priceOnRequest")})`;
    }).filter(Boolean).join("\n");

    const subtotalStr = subtotalUSD ? priceToDisplay(subtotalUSD) : "—";
    const msg = `Здравствуйте! Хочу оформить заказ:\n\n${lines}\n\nИтого: ${subtotalStr}`;
    const url = `https://t.me/ana_gich?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });
}

/* ===== Инициализация ===== */
export function initCart() {
  updateBadge();
  const btn = document.getElementById("cartBtn");
  btn?.addEventListener("click", openCartPanel);

  onLangChange(() => { if (panelEl?.classList.contains("open")) renderPanel(); });
  onCurrencyChange(() => { if (panelEl?.classList.contains("open")) renderPanel(); });
}
