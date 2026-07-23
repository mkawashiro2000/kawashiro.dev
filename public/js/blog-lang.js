/**
 * blog-lang.js — alterna los bloques [data-blog-lang] según el idioma activo.
 * Se apoya en i18n.js (mismo localStorage y evento kawashiro:localechange).
 */
(function () {
  function currentLocale() {
    if (window.__kawashiroI18n) return window.__kawashiroI18n.getLocale();
    return 'en';
  }

  function apply(locale) {
    var blocks = document.querySelectorAll('[data-blog-lang]');
    var hasLocale = false;
    blocks.forEach(function (el) {
      if (el.getAttribute('data-blog-lang') === locale) hasLocale = true;
    });
    // Si un post no tiene el idioma pedido, cae a inglés
    var effective = hasLocale ? locale : 'en';
    blocks.forEach(function (el) {
      el.style.display = el.getAttribute('data-blog-lang') === effective ? '' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(currentLocale());
  });

  document.addEventListener('kawashiro:localechange', function (e) {
    apply(e.detail.locale);
  });
})();
