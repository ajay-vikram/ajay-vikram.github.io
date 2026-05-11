(function () {
  const root = document.documentElement;
  const storageKey = "theme";

  function getTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function updateToggle(button) {
    const isDark = getTheme() === "dark";
    const label = isDark ? "Light" : "Dark";
    const text = button.querySelector(".theme-toggle-text");

    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);

    if (text) {
      text.textContent = label;
    }
  }

  function setTheme(theme, button) {
    root.dataset.theme = theme;

    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Ignore storage failures in private browsing or locked-down environments.
    }

    if (button) {
      updateToggle(button);
    }
  }

  function initThemeToggle() {
    const button = document.getElementById("theme-toggle");

    if (!button) {
      return;
    }

    updateToggle(button);

    button.addEventListener("click", function () {
      setTheme(getTheme() === "dark" ? "light" : "dark", button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
