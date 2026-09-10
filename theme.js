// Apply the saved preference before styles paint, then share it across every page.
(() => {
  const key = 'parametric-space-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  const valid = value => value === 'dark' || value === 'light';
  function apply(value) {
    const theme = valid(value) ? value : system.matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.querySelector('[data-theme-label]').textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }
  apply(preference);
  document.addEventListener('DOMContentLoaded', () => {
    apply(preference);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, preference); } catch {}
        apply(preference);
      });
    });
  });
  system.addEventListener('change', () => { if (!valid(preference)) apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key) { preference = event.newValue; apply(preference); }
  });
})();
