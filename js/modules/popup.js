/**
 * Newsletter popup.
 * Показывается:
 *   - через 30 секунд на сайте, ИЛИ
 *   - при попытке уйти со страницы (exit intent на десктопе).
 * НЕ показывается повторно 7 дней после закрытия/подписки.
 */

import { storage, KEYS } from "../utils/storage.js";
import { t, getLang, onLangChange } from "../i18n/i18n.js";
import { artist } from "../data/artist.js";

const SHOW_DELAY_MS = 30 * 1000;
const HIDE_FOR_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

let overlayEl = null;
let showTimer = null;

/* ===== Проверка, нужно ли показывать ===== */
function shouldShow() {
  const lastSeen = storage.get(KEYS.POPUP_SEEN, 0);
  if (!lastSeen) return true;
  return Date.now() - lastSeen > HIDE_FOR_MS;
}

function markSeen() {
  storage.set(KEYS.POPUP_SEEN, Date.now());
}

/* ===== DOM ===== */
function ensureOverlay() {
  if (overlayEl) return overlayEl;

  overlayEl = document.createElement("div");
  overlayEl.className = "popup-overlay";
  overlayEl.id = "newsletterPopup";
  overlayEl.innerHTML = `
    <div class="popup">
      <button class="popup-close" id="popupClose" aria-label="${t("popup.close")}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
      <span class="popup-script">${t("popup.script")}</span>
      <h3>${t("popup.title")}</h3>
      <p>${t("popup.subtitle")}</p>
      <form class="popup-form" id="popupForm">
        <input type="email" id="popupEmail" required placeholder="${t("popup.emailPlaceholder")}">
        <button type="submit">${t("popup.subscribe")}</button>
      </form>
      <div class="popup-socials">
        <a href="${artist.contacts.instagram.url}" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 2c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.4a4.4 4.4 0 110 8.8 4.4 4.4 0 010-8.8zm0 2a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm5.8-2.2a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
        </a>
        <a href="${artist.contacts.telegram.url}" target="_blank" rel="noopener" aria-label="Telegram">
          <svg viewBox="0 0 24 24"><path d="M9.8 15.5l-.4 4.1c.6 0 .9-.3 1.2-.6l2.9-2.8 6 4.4c1.1.6 1.9.3 2.2-1l4-18.8.1-.1c.3-1.5-.5-2.1-1.5-1.7L1.5 9.7c-1.5.6-1.5 1.4-.3 1.8l5.5 1.7L19.4 6c.6-.4 1.1-.2.7.2L9.8 15.5z"/></svg>
        </a>
        <a href="${artist.contacts.whatsapp.url}" target="_blank" rel="noopener" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 2a8 8 0 016.9 12l-.4.7.8 3.1-3.2-.8-.7.4A8 8 0 1112 4zm-3.5 4c-.2 0-.5.1-.7.4-.3.3-.9 1-.9 2s.7 1.9.8 2c.1.2 1.5 2.4 3.7 3.3 1.9.8 2.3.7 2.7.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3l-1.3-.6c-.2-.1-.4-.1-.5.1l-.6.8c-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.6-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3.2-.4.1-.1.1-.3 0-.4l-.6-1.4c-.2-.4-.4-.4-.5-.4h-.5z"/></svg>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closePopup();
  });
  overlayEl.querySelector("#popupClose")?.addEventListener("click", closePopup);

  overlayEl.querySelector("#popupForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = overlayEl.querySelector("#popupEmail").value.trim();
    if (!email) return;

    /* TODO: подключить реальную рассылку (Mailchimp / ConvertKit / Brevo) */
    console.log("[popup] subscribe:", email);
    markSeen();

    /* Показать благодарность */
    const popup = overlayEl.querySelector(".popup");
    popup.innerHTML = `
      <div style="padding:60px 20px;text-align:center;position:relative;z-index:2">
        <span class="popup-script" style="font-size:38px">✓</span>
        <h3 style="margin:14px 0 10px">${t("popup.subscribed")}</h3>
      </div>
    `;
    setTimeout(closePopup, 2200);
  });

  return overlayEl;
}

/* ===== Открытие / закрытие ===== */
export function openPopup() {
  ensureOverlay();
  overlayEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closePopup() {
  if (!overlayEl) return;
  overlayEl.classList.remove("open");
  document.body.style.overflow = "";
  markSeen();
}

/* ===== Инициализация ===== */
export function initPopup() {
  if (!shouldShow()) return;

  /* Отложенный показ через 30 секунд */
  showTimer = setTimeout(() => {
    if (!overlayEl?.classList.contains("open")) openPopup();
  }, SHOW_DELAY_MS);

  /* Exit intent — только на десктопе */
  const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
  if (isDesktop) {
    document.addEventListener("mouseleave", (e) => {
      if (e.clientY <= 0 && shouldShow() && !overlayEl?.classList.contains("open")) {
        clearTimeout(showTimer);
        openPopup();
      }
    });
  }

  /* Обновление текстов при смене языка */
  onLangChange(() => {
    if (overlayEl) {
      const input = overlayEl.querySelector("#popupEmail");
      if (input) input.placeholder = t("popup.emailPlaceholder");
    }
  });
}
