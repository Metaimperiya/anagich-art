/**
 * Рендер каталога: сетка карточек, фильтры по категориям, сортировка.
 * Работает с массивом artworks из js/data/artworks.js.
 * Учитывает выбранную валюту и язык.
 */

import { artworks } from "../data/artworks.js";
import { categories } from "../data/categories.js";
import { priceToDisplay } from "../currency/currency.js";
import { t, getLang, onLangChange } from "../i18n/i18n.js";
import { escapeHtml } from "../utils/helpers.js";
import { onCurrencyChange } from "../currency/currency.js";
import { isInWishlist } from "./wishlist.js";
import { openArtworkModal } from "./artwork-modal.js";

let currentCategory = "all";
let currentSort = "featured";
let containerEl = null;

/* ===== Инициализация ===== */
export function initGallery() {
  containerEl = document.getElementById("galleryGrid");
  if (!containerEl) return;

  renderToolbar();
  renderGrid();

  /* Перерисовка при смене языка/валюты */
  onLangChange(() => { renderToolbar(); renderGrid(); });
  onCurrencyChange(() => renderGrid());

  /* Делегирование кликов по карточкам */
  containerEl.addEventListener("click", handleCardClick);
}

/* ===== Toolbar: фильтры + сортировка ===== */
function renderToolbar() {
  const toolbarEl = document.getElementById("catalogToolbar");
  if (!toolbarEl) return;

  const lang = getLang();

  toolbarEl.innerHTML = `
    <div class="filters" id="catalogFilters">
      ${categories.map(c => `
        <button class="filter-btn ${c.id === currentCategory ? "active" : ""}" data-cat="${c.id}">
          ${escapeHtml(lang === "ru" ? c.labelRu : c.label)}
        </button>
      `).join("")}
    </div>
    <div class="sort-wrap">
      <label>${t("gallery.sort")}</label>
      <select class="sort-select" id="catalogSort">
        <option value="featured" ${currentSort === "featured" ? "selected" : ""}>${t("gallery.sortFeatured")}</option>
        <option value="newest"   ${currentSort === "newest"   ? "selected" : ""}>${t("gallery.sortNewest")}</option>
        <option value="name"     ${currentSort === "name"     ? "selected" : ""}>${t("gallery.sortNameAsc")}</option>
        <option value="priceAsc" ${currentSort === "priceAsc" ? "selected" : ""}>${t("gallery.sortPriceLow")}</option>
        <option value="priceDesc"${currentSort === "priceDesc"? "selected" : ""}>${t("gallery.sortPriceHigh")}</option>
      </select>
    </div>
  `;

  toolbarEl.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.cat;
      toolbarEl.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
      renderGrid();
    });
  });

  const sortSelect = toolbarEl.querySelector("#catalogSort");
  sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderGrid();
  });
}

/* ===== Фильтрация и сортировка ===== */
function getFilteredSorted() {
  let list = [...artworks];

  if (currentCategory !== "all") {
    list = list.filter(a => a.category === currentCategory);
  }

  switch (currentSort) {
    case "newest":     list.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
    case "name":       list.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "priceAsc":   list.sort((a, b) => (a.basePriceUSD || 0) - (b.basePriceUSD || 0)); break;
    case "priceDesc":  list.sort((a, b) => (b.basePriceUSD || 0) - (a.basePriceUSD || 0)); break;
    case "featured":
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }
  return list;
}

/* ===== Рендер сетки ===== */
function renderGrid() {
  if (!containerEl) return;
  const list = getFilteredSorted();

  if (!list.length) {
    containerEl.innerHTML = `
      <div class="gallery-empty" style="grid-column:1/-1">
        <span class="script">—</span>
        ${escapeHtml(t("gallery.empty"))}
      </div>`;
    return;
  }

  containerEl.innerHTML = list.map(a => renderCard(a)).join("");
}

function renderCard(a) {
  const media = a.video
    ? `<video src="${a.video}" muted loop playsinline preload="metadata"></video>`
    : `<img src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy">`;

  const price = a.basePriceUSD
    ? priceToDisplay(a.basePriceUSD)
    : `<span style="font-size:13px;letter-spacing:1px;text-transform:uppercase">${t("gallery.priceOnRequest")}</span>`;

  const status = a.status || "available";
  const statusLabel = t(`gallery.status${status.charAt(0).toUpperCase() + status.slice(1).replace("-", "")}`) || status;

  const inWishlist = isInWishlist(a.id);

  return `
    <article class="art-card" data-id="${a.id}">
      <div class="art-media" data-action="open">
        <span class="art-badge">${escapeHtml(a.categoryLabel)}</span>
        <span class="art-status ${status}">${escapeHtml(statusLabel)}</span>
        ${media}
        <button class="art-wish ${inWishlist ? "active" : ""}" data-action="wish" data-id="${a.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z"/></svg>
        </button>
      </div>
      <div class="art-body">
        <h3 class="art-title">${escapeHtml(a.title)}</h3>
        <div class="art-meta">${escapeHtml(a.technique)}</div>
        <p class="art-desc">${escapeHtml(a.description)}</p>
        <div class="art-foot">
          <span class="art-price">${price}</span>
          <span class="art-view" data-action="open">${t("gallery.viewBtn")}</span>
        </div>
      </div>
    </article>
  `;
}

/* ===== Обработка кликов ===== */
async function handleCardClick(e) {
  const wishBtn = e.target.closest('[data-action="wish"]');
  if (wishBtn) {
    e.stopPropagation();
    const { toggleWishlist } = await import("./wishlist.js");
    toggleWishlist(wishBtn.dataset.id);
    wishBtn.classList.toggle("active", isInWishlist(wishBtn.dataset.id));
    return;
  }

  const openTarget = e.target.closest('[data-action="open"]');
  if (openTarget) {
    const card = openTarget.closest(".art-card");
    if (card) openArtworkModal(card.dataset.id);
  }
}

/* ===== Внешний хелпер для перерисовки из других модулей ===== */
export function refreshGallery() {
  renderGrid();
}
