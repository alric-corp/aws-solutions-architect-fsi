// External initialization applies the theme before CSS without relaxing CSP.
(() => {
  let preference = 'system';
  try {
    const raw = localStorage.getItem('architecture-practice:preferences:v1');
    if (raw) {
      try { const saved = JSON.parse(raw); if (['light', 'dark', 'system'].includes(saved?.theme)) preference = saved.theme; }
      catch { /* Ignore malformed preferences; preserve the original value. */ }
    }
  } catch { window.__architectureStorageUnavailable = true; }
  let systemDark = false;
  try { systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { /* Light fallback. */ }
  document.documentElement.dataset.theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  window.__architectureThemePreference = preference;
})();
