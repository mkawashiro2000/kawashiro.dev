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

  function apply(theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
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
