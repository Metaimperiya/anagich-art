/**
 * Хедер: скролл, dropdowns (язык, валюта), бургер-меню,
 * плавный скролл по ссылкам, падающие листья.
 */

import { t, getLang, setLang, onLangChange, availableLanguages } from "../i18n/i18n.js";
import { renderCurrencyMenu, updateCurrencyBtn, onCurrencyChange, getCurrency, setCurrency, CURRENCIES } from "../currency/currency.js";
import { scrollToId } from "../utils/helpers.js";

/* ===== Скролл-эффект на хедере ===== */
export function initNavScroll() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ===== Dropdowns ===== */
export function initDropdowns() {
  document.querySelectorAll(".dropdown").forEach(dd => {
    const btn = dd.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = dd.classList.contains("open");
      document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
      if (!wasOpen) dd.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
  });
}

/* ===== Языковое меню ===== */
export function initLangMenu() {
  const menu = document.getElementById("langMenu");
  const currentLabel = document.getElementById("langCurrent");
  if (!menu) return;

  const render = () => {
    const lang = getLang();
    menu.innerHTML = availableLanguages.map(l => `
      <li data-lang="${l.code}" class="${l.code === lang ? "active" : ""}">
        <span>${l.flag} ${l.label}</span>
      </li>
    `).join("");

    menu.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", async () => {
        await setLang(li.dataset.lang);
        menu.closest(".dropdown")?.classList.remove("open");
      });
    });

    if (currentLabel) {
      const info = availableLanguages.find(l => l.code === lang);
      currentLabel.textContent = info ? info.short : "RU";
    }
  };

  render();
  onLangChange(render);
}

/* ===== Меню валют ===== */
export function initCurrencyMenu() {
  const menu = document.getElementById("currencyMenu");
  if (!menu) return;
  renderCurrencyMenu(menu);
  onCurrencyChange(() => renderCurrencyMenu(menu));
}

/* ===== Бургер-меню ===== */
export function initBurger() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("navMenu");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    menu.classList.toggle("mobile-open");
    document.body.style.overflow = menu.classList.contains("mobile-open") ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("mobile-open");
      document.body.style.overflow = "";
    });
  });
}

/* ===== Плавный скролл по якорям ===== */
export function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    scrollToId(id, 80);
  });
}

/* ===== Падающие листья ===== */
export function initLeaves() {
  const layer = document.getElementById("leavesLayer");
  if (!layer) return;

  /* Отключаем на страницах каталога/магазина — не мешать */
  if (document.body.dataset.page === "catalog") return;

  const leaves = ["🍁", "🍂", "🍁", "🍁", "🍂"];
  const count = window.innerWidth < 640 ? 10 : 16;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "leaf";
    el.textContent = leaves[Math.floor(Math.random() * leaves.length)];
    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = (18 + Math.random() * 20) + "px";
    el.style.animationDuration = (9 + Math.random() * 10) + "s";
    el.style.animationDelay = (-Math.random() * 18) + "s";
    el.style.opacity = 0.55 + Math.random() * 0.35;
    layer.appendChild(el);
  }
}

/* ===== Обработчик скролла вверх при клике на лого ===== */
export function initLogoScroll() {
  document.querySelector(".logo")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===== Общий инициализатор ===== */
export function initNavigation() {
  initNavScroll();
  initDropdowns();
  initLangMenu();
  initCurrencyMenu();
  initBurger();
  initSmoothScroll();
  initLeaves();
  initLogoScroll();
}
