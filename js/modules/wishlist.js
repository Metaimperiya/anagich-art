/**
 * Избранное: хранение в localStorage, добавление/удаление, счётчик в хедере.
 * Экспортирует isInWishlist, toggleWishlist, addToWishlist, removeFromWishlist,
 * getWishlist, onWishlistChange, initWishlist.
 */

import { storage, KEYS } from "../utils/storage.js";
import { getArtworkById } from "../data/artworks.js";
import { t, getLang } from "../i18n/i18n.js";
import { escapeHtml } from "../utils/helpers.js";
import { openArtworkModal } from "./artwork-modal.js";

let wishlist = storage.get(KEYS.WISHLIST, []);
if (!Array.isArray(wishlist)) wishlist = [];

const listeners = new Set();

/* ===== Публичный API ===== */
export function getWishlist() { return [...wishlist]; }
export function isInWishlist(id) { return wishlist.includes(id); }

export function addToWishlist(id) {
  if (!id || wishlist.includes(id)) return;
  wishlist.push(id);
  persist();
  notify();
}

export function removeFromWishlist(id) {
  const i = wishlist.indexOf(id);
  if (i === -1) return;
  wishlist.splice(i, 1);
  persist();
  notify();
}

export function toggleWishlist(id) {
  if (isInWishlist(id)) removeFromWishlist(id);
  else addToWishlist(id);
}

export function onWishlistChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ===== Хранение ===== */
function persist() { storage.set(KEYS.WISHLIST, wishlist); }

function notify() {
  updateBadge();
  listeners.forEach(fn => fn(wishlist));
}

/* ===== Счётчик в хедере ===== */
function updateBadge() {
  const badge = document.getElementById("wishlistCount");
  if (!badge) return;
  badge.textContent = wishlist.length;
  badge.classList.toggle("active", wishlist.length > 0);
}

/* ===== Панель wishlist ===== */
let panelEl = null;

function ensurePanel() {
  if (panelEl) return panelEl;

  panelEl = document.createElement("div");
  panelEl.className = "drawer-overlay";
  panelEl.id = "wishlistDrawer";
  panelEl.innerHTML = `
    <aside class="drawer">
      <div class="drawer-head">
        <h3 id="wishlistDrawerTitle">${t("wishlist.title")}</h3>
        <button class="drawer-close" id="wishlistClose" aria-label="${t("common.close")}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
      <div class="drawer-body" id="wishlistDrawerBody"></div>
    </aside>
  `;
  document.body.appendChild(panelEl);

  panelEl.addEventListener("click", (e) => {
    if (e.target === panelEl) closeWishlistPanel();
  });
  panelEl.querySelector("#wishlistClose")?.addEventListener("click", closeWishlistPanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panelEl.classList.contains("open")) closeWishlistPanel();
  });

  return panelEl;
}

export function openWishlistPanel() {
  ensurePanel();
  renderPanel();
  panelEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closeWishlistPanel() {
  if (!panelEl) return;
  panelEl.classList.remove("open");
  document.body.style.overflow = "";
}

function renderPanel() {
  const body = panelEl.querySelector("#wishlistDrawerBody");
  const title = panelEl.querySelector("#wishlistDrawerTitle");
  if (!body) return;

  if (title) title.textContent = t("wishlist.title");

  if (!wishlist.length) {
    body.innerHTML = `<div class="drawer-empty">${t("wishlist.empty")}</div>`;
    return;
  }

  body.innerHTML = wishlist.map(id => {
    const a = getArtworkById(id);
    if (!a) return "";
    return `
      <div class="drawer-item" data-id="${a.id}">
        <img src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy">
        <div class="drawer-item-info">
          <div class="drawer-item-title">${escapeHtml(a.title)}</div>
          <div class="drawer-item-meta">${escapeHtml(a.technique)}</div>
        </div>
        <button class="drawer-item-remove" data-remove="${a.id}" aria-label="${t("cart.remove")}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
    `;
  }).join("");

  body.querySelectorAll(".drawer-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.closest("[data-remove]")) return;
      closeWishlistPanel();
      openArtworkModal(item.dataset.id);
    });
  });
  body.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromWishlist(btn.dataset.remove);
      renderPanel();
    });
  });
}

/* ===== Инициализация ===== */
export function initWishlist() {
  updateBadge();
  const btn = document.getElementById("wishlistBtn");
  btn?.addEventListener("click", openWishlistPanel);

  /* Перерисовка панели при смене языка */
  onWishlistChange(() => {
    if (panelEl?.classList.contains("open")) renderPanel();
  });
}
