/**
 * Точка входа.
 */

import { loadRates } from "./currency/rates.js";
import { initCurrency } from "./currency/currency.js";
import { applyTranslations, getLang } from "./i18n/i18n.js";
import { initNavigation } from "./modules/navigation.js";
import { initGallery } from "./modules/gallery.js";
import { initSearch } from "./modules/search.js";
import { initWishlist } from "./modules/wishlist.js";
import { initCart } from "./modules/cart.js";
import { initPopup } from "./modules/popup.js";
import { renderStaticSections } from "./modules/render-static.js";

/* Безопасный вызов — если модуль падает, остальные всё равно работают */
async function safe(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name} ok`);
  } catch (e) {
    console.error(`❌ ${name} failed:`, e);
  }
}

async function bootstrap() {
  console.log("🚀 bootstrap start");

  await safe("applyTranslations", () => applyTranslations());
  await safe("loadRates", () => loadRates());
  await safe("initCurrency", () => initCurrency());
  await safe("renderStaticSections", () => renderStaticSections());
  await safe("initNavigation", () => initNavigation());
  await safe("initGallery", () => initGallery());
  await safe("initSearch", () => initSearch());
  await safe("initWishlist", () => initWishlist());
  await safe("initCart", () => initCart());
  await safe("initPopup", () => initPopup());

  document.body.classList.add("ready");
  console.log("🏁 bootstrap done");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
