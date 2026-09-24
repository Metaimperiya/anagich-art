/**
 * Точка входа. Инициализирует все модули в правильном порядке.
 * Загружается как ES-модуль: <script type="module" src="js/app.js"></script>
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

async function bootstrap() {
  try {
    /* 1. Применяем переводы к статике HTML */
    applyTranslations();

    /* 2. Загружаем курсы валют (async, но не блокирует рендер) */
    await loadRates();
    await initCurrency();

    /* 3. Рендерим статические секции (about, workshop, contact, footer, exhibitions) */
    renderStaticSections();

    /* 4. Навигация: скролл, dropdowns, бургер, листья */
    initNavigation();

    /* 5. Модули каталога и корзины */
    initGallery();
    initSearch();
    initWishlist();
    initCart();

    /* 6. Popup — с задержкой, чтобы не мешать сразу */
    initPopup();

    /* 7. Убираем прелоадер */
    document.body.classList.add("ready");
  } catch (e) {
    console.error("[app] bootstrap failed", e);
    /* Даже при ошибке показываем сайт */
    document.body.classList.add("ready");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
