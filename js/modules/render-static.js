/**
 * Рендер статических секций: About, Workshop, Contact, Footer, Exhibitions.
 * Вынесено в отдельный модуль, чтобы app.js оставался чистым.
 */

import { artist } from "../data/artist.js";
import { t, getLang } from "../i18n/i18n.js";
import { escapeHtml } from "../utils/helpers.js";

export function renderStaticSections() {
  renderAbout();
  renderWorkshop();
  renderExhibitions();
  renderContact();
  renderFooter();
  renderArtistContactsInFooter();
}

/* ===== ABOUT ===== */
function renderAbout() {
  const el = document.getElementById("aboutContent");
  if (!el) return;
  const lang = getLang();

  el.innerHTML = `
    <div class="about-grid">
      <div class="about-photo reveal">
        <div class="about-photo-img">
          <img src="${artist.photo}" alt="${escapeHtml(artist.name)}">
        </div>
      </div>
      <div class="about-text reveal d1">
        <h3>${t("about.title")}</h3>
        <div class="role">${t("about.role")}</div>
        <p class="lead">${escapeHtml(artist.quote[lang] || artist.quote.ru)}</p>
        <p>${escapeHtml(artist.bio[lang] || artist.bio.ru)}</p>
        <p>${escapeHtml(artist.philosophy[lang] || artist.philosophy.ru)}</p>
        <div class="about-quote">
          ${escapeHtml(artist.quote[lang] || artist.quote.ru)}
          <span class="script">— ${artist.name}</span>
        </div>
      </div>
    </div>
  `;
}

/* ===== WORKSHOP ===== */
function renderWorkshop() {
  const el = document.getElementById("workshopContent");
  if (!el) return;
  const lang = getLang();
  const w = artist.workshop;
  const features = (w.features[lang] || w.features.ru);

  el.innerHTML = `
    <div class="workshop-inner">
      <div class="reveal">
        <span class="script">${t("workshop.script")}</span>
        <h2>${escapeHtml(w.title[lang] || w.title.ru)}</h2>
        <p>${escapeHtml(w.description[lang] || w.description.ru)}</p>
        <div class="workshop-info">
          <div class="wi"><span class="ic">📅</span><span class="lbl">${t("workshop.date")}</span><span class="val">${escapeHtml(w.date)}</span></div>
          <div class="wi"><span class="ic">🕙</span><span class="lbl">${t("workshop.time")}</span><span class="val">${escapeHtml(w.time)}</span></div>
          <div class="wi"><span class="ic">📍</span><span class="lbl">${t("workshop.place")}</span><span class="val">${escapeHtml(w.place)}</span></div>
        </div>
        <ul class="workshop-features">
          ${features.map(f => `<li>${escapeHtml(f)}</li>`).join("")}
        </ul>
        <a href="${w.bookingUrl}" target="_blank" rel="noopener" class="btn btn-primary">${t("workshop.bookBtn")}</a>
      </div>
      <div class="workshop-visual reveal d2">
        <img src="${w.poster}" alt="${escapeHtml(w.title[lang] || w.title.ru)}">
      </div>
    </div>
  `;
}

/* ===== EXHIBITIONS (empty state) ===== */
function renderExhibitions() {
  const el = document.getElementById("exhibitionsContent");
  if (!el) return;

  el.innerHTML = `
    <div class="exhibitions-empty">
      <span class="script">coming soon</span>
      <p>${t("nav.exhibitions")} — soon</p>
    </div>
  `;
}

/* ===== CONTACT ===== */
function renderContact() {
  const el = document.getElementById("contactContent");
  if (!el) return;
  const c = artist.contacts;

  el.innerHTML = `
    <div class="contact-grid">
      <div class="contact-left reveal">
        <span class="eyebrow">${t("contact.eyebrow")}</span>
        <h2>${t("contact.title")}</h2>
        <p>${t("contact.subtitle")}</p>
        <div class="contact-list">
          ${contactItemHTML(c.telegram, "telegram")}
          ${contactItemHTML(c.instagram, "instagram")}
          ${contactItemHTML(c.whatsapp, "whatsapp")}
        </div>
      </div>
      <div class="contact-right reveal d2">
        <h3>${t("contact.formTitle")}</h3>
        <p class="sub">${t("contact.formSubtitle")}</p>
        <form id="contactForm">
          <div class="field">
            <label>${t("contact.name")}</label>
            <input type="text" required placeholder="${t("contact.namePlaceholder")}">
          </div>
          <div class="field">
            <label>${t("contact.contact")}</label>
            <input type="text" required placeholder="${t("contact.contactPlaceholder")}">
          </div>
          <div class="field">
            <label>${t("contact.message")}</label>
            <textarea required placeholder="${t("contact.messagePlaceholder")}"></textarea>
          </div>
          <button type="submit" class="btn btn-crimson">${t("contact.send")}</button>
        </form>
      </div>
    </div>
  `;

  el.querySelector("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    /* TODO: подключить реальный backend / Formspree / EmailJS */
    alert(t("contact.sent"));
    e.target.reset();
  });
}

