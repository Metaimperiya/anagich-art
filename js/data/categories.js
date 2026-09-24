/**
 * Категории работ.
 * Только те, что реально есть среди 11 существующих работ.
 * label — то, что показываем в фильтрах (можно перевести через i18n).
 */

export const categories = [
  { id: "all",          label: "All",              labelRu: "Все" },
  { id: "pop-art",      label: "Pop Art",          labelRu: "Поп-арт" },
  { id: "relief",       label: "Relief / 3D",      labelRu: "Рельеф / 3D" },
  { id: "abstract",     label: "Abstract",         labelRu: "Абстракция" },
  { id: "landscape",    label: "Landscape",        labelRu: "Пейзаж" },
  { id: "fantasy",      label: "Fantasy",          labelRu: "Фэнтези" },
  { id: "miniature",    label: "Miniatures",       labelRu: "Миниатюры" },
  { id: "spiritual",    label: "Spiritual",        labelRu: "Духовное" }
];

/**
 * Хелпер: получить подпись категории для карточки.
 */
export function getCategoryLabel(categoryId, lang = "ru") {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return categoryId;
  return lang === "ru" ? cat.labelRu : cat.label;
}
