(function () {
  var STORAGE_KEY = 'kawashiro-dev-storage';
  var LOCALES = ['en', 'es', 'ja'];

  function getLocale() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 'en';
      var parsed = JSON.parse(raw);
      var loc = parsed && parsed.state && parsed.state.locale;
      return LOCALES.indexOf(loc) !== -1 ? loc : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setLocale(locale) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      parsed.state = parsed.state || {};
      parsed.state.locale = locale;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      /* localStorage no disponible: el idioma no persiste, pero la página sigue funcionando */
    }
    document.documentElement.lang = locale;
    applyTranslations();
    updateSwitcherUI();
    document.dispatchEvent(new CustomEvent('kawashiro:localechange', { detail: { locale: locale } }));
  }

  function getDict() {
    var el = document.getElementById('i18n-data');
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return null;
    }
  }

  function resolvePath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  function applyTranslations() {
    var dict = getDict();
    if (!dict) return;
    var locale = getLocale();
    var strings = dict[locale] || dict.en;

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var value = resolvePath(strings, node.getAttribute('data-i18n'));
      if (typeof value === 'string') node.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
      var value = resolvePath(strings, node.getAttribute('data-i18n-placeholder'));
      if (typeof value === 'string') node.setAttribute('placeholder', value);
    });
  }

  function updateSwitcherUI() {
    var current = getLocale();
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      if (btn.getAttribute('data-lang-btn') === current) {
        btn.setAttribute('data-active', 'true');
      } else {
        btn.removeAttribute('data-active');
      }
    });
  }

  function initSwitcher() {
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLocale(btn.getAttribute('data-lang-btn'));
      });
    });
    updateSwitcherUI();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = getLocale();
    applyTranslations();
    initSwitcher();
  });

  window.__kawashiroI18n = {
    getLocale: getLocale,
    setLocale: setLocale,
    getDict: getDict,
    resolvePath: resolvePath,
  };
})();
