/**
 * Модальное окно картины: большое изображение, характеристики, цена,
 * кнопки BUY / Wishlist / Share. Открывается по клику на карточку.
 */

import { getArtworkById } from "../data/artworks.js";
import { priceToDisplay } from "../currency/currency.js";
import { t, getLang } from "../i18n/i18n.js";
import { escapeHtml, scrollToId } from "../utils/helpers.js";
import { addToCart } from "./cart.js";
import { toggleWishlist, isInWishlist } from "./wishlist.js";

let modalEl = null;
let currentArtwork = null;

/* ===== Создание DOM модалки (один раз) ===== */
function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.className = "artwork-modal";
  modalEl.id = "artworkModal";
  modalEl.innerHTML = `
    <div class="artwork-dialog">
      <button class="artwork-close" id="artworkClose" aria-label="${t("artwork.close")}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
      <div class="artwork-media" id="artworkMedia"></div>
      <div class="artwork-info" id="artworkInfo"></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeArtworkModal();
  });
  modalEl.querySelector("#artworkClose")?.addEventListener("click", closeArtworkModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("open")) closeArtworkModal();
  });

  return modalEl;
}

/* ===== Открытие модалки ===== */
export function openArtworkModal(id) {
  const artwork = getArtworkById(id);
  if (!artwork) return;
  currentArtwork = artwork;

  ensureModal();
  renderMedia(artwork);
  renderInfo(artwork);

  modalEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

/* ===== Закрытие ===== */
export function closeArtworkModal() {
  if (!modalEl) return;
  modalEl.classList.remove("open");
  document.body.style.overflow = "";
  currentArtwork = null;
}

/* ===== Левая часть — изображение / видео ===== */
function renderMedia(a) {
  const mediaEl = modalEl.querySelector("#artworkMedia");
  const media = a.video
    ? `<video src="${a.video}" controls muted loop playsinline preload="metadata"></video>`
    : `<img src="${a.image}" alt="${escapeHtml(a.title)}">`;

  mediaEl.innerHTML = media;
}

/* ===== Правая часть — информация ===== */
function renderInfo(a) {
  const infoEl = modalEl.querySelector("#artworkInfo");
  const statusKey = `gallery.status${a.status.charAt(0).toUpperCase() + a.status.slice(1)}`;
  const price = a.basePriceUSD
    ? `<span class="artwork-price">${priceToDisplay(a.basePriceUSD)}</span>`
    : `<span class="artwork-price">—</span><span class="artwork-price-note">${t("gallery.priceOnRequest")}</span>`;

  const specs = [];
  specs.push({ label: t("artwork.category"), val: escapeHtml(a.categoryLabel) });
  specs.push({ label: t("artwork.technique"), val: escapeHtml(a.technique) });
  if (a.size) specs.push({ label: t("artwork.size"), val: escapeHtml(a.size) });
  if (a.year) specs.push({ label: t("artwork.year"), val: a.year });
  specs.push({ label: t("artwork.status"), val: escapeHtml(t(statusKey)) });

  const inWishlist = isInWishlist(a.id);

  infoEl.innerHTML = `
    <div class="artwork-cat">${escapeHtml(a.categoryLabel)}</div>
    <h2 class="artwork-title">${escapeHtml(a.title)}</h2>

    <div class="artwork-specs">
      ${specs.map(s => `
        <div class="spec">
          <span class="spec-lbl">${s.label}</span>
          <span class="spec-val">${s.val}</span>
        </div>
      `).join("")}
    </div>

    <p class="artwork-desc">${escapeHtml(a.fullDescription || a.description)}</p>

    <div class="artwork-price-block">${price}</div>

    <div class="artwork-actions">
      <button class="btn btn-primary" id="artworkOrder">${t("artwork.orderBtn")} →</button>
    </div>

    <div class="artwork-mini-actions">
      <button class="mini-action ${inWishlist ? "active" : ""}" id="artworkWish">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z"/></svg>
        <span id="artworkWishLabel">${inWishlist ? t("artwork.wishlistRemove") : t("artwork.wishlistAdd")}</span>
      </button>
      <button class="mini-action" id="artworkShare">
        <svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>
        <span>${t("artwork.share")}</span>
      </button>
    </div>
  `;

  /* Order → добавляем в корзину и показываем уведомление */
  infoEl.querySelector("#artworkOrder")?.addEventListener("click", () => {
    addToCart(a.id);
    /* Скроллим к корзине или открываем её — здесь просто toast через alert */
    /* TODO: открыть корзину */
  });

  /* Wishlist toggle */
  infoEl.querySelector("#artworkWish")?.addEventListener("click", () => {
    toggleWishlist(a.id);
    const active = isInWishlist(a.id);
    const btn = infoEl.querySelector("#artworkWish");
    btn.classList.toggle("active", active);
    infoEl.querySelector("#artworkWishLabel").textContent = active
      ? t("artwork.wishlistRemove")
      : t("artwork.wishlistAdd");
  });

  /* Share */
  infoEl.querySelector("#artworkShare")?.addEventListener("click", async () => {
    const url = `${window.location.origin}${window.location.pathname}#artwork-${a.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: a.title, url }); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        /* Простое уведомление */
        const span = infoEl.querySelector("#artworkShare span");
        const old = span.textContent;
        span.textContent = t("artwork.shareCopied");
        setTimeout(() => { span.textContent = old; }, 2000);
      } catch (e) {}
    }
  });
}
