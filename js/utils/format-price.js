/**
 * Форматирование цены по валюте.
 * Пример: formatPrice(1000, "USD") → "$1,000"
 *         formatPrice(850, "EUR") → "€850"
 */

const LOCALE_BY_LANG = {
  ru: "ru-RU",
  en: "en-US",
  de: "de-DE",
  da: "da-DK",
  fi: "fi-FI",
  it: "it-IT",
  sv: "sv-SE",
  no: "nb-NO",
  fr: "fr-FR",
  es: "es-ES",
  zh: "zh-CN"
};

export function formatPrice(amount, currency = "USD", lang = "en") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "";
  }

  const locale = LOCALE_BY_LANG[lang] || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    // Fallback если Intl не знает валюту
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

/**
 * Короткий формат для карточки: "$1,000" без пробелов,
 * крупная сумма — округляем вниз до целого.
 */
export function formatPriceShort(amount, currency = "USD", lang = "en") {
  return formatPrice(Math.round(amount), currency, lang);
}

/**
 * "PRICE ON REQUEST" на нужном языке.
 */
export function priceOnRequestLabel(lang = "en") {
  const labels = {
    ru: "Цена по запросу",
    en: "Price on request",
    de: "Preis auf Anfrage",
    da: "Pris på forespørgsel",
    fi: "Hinta pyynnöstä",
    it: "Prezzo su richiesta",
    sv: "Pris på begäran",
    no: "Pris på forespørsel",
    fr: "Prix sur demande",
    es: "Precio a consultar",
    zh: "价格面议"
  };
  return labels[lang] || labels.en;
}