function contactItemHTML(contact, type) {
  const icons = {
    telegram: `<svg viewBox="0 0 24 24"><path d="M9.8 15.5l-.4 4.1c.6 0 .9-.3 1.2-.6l2.9-2.8 6 4.4c1.1.6 1.9.3 2.2-1l4-18.8.1-.1c.3-1.5-.5-2.1-1.5-1.7L1.5 9.7c-1.5.6-1.5 1.4-.3 1.8l5.5 1.7L19.4 6c.6-.4 1.1-.2.7.2L9.8 15.5z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 2c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.4a4.4 4.4 0 110 8.8 4.4 4.4 0 010-8.8zm0 2a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm5.8-2.2a1 1 0 11-2 0 1 1 0 012 0z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 2a8 8 0 016.9 12l-.4.7.8 3.1-3.2-.8-.7.4A8 8 0 1112 4zm-3.5 4c-.2 0-.5.1-.7.4-.3.3-.9 1-.9 2s.7 1.9.8 2c.1.2 1.5 2.4 3.7 3.3 1.9.8 2.3.7 2.7.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3l-1.3-.6c-.2-.1-.4-.1-.5.1l-.6.8c-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.6-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3.2-.4.1-.1.1-.3 0-.4l-.6-1.4c-.2-.4-.4-.4-.5-.4h-.5z"/></svg>`
  };
  return `
    <a href="${contact.url}" target="_blank" rel="noopener" class="contact-item">
      <span class="ic">${icons[type]}</span>
      <span class="txt">
        <span class="lbl">${contact.label}</span>
        <span class="val">${contact.value}</span>
      </span>
    </a>
  `;
}

/* ===== FOOTER ===== */
function renderFooter() {
  const el = document.getElementById("footerContent");
  if (!el) return;
  const c = artist.contacts;
  const lang = getLang();

  el.innerHTML = `
    <div class="foot-grid">
      <div class="foot-brand">
        <div class="script">${artist.name}</div>
        <p>${escapeHtml(artist.footer.tagline[lang] || artist.footer.tagline.ru)}</p>
      </div>
      <div class="foot-col">
        <h4>${t("footer.shop")}</h4>
        <a href="#gallery">${t("footer.originalPaintings")}</a>
        <a href="#gallery">${t("footer.fineArtPrints")}</a>
        <a href="#gallery">${t("footer.collections")}</a>
      </div>
      <div class="foot-col">
        <h4>${t("footer.artist")}</h4>
        <a href="#about">${t("footer.about")}</a>
        <a href="#exhibitions">${t("footer.exhibitions")}</a>
        <a href="#workshop">${t("footer.workshop")}</a>
        <a href="#contact">${t("footer.contact")}</a>
      </div>
      <div class="foot-col">
        <h4>${t("footer.social")}</h4>
        <a href="${c.telegram.url}" target="_blank" rel="noopener">${c.telegram.label} · ${c.telegram.value}</a>
        <a href="${c.instagram.url}" target="_blank" rel="noopener">${c.instagram.label} · ${c.instagram.value}</a>
        <a href="${c.whatsapp.url}" target="_blank" rel="noopener">${c.whatsapp.label}</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span id="year"></span> ${artist.name}. ${t("footer.rights")}</span>
      <span>${t("footer.madeWith")} · <a href="${artist.footer.metaimperiyaUrl}" target="_blank" rel="noopener">METAIMPERIYA</a></span>
    </div>
  `;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function renderArtistContactsInFooter() {
  /* Дополнительно, если понадобится */
}
