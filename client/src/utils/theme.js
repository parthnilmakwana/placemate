export const applyTheme = (theme = 'system') => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
  } else if (theme === 'dark') {
    root.classList.remove('light');
  } else {
    // system
    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (systemPrefersLight) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }
  localStorage.setItem('placemate_theme', theme);
};

export const initTheme = (userTheme) => {
  const savedTheme = userTheme || localStorage.getItem('placemate_theme') || 'system';
  applyTheme(savedTheme);
};
