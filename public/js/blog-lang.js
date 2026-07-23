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
    // El fallback es POR POST: agrupamos los bloques por su contenedor para
    // que un artículo escrito solo en español siga mostrándose cuando la
    // página está en inglés (antes quedaba en blanco).
    var groups = new Map();
    document.querySelectorAll('[data-blog-lang]').forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (blocks) {
      var langs = blocks.map(function (b) { return b.getAttribute('data-blog-lang'); });
      var effective = langs.indexOf(locale) !== -1
        ? locale
        : (langs.indexOf('en') !== -1 ? 'en' : langs[0]);
      blocks.forEach(function (b) {
        b.style.display = b.getAttribute('data-blog-lang') === effective ? '' : 'none';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(currentLocale());
  });

  document.addEventListener('kawashiro:localechange', function (e) {
    apply(e.detail.locale);
  });
})();
