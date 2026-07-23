/**
 * theme.js — tema claro/oscuro con preferencia del sistema y toggle manual.
 * - Sin valor guardado: sigue prefers-color-scheme (y sus cambios en vivo).
 * - Con valor guardado ('dark'|'light'): manda el usuario.
 * Inyecta un botón sol/luna junto a cada .lang-switcher de las páginas estáticas.
 */
(function () {
  var KEY = 'kawashiro-theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) {
      return null;
    }
  }

  function current() {
    return stored() || (media.matches ? 'dark' : 'light');
  }

  // Iconos SVG con currentColor: contraste garantizado en ambos temas
  var MOON_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/></svg>';
  var SUN_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';

  function apply(theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, next);
    } catch (e) { /* sin persistencia, pero el toggle funciona */ }
    apply(next);
  }

  // Si el usuario no ha elegido manualmente, seguir los cambios del sistema
  media.addEventListener('change', function () {
    if (!stored()) apply(current());
  });

  window.__kawashiroTheme = { toggle: toggle, current: current };

  document.addEventListener('DOMContentLoaded', function () {
    // Botón junto a los selectores de idioma de las páginas estáticas
    document.querySelectorAll('.lang-switcher').forEach(function (ls) {
      if (ls.parentElement && ls.parentElement.querySelector('[data-theme-toggle]')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-theme-toggle', '');
      btn.className = 'theme-toggle';
      btn.addEventListener('click', toggle);
      ls.insertAdjacentElement('afterend', btn);
    });
    apply(current());
  });
})();
