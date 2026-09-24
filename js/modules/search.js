/**
 * Поиск по работам: название, категория, техника, описание.
 * Открывается по кнопке searchBtn. Результаты рендерятся в overlay без перезагрузки.
 */

import { artworks } from "../data/artworks.js";
import { t, getLang, onLangChange } from "../i18n/i18n.js";
import { priceToDisplay } from "../currency/currency.js";
import { escapeHtml, debounce } from "../utils/helpers.js";
import { openArtworkModal } from "./artwork-modal.js";

let overlayEl = null;

/* ===== Создание overlay (один раз) ===== */
function ensureOverlay() {
  if (overlayEl) return overlayEl;

  overlayEl = document.createElement("div");
  overlayEl.className = "search-overlay";
  overlayEl.id = "searchOverlay";
  overlayEl.innerHTML = `
    <div class="search-dialog">
      <div class="search-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
        <input type="text" id="searchInput" placeholder="${t("search.placeholder")}" autocomplete="off">
        <button class="search-close" id="searchClose" aria-label="${t("common.close")}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M6 6l12 12M6 18L18 6"/>
          </svg>
        </button>
      </div>
      <div class="search-hint" id="searchHint">${t("search.hint")}</div>
      <div class="search-results" id="searchResults"></div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeSearch();
  });

  const input = overlayEl.querySelector("#searchInput");
  input.addEventListener("input", debounce((e) => performSearch(e.target.value.trim()), 180));

  overlayEl.querySelector("#searchClose")?.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayEl.classList.contains("open")) closeSearch();
    /* Cmd/Ctrl + K — открыть поиск */
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
  });

  return overlayEl;
}

/* ===== Открытие / закрытие ===== */
export function openSearch() {
  ensureOverlay();
  overlayEl.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => overlayEl.querySelector("#searchInput")?.focus(), 150);
}

export function closeSearch() {
  if (!overlayEl) return;
  overlayEl.classList.remove("open");
  document.body.style.overflow = "";
  const input = overlayEl.querySelector("#searchInput");
  if (input) input.value = "";
  performSearch("");
}

/* ===== Поиск ===== */
function performSearch(query) {
  const resultsEl = overlayEl.querySelector("#searchResults");
  const hintEl = overlayEl.querySelector("#searchHint");
  if (!resultsEl) return;

  if (!query) {
    resultsEl.innerHTML = "";
    hintEl.style.display = "block";
    return;
  }

  hintEl.style.display = "none";

  const q = query.toLowerCase();
  const results = artworks.filter(a => {
    return (
      a.title.toLowerCase().includes(q) ||
      a.categoryLabel.toLowerCase().includes(q) ||
      a.technique.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.fullDescription || "").toLowerCase().includes(q)
    );
  });

  if (!results.length) {
    resultsEl.innerHTML = `<div class="search-empty">${t("search.noResults")}</div>`;
    return;
  }

  resultsEl.innerHTML = results.map(a => `
    <div class="search-item" data-id="${a.id}">
      <img src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy">
      <div class="search-item-info">
        <div class="search-item-title">${escapeHtml(a.title)}</div>
        <div class="search-item-meta">${escapeHtml(a.technique)}</div>
        <div class="search-item-price">${a.basePriceUSD ? priceToDisplay(a.basePriceUSD) : t("gallery.priceOnRequest")}</div>
      </div>
    </div>
  `).join("");

  resultsEl.querySelectorAll(".search-item").forEach(item => {
    item.addEventListener("click", () => {
      closeSearch();
      openArtworkModal(item.dataset.id);
    });
  });
}

/* ===== Инициализация ===== */
export function initSearch() {
  ensureOverlay();
  document.getElementById("searchBtn")?.addEventListener("click", openSearch);

  /* Перерисовка placeholder при смене языка */
  onLangChange(() => {
    const input = overlayEl.querySelector("#searchInput");
    if (input) input.placeholder = t("search.placeholder");
  });
}
