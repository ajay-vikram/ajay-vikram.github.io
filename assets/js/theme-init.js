try {
  const theme = localStorage.getItem("portfolio-v2-theme");
  if (theme === "dark" || theme === "light") {
    document.documentElement.dataset.theme = theme;
  }
} catch (error) {
  // Storage may be disabled. The preview defaults to light in that case.
}
